import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { username, project, filepath } = params
  const path = filepath.join('/')
  
  try {
    // Try main branch first
    let response = await fetch(
      `https://raw.githubusercontent.com/${username}/${project}/main/${path}`
    )

    if (!response.ok) {
      // If main fails, try master branch
      response = await fetch(
        `https://raw.githubusercontent.com/${username}/${project}/master/${path}`
      )
    }

    if (!response.ok) {
      throw new Error('Failed to fetch file')
    }

    const content = await response.text()
    const fileExtension = path.split('.').pop().toLowerCase()
    
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
      // Get a fresh response for binary files to ensure proper streaming
      const binaryResponse = await fetch(response.url)
      if (!binaryResponse.ok) {
        throw new Error('Failed to fetch binary file')
      }
      
      const arrayBuffer = await binaryResponse.arrayBuffer()
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': fileExtension === 'pdf' ? 'inline' : 'attachment',
        },
      })
    }
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch HTML content' },
      { status: 500 }
    )
  }
}
