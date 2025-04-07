'use server'

import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { Octokit } from "@octokit/core";


// Initialize Clerk client
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

function decodeBase64UTF8(base64Text) {
  try {
    // First decode base64 to binary
    const binaryString = atob(base64Text.replace(/\s/g, ''));
    // Convert the binary string to an array of byte values
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // Use TextDecoder to convert the bytes to a UTF-8 string
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    console.error('Error decoding base64 content:', error);
    return base64Text; // Return original if decoding fails
  }
}

export async function getGitHubUserInfo() {
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

    const octokit = new Octokit({ auth: githubToken });

    const response = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log('github response', response.data);

    return {
      success: true,
      user: response.data
    };

  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch user information'
    };
  }
}

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

export async function getGitHubContents(owner, repo, path = '', branch, isAuthRequired = true, isPrivate = false) {
  try {
    // First, attempt to fetch contents from ungh.cc
    if (!isPrivate) {
      try {
        const unghOctokit = new Octokit({ baseUrl: 'https://ungh.cc' });
        
        // First attempt to fetch as a file, unless the path ends with a slash
        if (!path.endsWith('/')) {
          try {
            const unghResponse = await unghOctokit.request(
              'GET /repos/{owner}/{repo}/files/{branch}/{path}', {
                owner,
                repo,
                branch,
                path
              }
            );
            
            if (unghResponse && unghResponse.data) {
              console.log('Fetched from ungh (file):', unghResponse.data);
              
              // If the file data is empty, force fallback by throwing an error
              if (!unghResponse.data.content || unghResponse.data.content.trim() === '') {
                throw new Error('Empty file content from ungh.cc');
              }
              
              // Use proper UTF-8 decoding if content appears to be base64
              if (typeof unghResponse.data.content === 'string' && 
                  /^[A-Za-z0-9+/=]+$/.test(unghResponse.data.content.replace(/\s/g, ''))) {
                return { success: true, content: decodeBase64UTF8(unghResponse.data.content) };
              }
              
              // Return successful response and skip GitHub API fallback
              return { success: true, content: unghResponse.data.content };
            }
          } catch (fileError) {
            console.error('Error fetching file from ungh.cc:', fileError);
            // Continue to try directory fetch from ungh.cc before falling back to GitHub API
          }
        }
        
        // Try to fetch as directory
        const unghResponse = await unghOctokit.request(
          'GET /repos/{owner}/{repo}/files/{branch}/', {
            owner,
            repo,
            branch
          }
        );
        
        if (unghResponse && unghResponse.data && Array.isArray(unghResponse.data.files)) {
          let unghData;
          // For repository root, group files so that each top-level directory is only shown once.
          if (path === '') {
            const topLevelFiles = [];
            const topLevelDirsMap = {};
            unghResponse.data.files.forEach(item => {
              const itemName = item.path.split('/').pop();
              // Determine if the item is a directory: either mode equals "040000"
              // or the name does NOT include a dot.

              const isDirectory = item.path.split('/').length > 1;
              if (item.path.includes('/')) {
                const topDir = item.path.split('/')[0];
                if (!topLevelDirsMap[topDir]) {
                  topLevelDirsMap[topDir] = {
                    name: topDir,
                    path: topDir,
                    sha: item.sha, // using the SHA of the first file in the directory as a placeholder
                    size: 0,
                    type: "dir" // For grouped top-level directories, always mark as "dir"
                  };
                }
              } else {
                topLevelFiles.push({
                  name: item.path,
                  path: item.path,
                  sha: item.sha,
                  size: item.size,
                  type: isDirectory ? "dir" : "file"
                });
              }
            });
            const topLevelDirs = Object.values(topLevelDirsMap);
            unghData = [...topLevelFiles, ...topLevelDirs];
            console.log('Fetched from ungh (root):', unghData);
          } else {
            // For a provided directory path, group immediate children.
            const normalizedPath = path.endsWith('/') ? path : `${path}/`;
            const immediateMap = {};
            unghResponse.data.files.forEach(item => {
              if (item.path.startsWith(normalizedPath)) {
                const remainder = item.path.substring(normalizedPath.length);
                const immediate = remainder.split('/')[0];
                
                // A better way to determine if it's a directory:
                // If remainder has more segments than just the immediate part, it's a directory
                const isDirectory = remainder.split('/').length > 1;
                
                if (!immediateMap[immediate]) {
                  immediateMap[immediate] = {
                    name: immediate,
                    path: normalizedPath + immediate,
                    sha: item.sha, // Using the first encountered SHA as a placeholder
                    size: item.size,
                    type: isDirectory ? "dir" : "file"
                  };
                }
              }
            });
            unghData = Object.values(immediateMap);
            console.log('Fetched from ungh (directory):', unghData);
          }

          // If unghData is populated, return it and skip GitHub API fallback
          if (unghData && unghData.length > 0) {
            return { success: true, content: unghData };
          } else {
            throw new Error('Empty directory data from ungh.cc');
          }
        } else {
          throw new Error('Malformed response from ungh.cc');
        }
      } catch (unghError) {
        // Log error and explicitly continue to GitHub API fallback
        console.error('All ungh.cc attempts failed, falling back to GitHub API:', unghError);
        // Fall through to GitHub API fallback
      }
    }
  
    // GitHub API fallback code...
    // This code will only execute if all ungh.cc attempts failed
  
    // Fallback: Fetch contents from the official GitHub API.
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
    if (!octokit) {
      if (isAuthRequired) {
        return {
          success: false,
          message: 'Authentication required to access this repository'
        };
      }
      octokit = new Octokit();
    }
  
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path,
        ...(branch ? { ref: branch } : {}),
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
  
    console.log('Fetched from GitHub API:', response.data);
    return { success: true, content: response.data };
  
  } catch (error) {
    // Main error handler
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
  // Remove any leading slashes from the path to avoid GitHub API error "path cannot start with a slash"
  // Also handle URL-encoded leading slashes (%2F)
  path = path.replace(/^\/+/, '').replace(/^%2F+/i, '');
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

    const octokit = githubToken
      ? new Octokit({ auth: githubToken })
      : new Octokit();

    // If a specific path is provided, adjust the reference accordingly.
    const ref = path !== '' ? `${branch}:${path}` : branch;

    // Remove the unsupported Accept header or change its value.
    // Previously, we used: Accept: 'application/zip'
    // Now we set it to a GitHub-supported value.
    const response = await octokit.request('GET /repos/{owner}/{repo}/zipball/{ref}', {
      owner,
      repo,
      ref,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // GitHub generally responds with a redirect URL.
    return {
      success: true,
      message: 'ZIP URL obtained successfully',
      downloadUrl: response.url  // Use this URL to trigger the download client-side.
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to download ZIP'
    };
  }
}

export async function rePathFile(owner, repo, branch, oldPath, newPath) {
  // Remove any leading slashes to prevent GitHub API errors
  oldPath = oldPath.replace(/^\/+/, '').replace(/^%2F+/i, '');
  newPath = newPath.replace(/^\/+/, '').replace(/^%2F+/i, '');
  
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

    // Check if a file already exists at the new path
    try {
      const newFileCheck = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: newPath,
        ref: branch
      });
      if (newFileCheck && newFileCheck.data) {
        return {
          success: false,
          message: 'A file already exists at the new path.'
        };
      }
    } catch (checkError) {
      // If the error is not a 404, return it; otherwise, file doesn't exist and we can proceed.
      if (checkError.status !== 404) {
        return {
          success: false,
          message: checkError.response?.data?.message || checkError.message
        };
      }
    }
    
    // Step 1: Get the existing file details (SHA and content)
    const fileResponse = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: oldPath,
      ref: branch
    });
    
    const fileSha = fileResponse.data.sha;
    const fileContent = fileResponse.data.content; // base64 encoded content
    
    // Decode the file content
    const decodedContent = Buffer.from(fileContent, 'base64').toString('utf8');
    
    // Step 2: Create a new file with the new name using the old file's content
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: newPath,
      message: `Rename file from ${oldPath} to ${newPath} via Reforkit: ${new Date().toISOString()}`,
      content: Buffer.from(decodedContent).toString('base64'),
      branch: branch
    });
    
    // Step 3: Delete the old file using its SHA
    await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: oldPath,
      message: `Remove old file ${oldPath} after renaming to ${newPath} via Reforkit: ${new Date().toISOString()}`,
      sha: fileSha,
      branch: branch
    });
    
    return {
      success: true,
      message: 'File renamed successfully'
    };
    
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to rename file'
    };
  }
}

export async function renameFolder(owner, repo, oldFolder, newFolder, branch) {
  try {
    // Remove any leading slashes from paths to avoid GitHub API error
    oldFolder = oldFolder.replace(/^\/+/, '').replace(/^%2F+/i, '');
    newFolder = newFolder.replace(/^\/+/, '').replace(/^%2F+/i, '');
    
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
  
    // Get the list of contents in the old folder
    const { data: items } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: oldFolder,
      ref: branch
    });
  
    for (const item of items) {
      if (item.type === 'dir') {
        // Recursively rename subdirectories.
        const subOldFolder = item.path;
        const subNewFolder = `${newFolder}/${item.name}`;
        const result = await renameFolder(owner, repo, subOldFolder, subNewFolder, branch);
        if (!result.success) {
          throw new Error(`Failed to rename subfolder ${item.name}: ${result.message}`);
        }
        continue;
      }
  
      if (item.type !== 'file') {
        console.log(`Skipping non-file item: ${item.name} (${item.type})`);
        continue;
      }
  
      // Retrieve full file details for content and SHA
      const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: item.path,
        ref: branch
      });
  
      // Remove newline characters from the base64-encoded content
      const content = fileData.content.replace(/\n/g, '');
  
      // Create the file in the new folder (do not include SHA since it does not exist yet)
      const newPath = `${newFolder}/${item.name}`.replace(/^\/+/, '').replace(/^%2F+/i, '');
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: newPath,
        message: `Move ${item.name} to ${newFolder} via Reforkit - ${new Date().toISOString()}`,
        content: content,
        branch: branch
      });
  
      console.log(`Moved file: ${item.name}`);
  
      // Delete the original file from the old folder
      await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: item.path,
        message: `Delete ${item.name} from ${oldFolder} after moving to ${newFolder} - ${new Date().toISOString()}`,
        sha: fileData.sha,
        branch: branch
      });
  
      console.log(`Deleted original file: ${item.name}`);
    }
  
    console.log("Folder renamed successfully!");
    return {
      success: true,
      message: 'Folder renamed successfully'
    };
  
  } catch (error) {
    console.error("Error renaming folder:", error);
    return {
      success: false,
      message: error.message || 'Failed to rename folder'
    };
  }
}

export async function createFile(owner, repo, parentPath, fileName, branch, content = '') {
  // Construct the full path by combining parentPath and fileName
  const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
  // Remove any leading slashes from the path to avoid GitHub API error
  const cleanPath = fullPath.replace(/^\/+/, '').replace(/^%2F+/i, '');
  
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

    // Check if file already exists
    try {
      const existingFile = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: cleanPath,
        ref: targetBranch
      });
      
      if (existingFile.status === 200) {
        return {
          success: false,
          message: 'File already exists'
        };
      }
    } catch (error) {
      // 404 is expected if the file doesn't exist, we continue
      if (error.status !== 404) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to check if file exists'
        };
      }
    }

    // Create the file - use a space for empty files to make valid base64
    const contentToUse = content === '' ? ' ' : content;
    
    // Create the file
    const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: cleanPath,
      message: `Create ${fileName} via Reforkit: ${new Date().toISOString()}`,
      content: Buffer.from(contentToUse).toString('base64'),
      branch: targetBranch
    });

    return {
      success: true,
      message: 'File created successfully',
      response: response.data
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create file'
    };
  }
}

export async function createFolder(owner, repo, parentPath, folderName, branch) {
  // Construct the full path by combining parentPath and folderName
  const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
  // Remove any leading slashes to avoid GitHub API errors
  const cleanPath = fullPath.replace(/^\/+/, '').replace(/^%2F+/i, '');
  
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
    
    // Check if any part of the path is already a file
    // Split the path and check progressively
    const pathParts = cleanPath.split('/');
    let currentPath = '';
    
    for (let i = 0; i < pathParts.length; i++) {
      if (currentPath) {
        currentPath += '/';
      }
      currentPath += pathParts[i];
      
      try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: currentPath,
          ref: targetBranch
        });
        
        // If we get here and the response is not a directory, it means a file exists
        // at this level of the path hierarchy
        if (!Array.isArray(response.data)) {
          return {
            success: false,
            message: `Cannot create folder: a file already exists at "${currentPath}". Choose a different path.`
          };
        }
      } catch (error) {
        // 404 is expected if path doesn't exist yet
        if (error.status !== 404) {
          return {
            success: false,
            message: error.response?.data?.message || `Failed to check path "${currentPath}"`
          };
        }
      }
    }
    
    // Use the createFile function to create a placeholder file in the folder
    const result = await createFile(owner, repo, fullPath, '.gitkeep', branch, '');
    
    if (result.success) {
      // now delete the .gitkeep file
      return {
        success: true,
        message: 'Folder created successfully',
        response: result.response
      };
    } else {
      return result; // Pass through any error from createFile
    }
  } catch (error) {
    console.error('GitHub API Error:', error);
    
    // Handle the specific 409 conflict error with a user-friendly message
    if (error.status === 409) {
      return {
        success: false,
        message: "Cannot create folder: a file exists where you're trying to create a directory. Please choose a different path."
      };
    }
    
    return {
      success: false,
      message: error.message || 'Failed to create folder'
    };
  }
}

export async function deleteFile(owner, repo, path, branch) {
  // Remove any leading slashes from the path
  path = path.replace(/^\/+/, '').replace(/^%2F+/i, '');
  
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

    // First get the file's SHA, which is required for deletion
    const fileDetails = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      ref: targetBranch
    });

    // Delete the file
    const response = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      message: `Delete ${path} via Reforkit: ${new Date().toISOString()}`,
      sha: fileDetails.data.sha,
      branch: targetBranch
    });

    return {
      success: true,
      message: 'File deleted successfully',
      response: response.data
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete file'
    };
  }
}

export async function deleteFolder(owner, repo, folderPath, branch) {
  // Remove any leading slashes from the path
  folderPath = folderPath.replace(/^\/+/, '').replace(/^%2F+/i, '');
  
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

    // Get all items in the folder
    const { data: items } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: folderPath,
      ref: targetBranch
    });

    // Process each item in the folder
    for (const item of items) {
      if (item.type === 'dir') {
        // Recursively delete subdirectories
        const result = await deleteFolder(owner, repo, item.path, targetBranch);
        if (!result.success) {
          throw new Error(`Failed to delete subfolder ${item.name}: ${result.message}`);
        }
      } else if (item.type === 'file') {
        // Delete individual files
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: item.path,
          message: `Delete ${item.name} from ${folderPath} via Reforkit: ${new Date().toISOString()}`,
          sha: item.sha,
          branch: targetBranch
        });
        console.log(`Deleted file: ${item.name}`);
      }
    }

    return {
      success: true,
      message: 'Folder deleted successfully'
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete folder'
    };
  }
}

// check if a repo is private
export async function IsRepoPrivate(owner, repo) {
  const session = await auth();
  const { userId } = session;
  const tokens = await getGitHubTokens(userId);
  const githubToken = tokens.data[0]?.token;
  const octokit = new Octokit({ auth: githubToken });
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo
    });
    return response.data.private;
  } catch (error) {
    console.error('GitHub API Error:', error);
    return false;
  }
}
// {
//   "codeKind": "vanilla",
//   "repo": "claroes-outpost",
//   "description": "",
//   "visibility": "private",
//   "readme": false,
//   "owner": "RiceBarrels"
// }
export async function CreateRepo(codeKind, repo, description, visibility, readme, owner, autoSaveBranch) {
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
    
    // Create the repository with auto_init set to readme
    const response = await octokit.request('POST /user/repos', {
      name: repo,
      description: description,
      private: visibility === 'private',
      auto_init: readme, // Auto-initialize if readme is true
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Add template files based on codeKind
    if (codeKind === 'vanilla') {
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: response.data.owner.login,
        repo: repo,
        path: 'index.html',
        message: 'Add index.html template',
        content: Buffer.from(
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World!</h1>
  <script src="script.js"></script>
</body>
</html>`).toString('base64'),
        branch: response.data.default_branch
      });
      
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: response.data.owner.login,
        repo: repo,
        path: 'style.css',
        message: 'Add style.css template',
        content: Buffer.from(
`body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}`).toString('base64'),
        branch: response.data.default_branch
      });
      
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: response.data.owner.login,
        repo: repo,
        path: 'script.js',
        message: 'Add script.js template',
        content: Buffer.from(
`// Your JavaScript code goes here
console.log("Hello from JavaScript!");`).toString('base64'),
        branch: response.data.default_branch
      });
    }

    // Update or create README if readme is true
    if (readme) {
      try {
        // Try to fetch the existing README to get its SHA
        const existingReadme = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: response.data.owner.login,
          repo: repo,
          path: 'README.md',
          ref: response.data.default_branch
        });
        
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: response.data.owner.login,
          repo: repo,
          path: 'README.md',
          message: 'Update README.md',
          content: Buffer.from(`# ${repo}\n\n${description || 'A new repository created with Reforkit.'}`).toString('base64'),
          branch: response.data.default_branch,
          sha: existingReadme.data.sha
        });
      } catch (error) {
        // If README is not found, create it without the SHA (this should rarely happen when auto_init is true)
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: response.data.owner.login,
          repo: repo,
          path: 'README.md',
          message: 'Add README.md',
          content: Buffer.from(`# ${repo}\n\n${description || 'A new repository created with Reforkit.'}`).toString('base64'),
          branch: response.data.default_branch
        });
      }
    }

    // Create .reforkitSettings file
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: response.data.owner.login,
      repo: repo,
      path: '.reforkitSettings',
      message: 'Add .reforkitSettings',
      content: Buffer.from(JSON.stringify({
        repoFullName: `${owner}/${repo}`,
        codeKind: codeKind,
        autoSaveBranch: autoSaveBranch,
      }, null, 2)).toString('base64'),
      branch: response.data.default_branch
    });
    
    return {
      success: true,
      message: 'Repository created successfully',
      repo: response.data
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create repository'
    };
  }
}

export async function moveFile(owner="", repo="", path=[], newPath="", branch="") {
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

    // Process each path in the array
    for (const sourcePath of path) {
      // Remove any leading slashes from paths
      const cleanSourcePath = sourcePath.replace(/^\/+/, '').replace(/^%2F+/i, '');
      const fileName = cleanSourcePath.split('/').pop();
      const cleanNewPath = (newPath + '/' + fileName).replace(/^\/+/, '').replace(/^%2F+/i, '');

      try {
        // Get the existing file details (SHA and content)
        const fileResponse = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: cleanSourcePath,
          ref: targetBranch
        });

        if (Array.isArray(fileResponse.data)) {
          // This is a directory, handle recursively
          const result = await renameFolder(owner, repo, cleanSourcePath, cleanNewPath, targetBranch);
          if (!result.success) {
            return result;
          }
          continue;
        }

        const fileSha = fileResponse.data.sha;
        const fileContent = fileResponse.data.content; // base64 encoded content

        // Create the file in the new location
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: cleanNewPath,
          message: `Move ${fileName} to ${newPath} via Reforkit: ${new Date().toISOString()}`,
          content: fileContent,
          branch: targetBranch
        });

        // Delete the old file
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: cleanSourcePath,
          message: `Remove ${fileName} after moving to ${newPath} via Reforkit: ${new Date().toISOString()}`,
          sha: fileSha,
          branch: targetBranch
        });

      } catch (error) {
        console.error(`Error moving ${sourcePath}:`, error);
        return {
          success: false,
          message: error.response?.data?.message || error.message || `Failed to move ${sourcePath}`
        };
      }
    }

    return {
      success: true,
      message: 'Files moved successfully'
    };

  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to move files'
    };
  }
}