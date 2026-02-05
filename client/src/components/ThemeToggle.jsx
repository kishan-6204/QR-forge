import { MoonStar, Sun } from 'lucide-react';

export default function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="btn-secondary rounded-full p-3"
      aria-label="Toggle theme"
    >
      {darkMode ? <Sun size={18} /> : <MoonStar size={18} />}
    </button>
  );
}
