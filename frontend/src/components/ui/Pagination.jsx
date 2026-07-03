// Simple numeric pagination control.
const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;
  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  const Btn = ({ disabled, onClick, children, active }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`h-9 min-w-9 rounded-md border px-3 text-sm transition-colors disabled:opacity-40 ${
        active ? 'border-gold-600 bg-gold-600 text-white' : 'border-charcoal/15 bg-white hover:border-gold-500'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <Btn disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </Btn>
      {start > 1 && <Btn onClick={() => onChange(1)}>1</Btn>}
      {start > 2 && <span className="px-1">…</span>}
      {nums.map((n) => (
        <Btn key={n} active={n === page} onClick={() => onChange(n)}>
          {n}
        </Btn>
      ))}
      {end < pages && <span className="px-1">…</span>}
      {end < pages && <Btn onClick={() => onChange(pages)}>{pages}</Btn>}
      <Btn disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </Btn>
    </div>
  );
};

export default Pagination;
