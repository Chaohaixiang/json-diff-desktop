import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditorPanel from '../Editor/EditorPanel';
import type { DiffResult } from '@/lib/diff';
import type { InlineDecoration, LineDecoration } from '../Editor/JsonEditor';

export interface DiffViewerProps {
  left: string;
  right: string;
  results: DiffResult[];
  onChangeLeft: (value: string) => void;
  onChangeRight: (value: string) => void;
  onClearLeft: () => void;
  onClearRight: () => void;
}

interface Decorations {
  lines: LineDecoration[];
  inline: InlineDecoration[];
}

function buildDecorationsForSide(
  json: string,
  side: 'left' | 'right',
  results: DiffResult[],
): Decorations {
  const lines: LineDecoration[] = [];
  const inline: InlineDecoration[] = [];

  if (!json.trim() || results.length === 0) {
    return { lines, inline };
  }

  const rows = json.split(/\r?\n/);

  const findLineForKey = (key: string): number | null => {
    const quoted = `"${key}"`;
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].includes(quoted)) {
        return i + 1;
      }
    }
    return null;
  };

  const findValuePosition = (
    raw: unknown,
  ): { lineNumber: number; startColumn: number; endColumn: number } | null => {
    if (raw === undefined) return null;
    try {
      const text = JSON.stringify(raw);
      if (!text) return null;
      for (let i = 0; i < rows.length; i += 1) {
        const idx = rows[i].indexOf(text);
        if (idx !== -1) {
          const startColumn = idx + 1;
          const endColumn = idx + text.length + 1;
          return { lineNumber: i + 1, startColumn, endColumn };
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  results.forEach(item => {
    const pathParts = item.path.split('.');
    const lastSegment = pathParts[pathParts.length - 1];
    const cleanKey = lastSegment.replace(/\[.*\]$/, '');

    const lineNumber = findLineForKey(cleanKey);
    if (!lineNumber) return;

    if (item.type === 'added' && side === 'right') {
      lines.push({ lineNumber, className: 'editor-line-added' });
      const valuePos = findValuePosition(item.newValue);
      if (valuePos) {
        inline.push({
          ...valuePos,
          className: 'editor-inline-added',
        });
      }
    } else if (item.type === 'removed' && side === 'left') {
      lines.push({ lineNumber, className: 'editor-line-removed' });
      const valuePos = findValuePosition(item.oldValue);
      if (valuePos) {
        inline.push({
          ...valuePos,
          className: 'editor-inline-removed',
        });
      }
    } else if (item.type === 'modified') {
      lines.push({ lineNumber, className: 'editor-line-modified' });
      if (side === 'left') {
        const valuePos = findValuePosition(item.oldValue);
        if (valuePos) {
          inline.push({
            ...valuePos,
            className: 'editor-inline-modified',
          });
        }
      } else if (side === 'right') {
        const valuePos = findValuePosition(item.newValue);
        if (valuePos) {
          inline.push({
            ...valuePos,
            className: 'editor-inline-modified',
          });
        }
      }
    }
  });

  return { lines, inline };
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  left,
  right,
  results,
  onChangeLeft,
  onChangeRight,
  onClearLeft,
  onClearRight,
}) => {
  const { t } = useTranslation();

  const leftDecorations = useMemo(
    () => buildDecorationsForSide(left, 'left', results),
    [left, results],
  );
  const rightDecorations = useMemo(
    () => buildDecorationsForSide(right, 'right', results),
    [right, results],
  );

  return (
    <div className="h-[60vh] grid grid-cols-2 gap-x-2 px-4 pt-4 pb-2 bg-[color:var(--panel-background)]">
      <EditorPanel
        title={t('editor.leftTitle')}
        value={left}
        onChange={onChangeLeft}
        onClear={onClearLeft}
        lineDecorations={leftDecorations.lines}
        inlineDecorations={leftDecorations.inline}
      />
      <EditorPanel
        title={t('editor.rightTitle')}
        value={right}
        onChange={onChangeRight}
        onClear={onClearRight}
        lineDecorations={rightDecorations.lines}
        inlineDecorations={rightDecorations.inline}
      />
    </div>
  );
};

export default DiffViewer;

