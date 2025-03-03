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

export async function getGitHubTokens(userId=' ') {
  try {
    if (userId === ' ') {
      const session = await auth();
      userId = session;
    }
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
    let response = await fetch(
      `https://raw.githubusercontent.com/${username}/${project}/${getDefaultBranch(username,project)}/${path}`
    )

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

export async function getGitHubContents(owner, repo, path = '', branch, isAuthRequired = true) {
  try {
    // Always try to get auth token first
    const session = await auth();
    const { userId } = session;
    let octokit;

    if (userId) {
      const tokens = await getGitHubTokens(userId);
      const githubToken = tokens?.data?.[0]?.token;
      
      if (githubToken) {
        octokit = new Octokit({ auth: githubToken });
      }
    }

    // If no auth token available and not required, use unauthenticated client
    if (!octokit) {
      if (isAuthRequired) {
        return {
          success: false,
          message: 'Authentication required to access this repository'
        };
      }
      octokit = new Octokit();
    }

    // Make the API request with the correct endpoint
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      ...(branch ? { ref: branch } : {}),
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      content: response.data
    };

  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.status === 404 
        ? 'Repository or file not found. The repository might be private.'
        : error.message || 'Failed to fetch from GitHub'
    };
  }
}

export async function getDefaultBranch(owner, repo) {
  try {
    const session = await auth();
    const { userId } = session;
    const tokens = await getGitHubTokens(userId);
    const githubToken = tokens.data[0]?.token;
    const octokit = userId ? new Octokit({auth: githubToken}) : new Octokit();

    // Make the API request
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      default_branch: response.data.default_branch
    };

  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch default branch'
    };
  }
}

export async function getBranches(owner, repo) {
  try {
    const session = await auth();
    const { userId } = session;
    const tokens = await getGitHubTokens(userId);
    const githubToken = tokens.data[0]?.token;

    console.log('GitHub token:', githubToken);

    
    const octokit = userId ? new Octokit({auth: githubToken}) : new Octokit();

    // Make the API request
    const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log('Branches response:', response);

    return {
      success: true,
      branches: response.data
    };

  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch branches'
    };
  }
}

export async function forkRepository(owner, repo) {
  try {
    const session = await auth();
    const { userId } = session;
    const tokens = await getGitHubTokens(userId);
    const githubToken = tokens.data[0]?.token;

    if (!githubToken) {
      return {
        success: false,
        message: 'No valid GitHub token found'
      };
    }

    const octokit = new Octokit({ auth: githubToken });

    const response = await octokit.request('POST /repos/{owner}/{repo}/forks', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      message: 'Repository forked successfully',
      response: response
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fork repository'
    };
  }
}

export async function updateFile(owner, repo, path, branch, content) {
  try {
    const session = await auth();
    const { userId } = session;
    const tokens = await getGitHubTokens(userId);
    const githubToken = tokens.data[0]?.token;

    if (!githubToken) {
      return {
        success: false,
        message: 'No valid GitHub token found'
      };
    }

    const octokit = new Octokit({ auth: githubToken });

    // Get default branch if not provided
    let targetBranch = branch;
    if (!targetBranch) {
      const defaultBranchResult = await getDefaultBranch(owner, repo);
      if (!defaultBranchResult.success) {
        return {
          success: false,
          message: 'Failed to determine default branch'
        };
      }
      targetBranch = defaultBranchResult.default_branch;
    }

    // First get existing file SHA
    let sha = '';
    try {
      const existingFile = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path,
        ref: targetBranch
      });
      sha = existingFile.data.sha;
    } catch (error) {
      if (error.status !== 404) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to check existing file'
        };
      }
    }

    const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      message: 'Update via Reforkit: ' + new Date().toISOString(),
      content: Buffer.from(content).toString('base64'),
      branch: targetBranch,
      sha // Include SHA if file exists
    });

    return {
      success: true,
      message: 'File updated successfully',
      response: response.data
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update file'
    };
  }
}

export async function createBranch(owner, repo, fromBranch, branchName) {
  try {
    const session = await auth();
    const { userId } = session;
    const tokens = await getGitHubTokens(userId);
    const githubToken = tokens.data[0]?.token;

    if (!githubToken) {
      return {
        success: false,
        message: 'No valid GitHub token found'
      };
    }

    const octokit = new Octokit({ auth: githubToken });

    // First get the SHA of the default branch
    const baseBranchRef = await octokit.request('GET /repos/{owner}/{repo}/git/ref/heads/{fromBranch}', {
      owner,
      repo,
      fromBranch,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Then use the SHA to create new branch
    const response = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      },
      data: {
        ref: `refs/heads/${branchName}`,
        sha: baseBranchRef.data.object.sha // Use actual SHA from base branch
      }
    });

    return {
      success: true,
      message: 'Branch created successfully',
      response: response.data
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create branch'
    };
  }
}

export async function downloadZIP(owner, repo, branch, path = '') {
  try {
    const session = await auth();
    const { userId } = session;
    const tokens = await getGitHubTokens(userId);
    const githubToken = tokens.data[0]?.token;

    const octokit = githubToken ? new Octokit({ auth: githubToken }) : new Octokit();

    // If path is provided, use the path-specific format for the reference
    const ref = path != '' ? `${branch}:${path}` : branch;

    const response = await octokit.request('GET /repos/{owner}/{repo}/zipball/{ref}', {
      owner,
      repo,
      ref: ref
    });

    return {
      success: true,
      message: 'ZIP downloaded successfully',
      response: response.data
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to download ZIP'
    };
  }
}