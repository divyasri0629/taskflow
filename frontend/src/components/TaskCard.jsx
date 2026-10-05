const priorityColor = {
  low: 'text-white/40 border-line',
  medium: 'text-warn border-warn/30',
  high: 'text-danger border-danger/30',
};

export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="bg-panel-light border border-line rounded-lg p-3 space-y-2 group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug">{task.title}</h3>
        <span className={`text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 shrink-0 ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-white/50 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-white/40">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button onClick={() => onEdit(task)} className="text-[11px] text-accent hover:underline">
            Edit
          </button>
          <button onClick={() => onDelete(task._id)} className="text-[11px] text-danger hover:underline">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
