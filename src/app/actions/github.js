'use server'

import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { Octokit } from "@octokit/core";


// Initialize Clerk client
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function fetchGitHubRepos() {
  try {
    const session = await auth();
    
    const { userId } = session;
    if (!userId) {
      return {
        connected: false,
        repos: [],
        message: 'User not authenticated'
      };
    }

    const tokens = await getGitHubTokens(userId);
    if (!tokens?.data || !Array.isArray(tokens.data) || tokens.data.length === 0) {
      return {
        connected: false,
        repos: [],
        message: 'GitHub account not connected'
      };
    }

    const githubToken = tokens.data[0]?.token;
    
    if (!githubToken) {
      return {
        connected: false,
        repos: [],
        message: 'No valid GitHub token found'
      };
    }

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        return {
          connected: false,
          repos: [],
          message: 'GitHub authentication expired. Please reconnect your account.'
        };
      }
      if (response.status === 403) {
        return {
          connected: false,
          repos: [],
          message: 'GitHub API rate limit exceeded. Please try again later.'
        };
      }
      throw new Error(`Failed to fetch repositories: ${response.status} ${errorData.message || ''}`);
    }
    
    const repos = await response.json();
    return {
      connected: true,
      repos,
      message: null
    };

  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      connected: false,
      repos: [],
      message: error.message || 'Failed to fetch repositories'
    };
  }
}

async function getGitHubTokens(userId) {
  try {
    const tokens = await clerk.users.getUserOauthAccessToken(
      userId,
      'oauth_github'
    );
    return tokens;
  } catch (error) {
    console.error('Error fetching GitHub tokens:', error);
    return { data: [] };
  }
}

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

export async function fetchGitHubFile(owner, repo, path = '') {
  try {
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const tokens = await getGitHubTokens(userId);
    
    if (!tokens?.data || !Array.isArray(tokens.data) || tokens.data.length === 0) {
      return {
        success: false,
        message: 'GitHub account not connected'
      };
    }

    const githubToken = tokens.data[0]?.token;
    
    if (!githubToken) {
      return {
        success: false,
        message: 'No valid GitHub token found'
      };
    }

    // Initialize Octokit with the Clerk-provided GitHub token
    const octokit = new Octokit({
      auth: githubToken
    });

    // Make the API request
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // If the response is an array, it's a directory listing
    if (Array.isArray(response.data)) {
      return {
        success: true,
        content: response.data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          download_url: item.download_url
        }))
      };
    }

    // If it's not an array, it's a file's contents
    if (response.data.content) {
      const content = Buffer.from(response.data.content, 'base64').toString();
      return {
        success: true,
        content,
        type: 'file'
      };
    }

    throw new Error('Invalid response format from GitHub API');

  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch from GitHub'
    };
  }
}