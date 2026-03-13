import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

export interface LineDecoration {
  lineNumber: number;
  className: string;
}

export interface InlineDecoration {
  lineNumber: number;
  startColumn: number;
  endColumn: number;
  className: string;
}

export interface JsonEditorProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  lineDecorations?: LineDecoration[];
  inlineDecorations?: InlineDecoration[];
  onEditorReady?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  placeholder,
  onChange,
  readOnly,
  lineDecorations = [],
  inlineDecorations = [],
  onEditorReady,
}) => {
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const decorationsRef = React.useRef<string[]>([]);

  const handleMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 13,
      lineHeight: 20,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
    });

    monacoInstance.editor.setTheme('vs-dark');
    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      trailingCommas: 'ignore',
    });

    if (onEditorReady) {
      onEditorReady(editor);
    }
  };

  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const decorations: monaco.editor.IModelDeltaDecoration[] = [];

    lineDecorations.forEach(d => {
      decorations.push({
        range: new monaco.Range(d.lineNumber, 1, d.lineNumber, 1),
        options: {
          isWholeLine: true,
          className: d.className,
        },
      });
    });

    inlineDecorations.forEach(d => {
      decorations.push({
        range: new monaco.Range(
          d.lineNumber,
          d.startColumn,
          d.lineNumber,
          d.endColumn,
        ),
        options: {
          inlineClassName: d.className,
        },
      });
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      decorations,
    );
  }, [lineDecorations, inlineDecorations]);

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={value}
      options={{
        readOnly,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
      }}
      onMount={handleMount}
      onChange={v => onChange(v ?? '')}
    />
  );
};

export default JsonEditor;

