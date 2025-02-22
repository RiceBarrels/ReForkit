import { NextResponse } from 'next/server'
import { getGitHubContents } from '@/app/actions/github';


export async function GET(request, { params }) {
  const { username, project, filepath, branch } = params;
  const path = filepath.join('/')
  try {
    const result = await getGitHubContents(username, project, path, branch, false);
    
    if (!result.success) {
      throw new Error(result.message);
    }

    // Extract content from response
    const content = result.content;
    const fileExtension = path.split('.').pop().toLowerCase();
    
    // Map common file extensions to MIME types
    const mimeTypes = {
      'html': 'text/html',
      'htm': 'text/html',
      'asp': 'text/html',
      'jsp': 'text/html',
      'php': 'text/html',
      'py': 'text/x-python',
      'xml': 'application/xml',
      'aspx': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'ico': 'image/x-icon',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      'bz2': 'application/x-bzip2',
      '7z': 'application/x-7z-compressed',
      'jsonl': 'application/jsonl',
      'csv': 'text/csv',
      'tsv': 'text/tab-separated-values',
      'yml': 'text/yaml',
      'yaml': 'text/yaml',
      'jif': 'image/jpeg',
      'tiff': 'image/tiff',
      'bmp': 'image/bmp',
    }
    
    const binaryExtensions = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'pdf', 'zip', 'tar', 'gz', 'bz2', '7z', 'jif', 'tiff', 'bmp']
    
    const contentType = mimeTypes[fileExtension] || 'text/plain'
    
    // Handle binary files differently
    if (binaryExtensions.includes(fileExtension)) {
      const rawUrl = content.download_url;
      const binaryResponse = await fetch(rawUrl);
      
      if (!binaryResponse.ok) {
        throw new Error('Failed to fetch binary file');
      }
      
      const arrayBuffer = await binaryResponse.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': fileExtension === 'pdf' ? 'inline' : 'attachment',
        },
      });
    }

    // For text files, decode the content if it's base64 encoded
    let decodedContent;
    if (content.encoding === 'base64') {
      decodedContent = Buffer.from(content.content, 'base64').toString('utf-8');
    } else {
      decodedContent = content.content;
    }

    return new NextResponse(decodedContent, {
      headers: {
        'Content-Type': contentType,
      },
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
  }
}
