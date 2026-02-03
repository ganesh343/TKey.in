import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import TypewriterCard from "./components/TypewriterCard.jsx";
import { LANGUAGES } from "./config/languages.js";

const App = () => {
  const activeLanguage = LANGUAGES[0];
  const [font, setFont] = useState(activeLanguage.defaultFont);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-100 px-5 py-8 transition-colors dark:bg-slate-950 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Header isDark={isDark} onToggle={() => setIsDark((prev) => !prev)} />
        <TypewriterCard
          fontValue={font}
          onFontChange={setFont}
          language={activeLanguage}
        />
      </div>
    </div>
  );
};

export default App;
