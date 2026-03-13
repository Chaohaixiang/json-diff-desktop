import React from 'react';
import type { DiffResult } from '@/lib/diff';

interface ResultItemProps {
  item: DiffResult;
}

const typeLabelMap: Record<DiffResult['type'], string> = {
  added: '添加',
  removed: '删除',
  modified: '修改',
};

const typeColorMap: Record<DiffResult['type'], string> = {
  added:
    'bg-[color:var(--chip-added-bg)] border-[color:var(--chip-added-border)] text-emerald-300',
  removed:
    'bg-[color:var(--chip-removed-bg)] border-[color:var(--chip-removed-border)] text-rose-300',
  modified:
    'bg-[color:var(--chip-modified-bg)] border-[color:var(--chip-modified-border)] text-amber-200',
};

function formatValue(value: unknown): string {
  if (value === undefined) return '';
  try {
    const text = JSON.stringify(value);
    if (!text) return '';
    if (text.length > 80) {
      return `${text.slice(0, 77)}...`;
    }
    return text;
  } catch {
    return String(value);
  }
}

const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  const typeLabel = typeLabelMap[item.type];
  const badgeColor = typeColorMap[item.type];
  const oldText = formatValue(item.oldValue);
  const newText = formatValue(item.newValue);

  return (
    <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,3fr)] items-start gap-3 rounded-xl border border-border/40 bg-slate-900/40 px-4 py-2 mb-2">
      <div className="flex items-center">
        <span className="font-mono text-[11px] text-sky-300 cursor-default">
          {item.path}
        </span>
      </div>
      <div className="flex items-center">
        <span
          className={[
            'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
            badgeColor,
          ].join(' ')}
        >
          {typeLabel}
        </span>
      </div>
      <div className="flex items-center text-[11px] text-muted-foreground">
        {item.type === 'modified' && oldText && newText && (
          <>
            <span className="line-through mr-1">{oldText}</span>
            <span className="mx-1 text-slate-500">→</span>
            <span className="font-mono font-semibold text-emerald-200">
              {newText}
            </span>
          </>
        )}
        {item.type === 'added' && newText && (
          <span className="font-mono font-semibold text-emerald-200">
            {newText}
          </span>
        )}
        {item.type === 'removed' && oldText && (
          <span className="font-mono line-through text-rose-300">
            {oldText}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultItem;

