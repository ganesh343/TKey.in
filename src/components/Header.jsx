import Toggle from "./Toggle.jsx";

const Header = ({ isDark, onToggle }) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
          Peru
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Telugu Typewriter
        </h1>
        <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
          Type in English, watch it appear instantly in Telugu.
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>Dark mode</span>
        <Toggle enabled={isDark} onToggle={onToggle} />
      </div>
    </header>
  );
};

export default Header;
