import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import TypewriterCard from "./components/TypewriterCard.jsx";

const FONT_OPTIONS = [
  { label: "నోటో సాన్స్ తెలుగు", value: "\"Noto Sans Telugu\", sans-serif" },
  { label: "నోటో సెరిఫ్ తెలుగు", value: "\"Noto Serif Telugu\", serif" },
  { label: "అనేక్ తెలుగు", value: "\"Anek Telugu\", sans-serif" },
  { label: "బలూ తమ్ముడు 2", value: "\"Baloo Tammudu 2\", cursive" },
  { label: "అకయా తెలివిగల", value: "\"Akaya Telivigala\", cursive" },
  { label: "చతుర", value: "\"Chathura\", sans-serif" },
  { label: "పొట్టి శ్రీరాములు", value: "\"Potti Sreeramulu\", cursive" },
  { label: "మండలి", value: "\"Mandali\", sans-serif" },
  { label: "గిడుగు", value: "\"Gidugu\", sans-serif" },
  { label: "మల్లన్న", value: "\"Mallanna\", sans-serif" },
  { label: "రామభద్ర", value: "\"Ramabhadra\", sans-serif" },
  { label: "సురన్న", value: "\"Suranna\", serif" },
  { label: "తెనాలి రామకృష్ణ", value: "\"Tenali Ramakrishna\", serif" },
  { label: "గురజాడ", value: "\"Gurajada\", serif" },
  { label: "వేమన 2000", value: "\"Vemana 2000\", serif" },
  { label: "లక్కీ రెడ్డి", value: "\"Lakki Reddy\", cursive" },
  { label: "గౌతమీ", value: "Gautami, \"Noto Sans Telugu\", sans-serif" },
  { label: "వాణి", value: "Vani, \"Noto Sans Telugu\", sans-serif" },
  { label: "నిర్మలా UI", value: "\"Nirmala UI\", \"Noto Sans Telugu\", sans-serif" },
  { label: "విజయ", value: "Vijaya, \"Noto Sans Telugu\", serif" },
  { label: "రఘు తెలుగు", value: "\"Raghu Telugu\", \"Noto Sans Telugu\", sans-serif" },
  { label: "లోహిత తెలుగు", value: "\"Lohit Telugu\", \"Noto Sans Telugu\", sans-serif" },
  { label: "పోతన 2000", value: "\"Pothana2000\", \"Noto Sans Telugu\", serif" },
  { label: "ధూర్జటి", value: "\"Dhurjati\", \"Noto Sans Telugu\", sans-serif" },
  { label: "సీలా వీర్రాజు", value: "\"Seela Veerraju\", \"Noto Sans Telugu\", sans-serif" },
  { label: "అక్షర తెలుగు", value: "\"Akshar Telugu\", \"Noto Sans Telugu\", sans-serif" },
  { label: "తెలుగు సరళ", value: "\"Telugu Sarala\", \"Noto Sans Telugu\", sans-serif" },
  { label: "తెలుగు కృష్ణ", value: "\"Telugu Krishna\", \"Noto Sans Telugu\", sans-serif" },
];

const App = () => {
  const [font, setFont] = useState(FONT_OPTIONS[0].value);
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
          fontOptions={FONT_OPTIONS}
        />
      </div>
    </div>
  );
};

export default App;
