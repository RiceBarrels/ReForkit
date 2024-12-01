import Editor from 'react-simple-code-editor';
import { Loader2 } from "lucide-react";
import Prism from 'prismjs';
import { getLanguageFromFileName } from '@/utils/editor-utils';

export default function EditorContent({ 
  fileLoading, 
  currentContent, 
  currentPath, 
  code, 
  setCode 
}) {
  if (fileLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin"/>
      </div>
    );
  }

  if (currentContent.type === 'image') {
    return (
      <div className="flex justify-center">
        <img 
          src={currentContent.url} 
          alt={currentPath}
          className="max-w-full h-auto"
          style={{ maxHeight: '90vh' }}
        />
      </div>
    );
  }

  if (code) {
    return (
      <div className="flex">
        <div className="line-numbers text-muted-foreground select-none pr-4 text-right flex-shrink-0">
          {code.split('\n').map((_, i) => (
            <div key={i + 1} className="editor-line-number">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="overflow-auto flex-1">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => {
              try {
                const language = getLanguageFromFileName(currentPath);
                if (!Prism.languages[language]) {
                  console.warn(`Language '${language}' not found, falling back to 'plaintext'`);
                  return code;
                }
                return Prism.highlight(code, Prism.languages[language], language);
              } catch (error) {
                console.error('Highlighting error:', error);
                return code;
              }
            }}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: 'var(--background)',
              borderRadius: '4px',
              minWidth: '100%',
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}
            className="editor-wrapper overflow-auto flex-1"
            textareaClassName="editor-textarea"
            preClassName="editor-pre"
          />
        </div>
      </div>
    );
  }

  return null;
} 