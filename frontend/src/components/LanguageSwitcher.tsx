import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n/translations';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'am', label: 'አማ' },
  { code: 'om', label: 'OM' },
];

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 bg-surface border border-white/10 rounded-lg p-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`font-mono text-xs px-2.5 py-1 rounded-md transition-colors ${
            language === lang.code
              ? 'bg-signal text-bg'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
