import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

const CodeEditor = ({ value, onChange, language, readOnly = false }) => {
  // Map our language strings to CodeMirror extensions
  const getLanguageExtension = (lang) => {
    switch (lang) {
      case 'cpp': return cpp();
      case 'python': return python();
      case 'java': return java();
      default: return cpp();
    }
  };

  return (
    <div className="code-editor-wrapper">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[getLanguageExtension(language)]}
        theme={vscodeDark}
        onChange={(val) => {
          if (onChange) onChange(val);
        }}
        readOnly={readOnly}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
