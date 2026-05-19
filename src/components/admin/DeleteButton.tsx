'use client';

export function DeleteButton({
  id,
  action,
  confirmMessage = 'Are you sure you want to delete this?',
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  confirmMessage?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs uppercase tracking-widest opacity-40 hover:opacity-100"
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
