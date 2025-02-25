import axios from "axios";
import { GIT_KEYS } from "../config";

const { owner, repo, branch, token } = GIT_KEYS;

export const renameImageFile = async (
  oldFilePath: string,
  newFilePath: string
) => {
  const getBlobSha = async () => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${oldFilePath}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get blob SHA: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sha;
  };

  try {
    // Step 1: Get the current reference (SHA of the latest commit)
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    if (!refResponse.ok) {
      throw new Error(
        `Failed to fetch branch reference: ${refResponse.statusText}`
      );
    }

    const refData = await refResponse.json();
    const latestCommitSha = refData.object.sha;

    // Step 2: Get the tree associated with the latest commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    if (!commitResponse.ok) {
      throw new Error(`Failed to fetch commit: ${commitResponse.statusText}`);
    }

    const commitData = await commitResponse.json();
    const treeSha = commitData.tree.sha;

    // Step 3: Create a new tree with the renamed file
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({
          base_tree: treeSha,
          tree: [
            {
              path: newFilePath,
              mode: "100644",
              type: "blob",
              sha: await getBlobSha(), // Get the blob SHA of the old file
            },
            {
              path: oldFilePath,
              mode: "100644",
              type: "blob",
              sha: null, // Remove the old file
            },
          ],
        }),
      }
    );

    if (!treeResponse.ok) {
      throw new Error(`Failed to create new tree: ${treeResponse.statusText}`);
    }

    const treeData = await treeResponse.json();

    // Step 4: Create a new commit
    const commitResponse2 = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({
          message: `Rename ${oldFilePath} to ${newFilePath}`,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    if (!commitResponse2.ok) {
      throw new Error(
        `Failed to create new commit: ${commitResponse2.statusText}`
      );
    }

    const commitData2 = await commitResponse2.json();

    // Step 5: Update the branch reference to point to the new commit
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({
          sha: commitData2.sha,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      throw new Error(
        `Failed to update branch reference: ${updateRefResponse.statusText}`
      );
    }

    console.log("File renamed successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
};

export const copyFolderOnGithub = async (
  sourcePath: string,
  destinationPath: string
) => {
  try {
    const baseURL = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const fetchFolderContents = async (path: string) => {
      const response = await axios.get(`${baseURL}/${path}?ref=${branch}`, {
        headers,
      });
      if (response.status !== 200)
        throw new Error(`Failed to fetch folder: ${path}`);
      return response.data;
    };

    const fetchFileContent = async (path: string) => {
      const response = await axios.get(`${baseURL}/${path}?ref=${branch}`, {
        headers,
      });
      if (response.status !== 200)
        throw new Error(`Failed to fetch file: ${path}`);
      return response.data.content; // This is base64 encoded.
    };

    const uploadFile = async (path: string, content: any) => {
      const data = {
        message: `Copying file to ${path}`,
        content, // base64 encoded
        branch,
      };
      const response = await axios.put(`${baseURL}/${path}`, data, {
        headers,
      });
      if (response.status !== 201)
        throw new Error(`Failed to upload file: ${path}`);
    };

    const processFolder = async (source: any, destination: any) => {
      const folderContents = await fetchFolderContents(source);
      for (const item of folderContents) {
        if (item.type === "dir") {
          // Recurse into subfolders.
          await processFolder(
            `${source}/${item.name}`,
            `${destination}/${item.name}`
          );
        } else if (item.type === "file") {
          // Fetch and upload the file.
          const fileContent = await fetchFileContent(`${source}/${item.name}`);
          await uploadFile(`${destination}/${item.name}`, fileContent);
        }
      }
    };

    console.log(`Starting to copy from ${sourcePath} to ${destinationPath}`);
    await processFolder(sourcePath, destinationPath);
    console.log("Folder copy completed successfully!");
  } catch (error) {
    console.error("An error occurred during the folder copy:", error);
    if (error) {
      console.error("Response data:", error);
    }
  }
};

export const copyImageOnGithub = async (
  sourcePath: string,
  destinationPath: string
) => {
  const baseURL = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  const uploadFile = async (path: string, content: any) => {
    const data = {
      message: `Uploading file to ${path}`,
      content, // Base64-encoded content
      branch,
    };

    const response = await axios.put(`${baseURL}/${path}`, data, { headers });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Failed to upload file: ${path}`);
    }

    // console.log(`File uploaded successfully to: ${path}`);
  };

  const fetchFileContent = async (path: string) => {
    try {
      // console.log(`Fetching file content from: ${path}`);
      const response = await axios.get(`${baseURL}/${path}?ref=${branch}`, {
        headers,
      });

      // console.log("Fetch response:", response);

      if (response.status !== 200) {
        throw new Error(`Failed to fetch file metadata: ${path}`);
      }

      // If content is empty, fall back to download_url
      if (!response.data.content) {
        // console.log("Content field is empty. Fetching from download_url...");
        const downloadResponse = await axios.get(response.data.download_url, {
          responseType: "arraybuffer", // Ensure raw binary data
        });

        // console.log("Fetched file content from download_url.");
        return btoa(
          Array.from(new Uint8Array(downloadResponse.data))
            .map((byte) => String.fromCharCode(byte))
            .join("")
        );
      }

      // console.log("Fetched file content (base64):", response.data.content);
      return response.data.content; // Base64 encoded content
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw error;
    }
  };

  try {
    console.log(
      `Starting to copy image from ${sourcePath} to ${destinationPath}`
    );
    const fileContent = await fetchFileContent(sourcePath);

    if (!fileContent) {
      throw new Error("Fetched file content is empty or undefined");
    }

    await uploadFile(destinationPath, fileContent);

    console.log("Image file copy completed successfully!");
  } catch (error) {
    console.error("An error occurred during the image copy:", error);
  }
};

export const uploadBlankImageToGitHub = async (
  folderName: string,
  currentPath: string[]
) => {
  if (currentPath.length === 0) return;
  try {
    const response = await fetch(`${window.location.origin}/blank.png`);
    if (!response.ok) {
      throw new Error("Failed to fetch the image from the public folder.");
    }
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result;

      if (typeof result === "string") {
        const base64Content = result.split(",")[1];
        if (
          currentPath.length === 1 &&
          (currentPath[0] === "projects" || currentPath[0] === "archives")
        ) {
          const githubResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/public/assets/${currentPath[0]}/${folderName}/blank.png`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: "Add blank.png",
                content: base64Content,
                branch: branch,
              }),
            }
          );

          if (!githubResponse.ok) {
            throw new Error(
              `Failed to upload blank.png: ${githubResponse.statusText}`
            );
          }
        }
        console.log("upload successful");
      } else {
        throw new Error("Failed to read the image as a base64 string.");
      }
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Error uploading to GitHub:", error);
    alert("Failed to upload blank.png to GitHub. Check console for details.");
  }
};

export const uploadToGitHub = async (
  currentPath: string[],
  images: { name: string; src: string }[]
) => {
  const currentBase = currentPath.join("/");
  try {
    for (const image of images) {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/public/assets/${currentBase}/${image.name}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Add ${image.name}`,
            content: image.src.split(",")[1],
            branch: branch,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to upload ${image.name}: ${response.statusText}`
        );
      }
    }
  } catch (error) {
    console.error("Error uploading to GitHub:", error);
    alert("Failed to upload images to GitHub. Check console for details.");
  }
};
