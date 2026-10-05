# Deploying TaskFlow to AWS

This sets up: **backend on an EC2 instance** (Node + PM2 + Nginx reverse proxy),
**frontend built as static files served by the same Nginx**, and **MongoDB Atlas**
(managed, free tier) instead of running Mongo yourself. This is the standard,
resume-defensible pattern — you won't be running a database on the same box as
your app.

If you already did the AWS EC2 + Nginx + CloudWatch project, this reuses the
same core skills, so most of this will feel familiar.

---

## 0. Prerequisites

- AWS account (free tier is enough)
- MongoDB Atlas account (free M0 cluster)
- A domain name is optional — you can use the EC2 public IP for a resume demo

---

## 1. Set up MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a user with a strong password
3. Network Access → add IP `0.0.0.0/0` (fine for a demo project; for production
   you'd restrict this to your EC2's IP)
4. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow`

---

## 2. Launch the EC2 instance

1. EC2 → Launch instance
2. Ubuntu 22.04 LTS, **t2.micro** (free tier eligible)
3. Create/select a key pair (download the `.pem`)
4. Security group — allow inbound:
   - SSH (22) — your IP only
   - HTTP (80) — anywhere
   - HTTPS (443) — anywhere (if you add a domain + certbot later)
5. Launch, then note the public IP

Connect:
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 3. Install Node, PM2, Nginx on the instance

```bash
sudo apt update && sudo apt upgrade -y

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 — keeps the Node process alive, restarts on crash/reboot
sudo npm install -g pm2

# Nginx — reverse proxy + serves the built frontend
sudo apt install -y nginx
```

---

## 4. Deploy the backend

From your local machine, copy the backend folder up (or `git clone` your repo
on the instance — cleaner if you push this project to GitHub first):

```bash
scp -i your-key.pem -r backend ubuntu@<EC2_PUBLIC_IP>:~/taskflow-backend
```

On the instance:
```bash
cd ~/taskflow-backend
npm install --production

# create the real .env (don't commit this)
nano .env
```
Fill in:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow
JWT_SECRET=<generate with: openssl rand -base64 32>
CLIENT_ORIGIN=http://<EC2_PUBLIC_IP>
```

Start it under PM2:
```bash
pm2 start server.js --name taskflow-api
pm2 save
pm2 startup   # run the command it prints, so PM2 survives a reboot
```

Sanity check:
```bash
curl localhost:5000/api/health
# {"status":"ok"}
```

---

## 5. Build and deploy the frontend

Build **locally** (or on the instance — either works), pointing at your live API:

```bash
cd frontend
echo "VITE_API_URL=http://<EC2_PUBLIC_IP>/api" > .env
npm install
npm run build
```

Copy the `dist/` folder to the instance:
```bash
scp -i your-key.pem -r dist ubuntu@<EC2_PUBLIC_IP>:~/taskflow-frontend
```

On the instance:
```bash
sudo mkdir -p /var/www/taskflow
sudo cp -r ~/taskflow-frontend/* /var/www/taskflow/
```

---

## 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/taskflow
```

```nginx
server {
    listen 80;
    server_name <EC2_PUBLIC_IP>;   # swap for your domain if you have one

    # Serve the React build
    root /var/www/taskflow;
    index index.html;

    location / {
        try_files $uri /index.html;   # SPA routing fallback
    }

    # Reverse-proxy API calls to the Node process
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t          # test config
sudo systemctl restart nginx
```

Visit `http://<EC2_PUBLIC_IP>` — the app should load, and register/login should
hit the API through Nginx.

---

## 7. (Optional) HTTPS with a domain

If you point a domain at the EC2 IP (an A record), you can get free HTTPS:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
Certbot edits the Nginx config and sets up auto-renewal for you.

---

## 8. (Optional) CloudWatch monitoring

Since you've already done EC2 + CloudWatch before, the pattern is the same:
1. Install the CloudWatch agent on the instance
2. Push basic metrics (CPU, memory, disk) and PM2 logs (`pm2 logs` output)
3. Set a simple alarm (e.g. CPU > 80% for 5 minutes) so you have something
   concrete to talk about in an SRE interview — "I set up basic health
   monitoring and an alarm on my deployed project."

---

## Architecture summary (for your resume/README)

```
Browser → Nginx (EC2, port 80)
            ├── / → static React build (Vite)
            └── /api/ → reverse proxy → Node/Express (PM2, port 5000)
                                            └── MongoDB Atlas (managed)
```

Talking points this gives you for interviews:
- Reverse proxy pattern (Nginx → Node)
- Process management / auto-restart (PM2)
- Separation of static assets vs API
- Managed DB instead of self-hosting (fewer moving parts to operate)
- JWT-based stateless auth
- Clear path to add HTTPS, CloudWatch monitoring, and CI/CD later
