import React from 'react';
import { useTranslation } from 'react-i18next';

interface ToolbarProps {
  onFormat: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  canFormat: boolean;
  languageLabel: string;
  themeLabel: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onToggleLanguage,
  onToggleTheme,
  canFormat,
  languageLabel,
  themeLabel,
}) => {
  const { t } = useTranslation();

  return (
    <header className="h-12 px-4 border-b border-border flex items-center justify-between">
      <div className="font-semibold text-sm">JSON Diff</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          className={`px-2 py-1 rounded border border-border/60 ${
            canFormat
              ? 'hover:bg-muted cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
          }`}
          onClick={canFormat ? onFormat : undefined}
        >
          {t('toolbar.format')}
        </button>
        <span className="px-2 py-1 rounded border border-border/60">
          {t('toolbar.diff')}
        </span>
        <button
          type="button"
          className="px-2 py-1 rounded border border-border/60 hover:bg-muted cursor-pointer"
          onClick={onToggleLanguage}
        >
          {languageLabel}
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded border border-border/60 hover:bg-muted cursor-pointer"
          onClick={onToggleTheme}
        >
          {themeLabel}
        </button>
      </div>
    </header>
  );
};

export default Toolbar;

