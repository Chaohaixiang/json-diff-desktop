import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiffResult } from '@/lib/diff';
import ResultItem from './ResultItem';

interface ResultPanelProps {
  results: DiffResult[];
  error: string | null;
  hasInput: boolean;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  results,
  error,
  hasInput,
}) => {
  const { t } = useTranslation();
  const sorted = useMemo(() => {
    const order: Record<DiffResult['type'], number> = {
      modified: 0,
      added: 1,
      removed: 2,
    };
    return [...results].sort(
      (a, b) =>
        order[a.type] - order[b.type] || a.path.localeCompare(b.path),
    );
  }, [results]);

  const changeCount = sorted.length;

  const isMissingSideError = error === '__missing_side__';

  let stateLabel: string;
  if (error) {
    stateLabel = isMissingSideError
      ? t('result.missingSide')
      : t('result.error');
  } else if (!hasInput) {
    stateLabel = t('result.empty');
  } else if (changeCount === 0) {
    stateLabel = t('result.identical');
  } else {
    stateLabel = t('result.changes', { count: changeCount });
  }

  return (
    <section className="h-[30vh] flex flex-col bg-[color:var(--panel-background)]">
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/70 text-xs bg-[color:var(--panel-elevated)]/90">
        <div className="flex items-center gap-2">
          <span className="font-medium tracking-tight">
            {t('result.title')}
          </span>
          {changeCount > 0 && !error && (
            <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {t('result.changes', { count: changeCount })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[color:var(--chip-added-border)]" />
            {t('result.added')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[color:var(--chip-removed-border)]" />
            {t('result.removed')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[color:var(--chip-modified-border)]" />
            {t('result.modified')}
          </span>
        </div>
      </div>
      {error && (
        <div className="px-4 py-2 text-[11px] text-amber-300 bg-amber-500/10 border-b border-amber-500/40">
          {stateLabel}
        </div>
      )}
      {!error && changeCount === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
          {stateLabel}
        </div>
      ) : null}
      {!error && changeCount > 0 && (
        <div className="flex-1 overflow-auto text-xs px-2 py-2">
          {sorted.map(item => (
            <ResultItem key={item.path + item.type} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ResultPanel;

