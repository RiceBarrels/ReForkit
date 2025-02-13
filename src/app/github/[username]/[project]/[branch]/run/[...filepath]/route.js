import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server';
import { getGitHubTokens } from '@/app/actions/github';
import { Octokit } from '@octokit/rest'


export async function GET(request, { params }) {
  const { username, project, filepath, branch } = params;
  const path = filepath.join('/')
  const session = await auth();
  const { userId } = session;
  
  try {
    const tokens = await getGitHubTokens(userId);
    const octokit = tokens ? new Octokit({ auth: tokens.accessToken }) : new Octokit()

    // Get the raw file content using Octokit's REST API
    const response = await octokit.rest.repos.getContent({
      owner: username,
      repo: project,
      path: path,
      ref: branch,
      mediaType: {
        format: 'raw'
      }
    });

    // Extract content from response
    const content = response.data;
    const fileExtension = path.split('.').pop().toLowerCase();
    
    // Map common file extensions to MIME types
    const mimeTypes = {
      'html': 'text/html',
      'htm': 'text/html',
      'asp': 'text/html', // Changed from 'text/asp' to 'text/html'
      'jsp': 'text/html', // Changed from 'text/jsp' to 'text/html'
      'php': 'text/html', // Changed from 'text/php' to 'text/html'
      'py': 'text/x-python', // Changed from 'text/python' to 'text/x-python'
      'xml': 'application/xml',
      'aspx': 'text/html', // Changed from 'text/asp.net' to 'text/html'
      'css': 'text/css',
      'js': 'application/javascript', // Changed from 'text/javascript' to 'application/javascript'
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
      const rawUrl = `https://raw.githubusercontent.com/${username}/${project}/${branch}/${path}`;
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

    // For text files
    return new NextResponse(content, {
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
