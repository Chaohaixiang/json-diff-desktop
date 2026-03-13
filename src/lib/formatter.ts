export interface FormatResult {
  value: string;
  error: string | null;
}

export function formatJson(text: string): FormatResult {
  if (!text.trim()) {
    return { value: '', error: null };
  }

  try {
    const parsed = JSON.parse(text);
    const value = JSON.stringify(parsed, null, 2);
    return { value, error: null };
  } catch (e) {
    return { value: text, error: (e as Error).message };
  }
}

export function isValidJson(text: string): boolean {
  if (!text.trim()) return true;
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

