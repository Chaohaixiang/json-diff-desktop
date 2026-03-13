import React, { useState } from 'react';
import DiffViewer from './components/DiffViewer/DiffViewer';
import ResultPanel from './components/ResultPanel/ResultPanel';
import Toolbar from './components/Toolbar/Toolbar';
import { useJsonDiff } from '@/hooks/useJsonDiff';
import { isValidJson, formatJson } from '@/lib/formatter';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';

const App: React.FC = () => {
  const [jsonLeft, setJsonLeft] = useState('');
  const [jsonRight, setJsonRight] = useState('');

  const [theme, setTheme] = useTheme();
  const [language, setLanguage] = useLanguage();

  const { results, error } = useJsonDiff(jsonLeft, jsonRight);

  const hasInput = jsonLeft.trim().length > 0 || jsonRight.trim().length > 0;

  const canFormat =
    isValidJson(jsonLeft) && isValidJson(jsonRight) && hasInput && !error;

  const handleFormat = () => {
    if (!canFormat) return;
    const left = formatJson(jsonLeft);
    const right = formatJson(jsonRight);
    if (!left.error) {
      setJsonLeft(left.value);
    }
    if (!right.error) {
      setJsonRight(right.value);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const languageLabel = language === 'zh' ? '中' : 'EN';
  const themeLabel = theme === 'dark' ? '🌙' : '☀️';

  return (
    <div className="app-shell">
      <div className="app-card">
        <div className="app-card-gradient" />
        <div className="app-card-inner">
          <Toolbar
            onFormat={handleFormat}
            onToggleLanguage={toggleLanguage}
            onToggleTheme={toggleTheme}
            canFormat={canFormat}
            languageLabel={languageLabel}
            themeLabel={themeLabel}
          />
          <main className="flex-1 flex flex-col divide-y divide-border/60">
            <div className="flex-1">
              <DiffViewer
                left={jsonLeft}
                right={jsonRight}
                results={results}
                onChangeLeft={setJsonLeft}
                onChangeRight={setJsonRight}
                onClearLeft={() => setJsonLeft('')}
                onClearRight={() => setJsonRight('')}
              />
            </div>
            <ResultPanel results={results} error={error} hasInput={hasInput} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;

