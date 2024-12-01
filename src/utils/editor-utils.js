export const getLanguageFromFileName = (filename) => {
  if (!filename) return 'javascript';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cs: 'csharp',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'bash',
    bash: 'bash',
    sql: 'sql',
    php: 'php',
    html: 'markup',
    htm: 'markup',
  };

  return languageMap[extension] || 'jsx';
};

export const truncateFileName = (fileName, maxLength = 20) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
  const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - extension.length);
  return `${truncatedName}...${extension}`;
};

export const isImageFile = (filename) => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}; 