interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="toast"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--color-text-primary)',
        color: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)',
        zIndex: 100,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
}
