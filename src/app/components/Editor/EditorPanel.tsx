import React from 'react';
import { useTranslation } from 'react-i18next';
import JsonEditor, { InlineDecoration, LineDecoration } from './JsonEditor';

interface EditorPanelProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  lineDecorations?: LineDecoration[];
  inlineDecorations?: InlineDecoration[];
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  title,
  value,
  onChange,
  onClear,
  lineDecorations,
  inlineDecorations,
}) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col border border-border/60 bg-[color:var(--editor-background)]/95 rounded-2xl overflow-hidden mx-3 my-3 shadow-[0_18px_45px_rgba(15,23,42,0.65)]">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] border-b border-border/70 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40">
        <span className="font-medium tracking-tight text-xs">{title}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-[color:var(--muted)] transition-colors"
          onClick={onClear}
        >
          {t('editor.clear')}
        </button>
      </div>
      <div className="flex-1">
        <JsonEditor
          value={value}
          onChange={onChange}
          lineDecorations={lineDecorations}
          inlineDecorations={inlineDecorations}
        />
      </div>
    </section>
  );
};

export default EditorPanel;

