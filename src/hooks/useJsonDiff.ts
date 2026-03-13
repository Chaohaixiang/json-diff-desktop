import { useEffect, useMemo, useState } from 'react';
import { computeDiff, DiffResult } from '@/lib/diff';

export const MISSING_SIDE_ERROR = '__missing_side__';

interface UseJsonDiffState {
  results: DiffResult[];
  error: string | null;
  loading: boolean;
}

export function useJsonDiff(left: string, right: string): UseJsonDiffState {
  const [state, setState] = useState<UseJsonDiffState>({
    results: [],
    error: null,
    loading: false,
  });

  const inputs = useMemo(() => ({ left, right }), [left, right]);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      if (cancelled) return;

      const leftTrimmed = inputs.left.trim();
      const rightTrimmed = inputs.right.trim();

      if (!leftTrimmed && !rightTrimmed) {
        setState({ results: [], error: null, loading: false });
        return;
      }

      if (!leftTrimmed || !rightTrimmed) {
        setState({
          results: [],
          error: MISSING_SIDE_ERROR,
          loading: false,
        });
        return;
      }

      setState(prev => ({ ...prev, loading: true }));
      const { results, error } = computeDiff(inputs.left, inputs.right);
      if (cancelled) return;
      setState({ results, error, loading: false });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [inputs]);

  return state;
}

