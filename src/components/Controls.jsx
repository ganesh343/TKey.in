import Select from "./Select.jsx";

const Controls = ({ fontValue, onFontChange, fontOptions }) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Select
        label="Font"
        value={fontValue}
        onChange={onFontChange}
        options={fontOptions}
      />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Type in English and see Telugu appear instantly, like a typewriter.
      </div>
    </section>
  );
};

export default Controls;
