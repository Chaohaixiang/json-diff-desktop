import * as jsondiffpatch from 'jsondiffpatch';

export type DiffType = 'added' | 'removed' | 'modified';

export interface DiffResult {
  path: string;
  type: DiffType;
  oldValue?: unknown;
  newValue?: unknown;
}

const differ = jsondiffpatch.create({
  textDiff: { minLength: 1 },
});

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function joinPath(parent: string, key: string): string {
  if (!parent) return key;
  if (key.startsWith('[')) {
    return `${parent}${key}`;
  }
  return `${parent}.${key}`;
}

function flattenDelta(
  delta: unknown,
  parentPath = '',
  results: DiffResult[] = [],
): DiffResult[] {
  if (!isObjectLike(delta)) {
    return results;
  }

  const isArrayDelta = delta._t === 'a';

  for (const rawKey of Object.keys(delta)) {
    if (rawKey === '_t') continue;

    const value = (delta as Record<string, unknown>)[rawKey];
    const key = isArrayDelta ? `[${rawKey}]` : rawKey;
    const currentPath = joinPath(parentPath, key);

    if (Array.isArray(value)) {
      const [oldVal, newVal, flag] = value as [unknown?, unknown?, unknown?];

      if (flag === 0) {
        results.push({
          path: currentPath,
          type: 'removed',
          oldValue: oldVal,
        });
      } else if (flag === 2) {
        results.push({
          path: currentPath,
          type: 'added',
          newValue: newVal,
        });
      } else if (value.length === 2) {
        results.push({
          path: currentPath,
          type: 'modified',
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    } else if (isObjectLike(value)) {
      flattenDelta(value, currentPath, results);
    }
  }

  return results;
}

export function computeDiff(
  left: string,
  right: string,
): { results: DiffResult[]; error: string | null } {
  if (!left && !right) {
    return { results: [], error: null };
  }

  try {
    const leftObj = left ? JSON.parse(left) : undefined;
    const rightObj = right ? JSON.parse(right) : undefined;

    const delta = differ.diff(leftObj, rightObj);
    if (!delta) {
      return { results: [], error: null };
    }

    const results = flattenDelta(delta);
    return { results, error: null };
  } catch (e) {
    return { results: [], error: (e as Error).message };
  }
}

