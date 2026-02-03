const Toggle = ({ enabled, onToggle }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-9 w-16 items-center rounded-full border transition ${
        enabled
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`inline-block h-7 w-7 transform rounded-full transition ${
          enabled
            ? "translate-x-8 bg-white"
            : "translate-x-1 bg-slate-200"
        }`}
      />
    </button>
  );
};

export default Toggle;
