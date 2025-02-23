import Prism, { highlight, languages } from 'prismjs/components/prism-core';

// Base language support - must be loaded first
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';

// Additional languages that depend on clike - load after base languages
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Independent languages - can be loaded in any order
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-markdown';

// Only initialize Prism on the client side
if (typeof window !== 'undefined') {
  window.Prism = window.Prism || Prism;
}

// Ensure base languages are registered
if (!Prism.languages.clike) {
  console.warn('Base language "clike" not loaded properly');
}

// Add debug logging to track language loading
const initializePrismLanguages = () => {
  // Check base language loading
  if (!Prism.languages.clike) {
    console.error('Critical: Base language "clike" failed to load');
    return;
  }

  // Define supported languages with their dependencies
  const languageDefinitions = {
    markup: { lang: 'markup', deps: [] },
    javascript: { lang: 'javascript', deps: ['clike'] },
    java: { lang: 'java', deps: ['clike'] },
    csharp: { lang: 'csharp', deps: ['clike'] },
    typescript: { lang: 'typescript', deps: ['javascript'] },
    jsx: { lang: 'jsx', deps: ['javascript'] },
    tsx: { lang: 'tsx', deps: ['jsx', 'typescript'] },
    python: { lang: 'python', deps: [] },
    css: { lang: 'css', deps: [] },
    json: { lang: 'json', deps: [] },
    yaml: { lang: 'yaml', deps: [] }, 
    bash: { lang: 'bash', deps: [] },
    ruby: { lang: 'ruby', deps: [] },
    sql: { lang: 'sql', deps: [] },
    php: { lang: 'php', deps: ['clike'] },
    markdown: { lang: 'markdown', deps: [] }
  };

  // Register languages in correct order
  Object.entries(languageDefinitions).forEach(([key, { lang, deps }]) => {
    // Check if all dependencies are loaded
    const depsLoaded = deps.every(dep => Prism.languages[dep]);
    if (!depsLoaded) {
      console.error(`Cannot load ${lang}: missing dependencies ${deps.filter(dep => !Prism.languages[dep])}`);
      return;
    }

    // Verify language is properly loaded
    if (!Prism.languages[lang]) {
      console.error(`Failed to load language: ${lang}`);
    }
  });
};

// Initialize languages
initializePrismLanguages();

export const truncateFileName = (fileName, maxLength = 20) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
  const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - extension.length);
  return `${truncatedName}...${extension}`;
};

export function getLanguageFromFileName(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const langMap = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    cs: 'csharp',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    xml: 'xml',
    yml: 'yaml',
    go: 'go',
    php: 'php',
    rb: 'ruby'
  };
  return langMap[ext] || 'plaintext';
}

