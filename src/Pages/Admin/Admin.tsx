import React, { useEffect, useRef, useState } from "react";
import "./Admin.css";
// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useNavigate, useLocation } from "react-router-dom";
// import Home from "./Pages/Home/Home";
// import About from "./Pages/About/About";
// import Projects from "./Pages/Projects/Projects";
// import Navbar from "./Components/Navbar/Navbar";
// import Archives from "./Pages/Archives/Archives";
// import "./App.css";
// import ProjectsPage from "./Pages/Projects/ProjectsPage/ProjectsPage";
// import useProjectColorsState from "./store/useProjectColorsStore";
// import useCurrentPageState from "./store/useCurrentPageStore";
// import useCurrentNavColorState from "./store/useCurrentNavColorStore";
// import useSelectedProjectNameState from "./store/useSelectedProjectNameStore";
// import useSelectedProjectState from "./store/useSelectedProjectStore";
// import useIncomingImageDimensionsState from "./store/useIncomingImageDimensionsState";
// import useIncomingImageStylesStore from "./store/useIncomingImageStylesStore";
// import useIncomingImageSpeedState from "./store/useIncomingImageSpeedState";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";
import { useLocation } from "react-router-dom";
import useSelectedArchiveGroupStore from "../../store/useSelectedArchiveGroupStore";
import usePreloadedImagesStore from "../../store/usePreloadedImagesStore";
// import usePreloadedImagesStore from "./store/usePreloadedImagesStore";
// import useSelectedArchiveGroupStore from "./store/useSelectedArchiveGroupStore";
import { BiSolidPencil } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";
import { IoStarOutline } from "react-icons/io5";
import Upload from "./Upload";
import ColorPicker from "./ColorPicker";
import axios from "axios";
import { FaCheck } from "react-icons/fa6";

export function validateColor(input: string) {
  const isColorName = (color: string) => {
    const testElement = document.createElement("div");
    testElement.style.color = color;
    return testElement.style.color !== "";
  };
  const isHexCode = (color: string) =>
    /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color);
  if (isColorName(input)) {
    return input;
  }
  if (isHexCode(input)) {
    return input.startsWith("#") ? input : `#${input}`;
  }
  return "white";
}

function isColor(input: string) {
  const isColorName = (color: string) => {
    const testElement = document.createElement("div");
    testElement.style.color = color;
    return testElement.style.color !== "";
  };
  const isHexCode = (color: string) =>
    /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color);
  if (isColorName(input)) {
    return input;
  }
  if (isHexCode(input)) {
    return input.startsWith("#") ? input : `#${input}`;
  }
  return null;
}

const unSanitizeTitle = (title: string, subTitle: boolean) => {
  if (subTitle) {
    title = title.toUpperCase();
  } else {
    title = title
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("_");
  }
  const newTitle = title.replaceAll("_", " ").trim();
  return newTitle;
};

const sanitizeTitle = (title: string) => {
  return title.trim().replaceAll(" ", "_").toLowerCase();
};

const extractAfterIndex = (str: string) => {
  const regex = /^\d+--/;
  return regex.test(str) ? str.replace(regex, "") : str;
};

const extractBeforeIndex = (str: string) => {
  const regex = /^(\d+)--/;
  const match = str.match(regex);
  return match ? match[1] : null;
};

export type FileTree = {
  [key: string]: string | FileTree | FileTree[] | string[];
};

export type CoverInputObject = {
  [key: string]: { [key: string]: string };
};

export type CoverOutputItem = {
  title: string;
  subTitle: string;
  images: string[];
};

export type ProjectOutputItem = {
  title: string;
  bg_color: string;
  text_color: string;
  images: string[];
  covers: string[];
};

export type ProjectInputObject = {
  [key: string]: {
    covers?: { [key: string]: string };
    [key: string]: any;
  };
};

export type ArchivesInputObject = {
  [key: string]: { [key: string]: string };
};

export type ArchivesOutputItem = {
  title: string;
  bg_color: string;
  images: string[];
};

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  desc: string;
  popupExtention: string;
  onRename: (newTitle: string, newDesc: string) => void;
  popupTrigger: number;
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  desc,
  popupExtention,
  onRename,
  popupTrigger,
}) => {
  const [newTitle, setNewTitle] = useState(title);
  const [newDesc, setNewDesc] = useState(desc);

  useEffect(() => {
    setNewTitle(title);
    setNewDesc(desc);
  }, [title, desc, popupTrigger]);

  const handleRename = () => {
    if (
      popupExtention === "" &&
      newTitle.trim() !== "" &&
      newDesc.trim() !== ""
    ) {
      onRename(sanitizeTitle(newTitle), sanitizeTitle(newDesc));
      onClose();
    }
    if (
      popupExtention !== "" &&
      newTitle.split("--").length >= 2 &&
      newTitle.split("--")[1].trim() !== ""
    ) {
      onRename(sanitizeTitle(newTitle), sanitizeTitle(newDesc));
      onClose();
    }
  };

  const isValidFileNameChar = (char: any) => {
    const invalidChars = ["\\", "/", ":", "*", "?", '"', "<", ">", "|", "."];
    return !invalidChars.includes(char) && char !== "\n";
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="flex flex-col p-[20px] w-[300px]"
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
        }}
      >
        <p className="font-[500] text-[14px] mb-[1px]">
          {desc === "" && popupExtention !== "" ? "Image Name" : "Title"}
        </p>
        <textarea
          className="py-1 px-2"
          style={{
            width: "100%",
            height: "60px",
            resize: "none",
            overflowY: "auto",
            border: "1px solid #CCC",
            borderRadius: "3px",
          }}
          value={newTitle}
          onChange={(e) => {
            if (
              e.target.value
                .split("")
                .every((item) => isValidFileNameChar(item))
            ) {
              setNewTitle(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRename();
            }
          }}
        />
        {desc !== "" && (
          <>
            <p className="font-[500] text-[14px] mb-[1px] mt-[10px]">
              Description
            </p>
            <textarea
              className="py-1 px-2"
              style={{
                width: "100%",
                height: "90px",
                resize: "none",
                overflowY: "auto",
                border: "1px solid #CCC",
                borderRadius: "3px",
              }}
              value={newDesc}
              onChange={(e) => {
                if (
                  e.target.value
                    .split("")
                    .every((item) => isValidFileNameChar(item))
                ) {
                  setNewDesc(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
            />
          </>
        )}
        <div className="flex flex-row mt-[13px]">
          <button
            className="w-[48.5%] mr-[3%] p-[10px] cursor-pointer"
            style={{
              backgroundColor: "red",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="w-[48.5%] p-[10px] cursor-pointer"
            style={{
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={handleRename}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
  };

  return (
    <div className="flex justify-center items-center absolute left-0 top-0 h-[100vh] w-[100vw] pb-[10vh]">
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <div className="loginBox">
          <h2 className="heading">Admin</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input"
            />
            <button type="submit" className="button">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

interface DashboardProps {
  onLogout: () => void;
}

interface FolderStructure {
  [key: string]: FolderStructure | string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [loading, setLoading] = useState(false);

  // const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const [fullProject, setFullProject] = useState<FolderStructure | null>(null);
  const owner = "JosephGoff";
  const repo = "js-portfolio";
  const branch = "master";
  const token = process.env.REACT_APP_GIT_PAT;

  const renameImageFile = async (oldFilePath: string, newFilePath: string) => {
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
        throw new Error(
          `Failed to create new tree: ${treeResponse.statusText}`
        );
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

  // APP.JSON
  const [appFile, setAppFile] = useState<any>({});

  const fetchAppFileContents = async (blobUrl: string) => {
    try {
      const response = await fetch(blobUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${blobUrl}`);
      }

      const data = await response.json();
      const fileContent = atob(data.content);

      if (fileContent) {
        try {
          const parsedContent = JSON.parse(fileContent);
          setAppFile(parsedContent);
        } catch (error) {
          console.error("Error parsing JSON content:", error);
        }
      }

      return fileContent;
    } catch (error) {
      console.error("Error fetching file contents:", error);
    }
  };

  async function updateAppFile() {
    const filePath = "src/app.json";
    try {
      const fileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
      const headers = { Authorization: `Bearer ${token}` };
      const { data: fileInfo } = await axios.get(fileInfoUrl, { headers });
      const fileSha = fileInfo.sha;
      const updatedContent = btoa(
        typeof appFile === "string" ? appFile : JSON.stringify(appFile)
      );
      const updateFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
      const commitMessage = "Update app.json with new content";
      await axios.put(
        updateFileUrl,
        {
          message: commitMessage,
          content: updatedContent,
          sha: fileSha,
          branch,
        },
        { headers }
      );
      console.log("File updated successfully");
    } catch (error) {
      console.error("Error updating the file:", error);
    }
  }

  const getFolderItem = (key: string) => {
    const pageName =
      currentPath[0] === "archives"
        ? "archives"
        : currentPath[0] === "projects"
        ? "projects"
        : null;
    if (pageName === null) return null;
    if (Object.keys(appFile).length === 0) return null;
    const pages = appFile["pages"];
    if (!pages || Object.keys(pages).length === 0) return null;
    const page = pages[pageName];
    if (!page || page.length === 0) return null;
    const projectItem = page.find((item: any) => item.id === key);
    if (!projectItem) return null;
    return projectItem;
  };

  const updateAppData = async () => {
    await updateAppFile();
    await getRepoTree();
  };

  // FULL REPOSITORY
  const fetchFullRepoTree = async (
    owner: string,
    repo: string,
    branch = "master"
  ) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const token = process.env.REACT_APP_GIT_PAT;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch repository tree:", response.statusText);
        return null;
      }
      const data = await response.json();
      const tree = data.tree.reduce((acc: any, item: any) => {
        const parts = item.path.split("/");
        let current = acc;

        for (const part of parts) {
          if (!current[part]) {
            current[part] = item.type === "tree" ? {} : item.url;
          }
          current = current[part];
        }
        return acc;
      }, {});

      return tree;
    } catch (error) {
      console.error("Error fetching repository tree:", error);
      return null;
    }
  };

  const getRepoTree = async () => {
    const fullRepo = await fetchFullRepoTree("JosephGoff", "js-portfolio");
    if (fullRepo && fullRepo["public"]?.["assets"]) {
      const { icons, ...filteredProject } = fullRepo["public"]["assets"];
      setFullProject(filteredProject);
    }
    if (fullRepo["src"]["app.json"]) {
      const appFileURL = fullRepo["src"]["app.json"];
      await fetchAppFileContents(appFileURL);
    }
  };

  useEffect(() => {
    getRepoTree();
  }, []);

  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const getCurrentFolder = (): FolderStructure | string => {
    if (!fullProject) return {};
    return currentPath.reduce(
      (acc: FolderStructure, key) => acc[key] as FolderStructure,
      fullProject
    );
  };

  const handleFolderClick = (folderName: string) => {
    if (folderName.includes(".")) {
      const imagePath = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/assets/${
        currentPath.join("/") + "/" + folderName
      }`;
      window.location.href = imagePath;
      return;
    }
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBackClick = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  // POPUP
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupKey, setPopupKey] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupDesc, setPopupDesc] = useState("");
  const [popupTrigger, setPopupTrigger] = useState(0);
  const [popupExtention, setPopupExtention] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const openPopup = (name: string, path: any) => {
    if (currentPath.length === 0) {
      return;
    }
    if (name.includes(".")) {
      const extension = name.split(".").pop() || "";
      const imgName = name.slice(0, name.lastIndexOf("."));
      setPopupExtention(extension);
      setPopupTitle(imgName);
      setPopupKey(imgName);
      setPopupDesc("");
    } else {
      const projectItem = getFolderItem(name);
      if (projectItem === null) return;
      setPopupExtention("");
      setPopupKey(name);
      setPopupTitle(unSanitizeTitle(projectItem.title, false));
      if (currentPath[0] === "projects") {
        setPopupDesc(unSanitizeTitle(projectItem.description, true));
      } else {
        setPopupDesc("");
      }
    }
    setPopupTrigger((prev) => prev + 1);
    setSelectedPath(path);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  const handleDeleteItem = async (path: any) => {
    setLoading(true);
    try {
      let pageName = null;
      let index = null;
      if (!path.split("/").pop().includes(".")) {
        pageName =
          currentPath[0] === "archives"
            ? "archives"
            : currentPath[0] === "projects"
            ? "projects"
            : null;
        if (pageName === null) return null;
        if (Object.keys(appFile).length === 0) return null;
        const pages = appFile["pages"];
        if (!pages || Object.keys(pages).length === 0) return null;
        const page = pages[pageName];
        if (!page || page.length === 0) return null;
        index = page.findIndex((item: any) => item.id === path.split("/")[1]);
        if (index === null) return null;
      }

      await deleteItem(
        "public/assets/" + path,
        path.split("/").pop().includes(".")
      );

      if (
        !path.split("/").pop().includes(".") &&
        pageName !== null &&
        index !== null
      ) {
        const appFileCopy = appFile;
        appFileCopy["pages"][pageName].splice(index, 1);
        setAppFile(appFileCopy);
        updateAppData();
      }

      await getRepoTree();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyFolderOnGithub = async (
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
            const fileContent = await fetchFileContent(
              `${source}/${item.name}`
            );
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

  const copyImageOnGithub = async (
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

    setLoading(true);
    try {
      console.log(
        `Starting to copy image from ${sourcePath} to ${destinationPath}`
      );
      const fileContent = await fetchFileContent(sourcePath);

      if (!fileContent) {
        throw new Error("Fetched file content is empty or undefined");
      }

      // console.log("Fetched file content:", fileContent);

      await uploadFile(destinationPath, fileContent);

      console.log("Image file copy completed successfully!");
    } catch (error) {
      console.error("An error occurred during the image copy:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (path: string, isImage: boolean) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch folder contents for path: ${path}`);
      }

      const files = await response.json();

      if (isImage) {
        const deleteResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              message: `Deleting file ${path}`,
              sha: files.sha,
              branch,
            }),
          }
        );

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete file: ${path}`);
        }
        console.log(`Successfully deleted image file: ${path}`);
      } else {
        console.log(`Deleting folder and its contents: ${path}`);
        for (const file of files) {
          await deleteItem(file.path, file.type === "file");
        }
        console.log(`Successfully deleted all contents of folder: ${path}`);
      }
    } catch (error) {
      console.error(`Error while deleting item at path: ${path}`, error);
    }
  };

  const collectImgNames = () => {
    let namesList: string[] = [];
    if (
      currentPath &&
      currentPath.length > 0 &&
      fullProject &&
      fullProject[currentPath[0]]
    ) {
      const page = fullProject[currentPath[0]] as any;
      if (currentPath[0] === "about") {
        delete page["blank.png"];
        namesList = Object.keys(page);
        return namesList;
      }

      if (currentPath.length > 1 && page[currentPath[1]]) {
        const contents = page[currentPath[1]];
        if (currentPath[0] === "archives") {
          delete contents["blank.png"];
          namesList = Object.keys(contents);
          return namesList;
        }

        if (currentPath[0] === "projects" && currentPath.length === 2) {
          delete contents["blank.png"];
          namesList = Object.keys(contents);
          return namesList;
        }

        if (currentPath.length > 2 && contents["covers"]) {
          delete contents["covers"]["blank.png"];
          namesList = Object.keys(contents["covers"]);
          return namesList;
        }
      }
    }
    return namesList;
  };

  const collectFolderNames = () => {
    let namesList: string[] = [];
    if (
      currentPath &&
      currentPath.length === 1 &&
      fullProject &&
      fullProject[currentPath[0]]
    ) {
      const page = fullProject[currentPath[0]] as any;
      if (currentPath[0] === "projects" || currentPath[0] === "archives") {
        delete page["blank.png"];
        namesList = Object.keys(page);
        return namesList;
      }
    }
    return namesList;
  };

  const handleRename = async (newTitle: string, newDesc: string) => {
    if (popupExtention === "") {
      const projectItem = getFolderItem(popupKey);
      const pageName =
        currentPath[0] === "archives"
          ? "archives"
          : currentPath[0] === "projects"
          ? "projects"
          : null;
      if (pageName === null || projectItem === null) return;
      const index = appFile["pages"][pageName].findIndex(
        (item: any) => item === projectItem
      );
      const folderContents = collectFolderNames();
      const folderNames = folderContents.map(
        (item, index) => appFile["pages"][pageName][index].title
      );
      console.log(folderNames);
      if (folderNames.includes(newTitle)) {
        alert("That name is already being used in this folder");
        return;
      }
      const appFileCopy = appFile;
      appFileCopy["pages"][pageName][index].title = newTitle;
      if (pageName === "projects") {
        appFileCopy["pages"][pageName][index].description = newDesc;
      }
      setAppFile(appFileCopy);
      await updateAppData();
    } else {
      const folderContents = collectImgNames();
      const originalName = popupKey + "." + popupExtention;
      const imageName = newTitle + "." + popupExtention;
      if (popupTitle !== newTitle && folderContents.length > 0) {
        if (folderContents.includes(imageName)) {
          alert("That name is already being used in this folder");
          return;
        }
        const originalPath = "public/assets/" + selectedPath + originalName;
        const newPath = "public/assets/" + selectedPath + imageName;
        await renameImageFile(originalPath, newPath);
      }
      await getRepoTree();
    }
  };

  const handleStarChange = async (key: string) => {
    const projectItem = getFolderItem(key);
    if (projectItem === null) return;
    const appFileCopy = appFile;
    const index = appFileCopy["pages"]["projects"].findIndex(
      (item: any) => item === projectItem
    );
    appFileCopy["pages"]["projects"][index].home_page = !projectItem.home_page;
    await updateAppData();
  };

  const handleProjectColorsChange = async (key: string) => {
    if (currentPath.length === 0) return;
    const pageName =
      currentPath[0] === "archives"
        ? "archives"
        : currentPath[0] === "projects"
        ? "projects"
        : null;
    if (pageName === null) return;
    if (
      colorToChange.length === 2 &&
      (colorToChange[0] !== null || colorToChange[1] !== null)
    ) {
      const projectItem = getFolderItem(key);
      if (projectItem === null) return;
      const appFileCopy = appFile;
      const index = appFileCopy["pages"][pageName].findIndex(
        (item: any) => item === projectItem
      );
      if (colorToChange[0] !== null) {
        appFileCopy["pages"][pageName][index].bg_color = colorToChange[0];
      }
      if (colorToChange[1] !== null && pageName === "projects") {
        appFileCopy["pages"][pageName][index].text_color = colorToChange[1];
      }
      await updateAppData();
    }
    setChangedColorItems({});
    setColorToChange([null, null]);
  };

  const [changedColorItems, setChangedColorItems] = useState<any>({});
  const [colorToChange, setColorToChange] = useState<any>([null, null]);
  const handleColorChange = (
    key: string,
    primary: boolean,
    newValue: string
  ) => {
    const index = primary ? 0 : 1;
    const colorToChangeCopy = colorToChange;
    colorToChangeCopy[index] = newValue;
    setColorToChange(colorToChangeCopy);
    if (Object.keys(changedColorItems).length >= 1 && !changedColorItems[key]) {
      setChangedColorItems({});
    }
    setChangedColorItems((prev: any) => ({ ...prev, [key]: true }));
  };

  const handleArchiveImageColorChange = async (key: string) => {
    if (currentPath.length === 0) return;
    console.log(key, archiveImageColorToChange);
    setChangedArchiveImageColorItems({});
    setArchiveImageColorToChange(null);

    let newKey = key.split(".")[0];
    const lastText = newKey.split("--").pop();
    if (
      lastText &&
      newKey.split("--").length >= 2 &&
      isColor(lastText) !== null
    ) {
      newKey =
        newKey.slice(0, newKey.lastIndexOf("--")) +
        "--" +
        archiveImageColorToChange.replaceAll("#", "") +
        "." +
        key.split(".")[1];
      console.log(newKey);
    } else {
      newKey =
        newKey +
        "--" +
        archiveImageColorToChange.replaceAll("#", "") +
        "." +
        key.split(".")[1];
      console.log(newKey);
    }

    const originalPath = "public/assets/" + currentPath.join("/") + "/" + key;
    const newPath = "public/assets/" + currentPath.join("/") + "/" + newKey;
    console.log(originalPath, newPath);
    await renameImageFile(originalPath, newPath);
    await getRepoTree();
  };

  const [changedArchiveImageColorItems, setChangedArchiveImageColorItems] =
    useState<any>({});
  const [archiveImageColorToChange, setArchiveImageColorToChange] =
    useState<any>(null);

  const handleImageColorChange = (key: string, newValue: string) => {
    console.log(key, newValue);
    setArchiveImageColorToChange(newValue);
    if (
      Object.keys(changedArchiveImageColorItems).length >= 1 &&
      !changedArchiveImageColorItems[key]
    ) {
      setChangedArchiveImageColorItems({});
    }
    setChangedArchiveImageColorItems((prev: any) => ({ ...prev, [key]: true }));
  };

  useEffect(() => {
    setChangedColorItems({});
    setColorToChange([null, null]);

    setChangedArchiveImageColorItems({});
    setArchiveImageColorToChange(null);
  }, [currentPath]);

  const renderContent = () => {
    const currentFolder = getCurrentFolder();
    const githubBaseUrl =
      "https://raw.githubusercontent.com/JosephGoff/js-portfolio/master/public/assets/";
    if (typeof currentFolder === "string") {
      return <></>;
    }

    // Render folders or multiple items, including images
    return (
      <div
        className={`flex flex-wrap gap-6 mt-6 ${
          currentPath[0] === "about" ||
          (currentPath[0] === "projects" && currentPath.length > 1) ||
          (currentPath[0] === "archives" && currentPath.length > 1)
            ? "pb-[95px] top-0 left-0 "
            : ""
        } min-h-[40px] justify-center absolute px-[22px]`}
        // style={{ backgroundColor: "red" }}
      >
        {Object.keys(currentFolder)
          .sort((a, b) => {
            const indexA = extractBeforeIndex(a);
            const indexB = extractBeforeIndex(b);
            const numA = indexA !== null ? Number(indexA) : Infinity; 
            const numB = indexB !== null ? Number(indexB) : Infinity; 
            return numA - numB; 
          })
          .map((key, index) => {
            console.log(key)
            const isSecondaryFolder =
              typeof currentFolder[key] !== "string" &&
              ((currentPath[0] === "projects" && key !== "covers") ||
                currentPath[0] === "archives");

            const isProjectFolder =
              typeof currentFolder[key] !== "string" &&
              currentPath[0] === "projects" &&
              key !== "covers";

            let projectFound = true;
            const projectItem = getFolderItem(key);
            if (projectItem === null) {
              projectFound = false;
            }

            // Archive Image Coloring Logic
            let defaultImgColor = "#CCCCCC";
            if (currentPath.length === 2 && currentPath[0] === "archives") {
              const imgName = key.split(".")[0];
              const imgColor = imgName.split("--").pop();
              if (
                imgColor &&
                imgName.split("--").length >= 2 &&
                isColor(imgColor) !== null
              ) {
                defaultImgColor = isColor(imgColor) || "#CCCCCC";
              }
            }

            console.log(key);
            console.log(extractBeforeIndex(key));

            return (
              <div
                key={key}
                style={{ display: key === "blank.png" ? "none" : "all" }}
                className={`min-w-[150px] flex ${
                  key === "covers" ? "h-[40px]" : ""
                } ${
                  isSecondaryFolder
                    ? "flex-col"
                    : "items-center justify-center w-[calc(33%-1rem)] max-w-[33%] sm:w-[calc(18%-1rem)] sm:max-w-[20%] min-w-[150px] "
                } relative p-2 bg-[#f9f9f9] border border-[#bbb] rounded-lg cursor-pointer`}
                onClick={() => handleFolderClick(key)}
              >
                <>
                  {key !== "about" &&
                    key !== "archives" &&
                    key !== "projects" &&
                    key !== "covers" && (
                      <>
                        <button
                          className="absolute top-[-10px] left-[-10px] w-[25px] h-[25px] bg-white border border-black rounded-full flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const basePath = `${currentPath.join("/")}/`;
                            openPopup(key, basePath);
                          }}
                        >
                          <BiSolidPencil
                            className="ml-[-0.5px]"
                            color={"black"}
                            size={13}
                          />
                        </button>

                        <button
                          className="absolute top-[-10px] right-[-10px] w-[25px] h-[25px] bg-white border border-black rounded-full flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete item?`)) {
                              const fullPath = `${currentPath.join(
                                "/"
                              )}/${key}`;
                              handleDeleteItem(fullPath);
                            }
                          }}
                        >
                          <FaTrash
                            className="ml-[0px]"
                            color={"black"}
                            size={11}
                          />
                        </button>

                        {isProjectFolder && projectFound && (
                          <button
                            className="absolute bottom-[-10px] left-[-10px] w-[25px] h-[25px] bg-white border border-black rounded-full flex items-center justify-center cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleStarChange(key);
                              await getRepoTree();
                            }}
                          >
                            {projectItem.home_page ? (
                              <IoStar
                                className="mt-[-1px]"
                                color={"green"}
                                size={15}
                              />
                            ) : (
                              <IoStarOutline
                                className="mt-[-1px]"
                                color={"#888"}
                                size={15}
                              />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  {typeof currentFolder[key] === "string" && (
                    <>
                      <img
                        src={`${githubBaseUrl}${currentPath.join("/")}/${key}`}
                        alt={key}
                        className="w-full h-auto mb-8"
                      />
                      <div className="bottom-0 absolute w-[100%] h-[30px] flex justify-center px-[3px]">
                        <span className="truncate overflow-hidden text-ellipsis">
                          {extractAfterIndex(key)}
                        </span>
                      </div>

                      {currentPath.length > 1 &&
                        currentPath[0] === "archives" && (
                          <>
                            <button
                              className="absolute bottom-[-10px] left-[-10px] w-[25px] h-[25px] bg-white border border-black rounded-full flex items-center justify-center cursor-pointer"
                              style={{ borderRadius: "50%" }}
                              onClick={async (e) => {
                                e.stopPropagation();
                              }}
                            >
                              <div className="w-[25px] h-[25px] rounded-full overflow-hidden">
                                <ColorPicker
                                  initialColor={defaultImgColor}
                                  primary={true}
                                  onColorChange={(
                                    primary: boolean,
                                    newValue: string
                                  ) => handleImageColorChange(key, newValue)}
                                />
                              </div>

                              <div
                                style={{
                                  border: "2px solid white",
                                  pointerEvents: "none",
                                }}
                                className="absolute top-0 left-0 w-[23px] h-[23px] rounded-full overflow-hidden"
                              ></div>
                              <div
                                style={{
                                  border: "1px solid #CCCCCC",
                                  pointerEvents: "none",
                                }}
                                className="absolute top-[-1px] left-[-1px] w-[25px] h-[25px] rounded-full overflow-hidden"
                              ></div>
                            </button>

                            {changedArchiveImageColorItems[key] && (
                              <button
                                style={{ border: "1px solid green" }}
                                className="rounded-full absolute bottom-[-10px] right-[-10px] w-[25px] h-[25px] bg-white flex items-center justify-center cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  handleArchiveImageColorChange(key);
                                }}
                              >
                                <FaCheck
                                  color={"green"}
                                  size={15}
                                  className="ml-[-0.5px]"
                                />
                              </button>
                            )}
                          </>
                        )}
                    </>
                  )}
                  {typeof currentFolder[key] !== "string" &&
                    currentPath[0] === "projects" &&
                    key !== "covers" && (
                      <div className="h-[200px] w-[auto]">
                        {!projectFound ? (
                          <>{key}</>
                        ) : (
                          <div
                            className="flex flex-col"
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            <p>{unSanitizeTitle(projectItem.title, false)}</p>
                            <p>
                              {unSanitizeTitle(projectItem.description, true)}
                            </p>
                            <div className="flex flex-row gap-2 mt-[7px]">
                              <div
                                onClick={(e: any) => e.stopPropagation()}
                                className="w-[25px] h-[25px] relative"
                              >
                                <ColorPicker
                                  initialColor={projectItem.bg_color}
                                  primary={true}
                                  onColorChange={(
                                    primary: boolean,
                                    newValue: string
                                  ) =>
                                    handleColorChange(key, primary, newValue)
                                  }
                                />
                              </div>
                              <div
                                onClick={(e: any) => e.stopPropagation()}
                                className="w-[25px] h-[25px] relative"
                              >
                                <ColorPicker
                                  initialColor={projectItem.text_color}
                                  primary={false}
                                  onColorChange={(
                                    primary: boolean,
                                    newValue: string
                                  ) =>
                                    handleColorChange(key, primary, newValue)
                                  }
                                />
                              </div>

                              {changedColorItems[key] && (
                                <button
                                  className="hover-dim7 ml-2 px-2 py-[2px] rounded text-[13px]"
                                  style={{
                                    color: "black",
                                    border: "1px solid black",
                                  }}
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleProjectColorsChange(key);
                                  }}
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  {typeof currentFolder[key] !== "string" &&
                    currentPath[0] === "archives" && (
                      <div className="h-[200px] w-[auto]">
                        {!projectFound ? (
                          <>{key}</>
                        ) : (
                          <div>
                            <p>{unSanitizeTitle(projectItem.title, false)}</p>
                            <div className="flex flex-row mt-[7px] ">
                              <div
                                onClick={(e: any) => e.stopPropagation()}
                                className="w-[25px] h-[25px] relative"
                              >
                                <ColorPicker
                                  initialColor={projectItem.bg_color}
                                  primary={true}
                                  onColorChange={(
                                    primary: boolean,
                                    newValue: string
                                  ) =>
                                    handleColorChange(key, primary, newValue)
                                  }
                                />
                              </div>

                              {changedColorItems[key] && (
                                <button
                                  className="hover-dim7 ml-2 px-2 py-[2px] rounded text-[13px]"
                                  style={{
                                    color: "black",
                                    border: "1px solid black",
                                  }}
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleProjectColorsChange(key);
                                  }}
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  {typeof currentFolder[key] !== "string" &&
                    (currentPath[0] !== "projects" || key === "covers") &&
                    currentPath[0] !== "archives" && (
                      <span className="">{key}</span>
                    )}
                </>
              </div>
            );
          })}
        <Popup
          isOpen={popupOpen}
          onClose={closePopup}
          title={popupTitle}
          desc={popupDesc}
          popupExtention={popupExtention}
          onRename={handleRename}
          popupTrigger={popupTrigger}
        />
      </div>
    );
  };

  const [uploadPopup, setUploadPopup] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setUploadPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const uploadToGitHub = async (images: { name: string; src: string }[]) => {
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

  const uploadBlankImageToGitHub = async (folderName: string) => {
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

  const handleFiles = (files: File[]) => {
    const currentfolderContents = collectImgNames();
    const getHighestIndex = (names: string[]) => {
      const indices = names.map((name) => parseInt(name.split("--")[0], 10));
      const validIndices = indices.filter((index) => !isNaN(index));
      return validIndices.length > 0 ? Math.max(...validIndices) : 100;
    };

    let highestIndex = 0;
    if (currentfolderContents.length > 0) {
      highestIndex = getHighestIndex(currentfolderContents);
    }
    let nextIndex = highestIndex + 1;

    const random4Digits = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };
    setLoading(true);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      const uploadedNames: string[] = [];
      const readerPromises = imageFiles.map((file) => {
        return new Promise<{ name: string; src: string }>((resolve) => {
          const extension = file.type.split("/").pop();
          if (!extension) return;

          // Remove extension
          const fullExtension = "." + extension;
          const newFileName = file.name.endsWith(fullExtension)
            ? file.name.slice(0, -fullExtension.length)
            : file.name;

          let sanitizedFileName = newFileName.replace(/[^a-zA-Z0-9]/g, "_");

          // Ensure img has extension
          if (!sanitizedFileName.endsWith(`.${extension}`)) {
            sanitizedFileName = `${sanitizedFileName}.${extension}`;
          }

          // Add index
          sanitizedFileName = `${nextIndex}--${sanitizedFileName}`;

          // Rename to prevent duplicates in folder and currently uploaded group
          const newNameSplit = sanitizedFileName.split(".");
          const newName = newNameSplit.slice(0, -1).join(".");

          if (currentfolderContents.includes(sanitizedFileName)) {
            sanitizedFileName = `${newName}--${random4Digits()}.${extension}`;
          }
          while (uploadedNames.includes(sanitizedFileName)) {
            sanitizedFileName = `${newName}--${random4Digits()}.${extension}`;
          }
          uploadedNames.push(sanitizedFileName);
          nextIndex += 1;

          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              name: sanitizedFileName,
              src: event.target?.result as string,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises)
        .then(async (images) => {
          setUploadPopup(false);
          await uploadToGitHub(images);
          await getRepoTree();
        })
        .then(() => {
          setLoading(false);
        });
    } else {
      alert("Only image files are allowed!");
    }
  };

  const handleAddFolder = async (folderName: string) => {
    setLoading(true);
    try {
      const pageName =
        currentPath[0] === "archives"
          ? "archives"
          : currentPath[0] === "projects"
          ? "projects"
          : null;
      if (pageName === null) return;
      const getPage = () => {
        if (
          currentPath &&
          currentPath.length === 1 &&
          fullProject &&
          fullProject[currentPath[0]]
        ) {
          const pageObject = fullProject[currentPath[0]] as any;
          if (currentPath[0] === "projects" || currentPath[0] === "archives") {
            delete pageObject["blank.png"];
            return pageObject;
          }
        }
        return null;
      };
      const pageObject = getPage();
      if (pageObject === null) return;

      const folderNames = Object.keys(pageObject).map(
        (item, index) => appFile["pages"][pageName][index].title
      );
      if (folderNames.includes(sanitizeTitle(folderName))) {
        alert("That folder name is already being used");
        return;
      }

      // Now get the app.json
      const appFileCopy = appFile;
      if (Object.keys(appFile).length === 0) return null;
      const pages = appFile["pages"];
      if (!pages || Object.keys(pages).length === 0) return null;
      const page = pages[pageName];
      if (!page || page.length === 0) return null;

      const itemLetter = pageName === "projects" ? "p" : "a";
      const titleNumbers = Object.keys(pageObject).map((item: string) =>
        parseInt(item.replaceAll("p", "").replaceAll("a", ""))
      );
      const highestIndexObject = page.reduce((maxObj: any, currentObj: any) =>
        currentObj.index > maxObj.index ? currentObj : maxObj
      );
      const nextIndex = highestIndexObject.index + 1;
      const nextTitle = itemLetter + (Math.max(...titleNumbers) + 1);

      if (pageName === "projects") {
        appFileCopy["pages"][pageName].push({
          index: nextIndex,
          id: nextTitle,
          title: sanitizeTitle(folderName),
          description: "default_description",
          bg_color: "white",
          text_color: "black",
          home_page: false,
        });
      }
      if (pageName === "archives") {
        appFileCopy["pages"][pageName].push({
          index: nextIndex,
          id: nextTitle,
          title: sanitizeTitle(folderName),
          bg_color: "white",
        });
      }
      setAppFile(appFileCopy);
      await updateAppData();

      await uploadBlankImageToGitHub(nextTitle);
      setTimeout(async () => {
        await getRepoTree();
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!fullProject) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="w-[100vw] h-[100vh]"
      style={{ pointerEvents: loading ? "none" : "all" }}
    >
      {uploadPopup && (
        <div className="z-[999] fixed top-0 left-0">
          <div
            className="absolute top-0 w-[100vw] h-[100vh]"
            style={{ backgroundColor: "black", opacity: 0.4 }}
          ></div>
          <div className="absolute top-0 w-[100vw] h-[100vh] flex items-center justify-center">
            <div
              ref={divRef}
              className="w-[70%] aspect-[1.5/1] relative"
              style={{
                userSelect: "none",
                backgroundColor: "white",
                borderRadius: "30px",
                border: "3px solid black",
              }}
            >
              <Upload handleFiles={handleFiles} />
              <IoCloseOutline
                onClick={() => {
                  setUploadPopup(false);
                }}
                className="absolute top-2 right-3"
                style={{ cursor: "pointer" }}
                color={"black"}
                size={50}
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-[100%] h-[calc(100vh-63px)] absolute left-0 top-[63px] flex items-center justify-center">
        {renderContent()}
      </div>

      <div
        className="z-[998] w-[100%] h-[63px] fixed left-0 top-0"
        style={{ backgroundColor: "white", borderBottom: "1px solid #CCCCCC" }}
      >
        {currentPath.length > 0 && (
          <button
            onClick={handleBackClick}
            className="button absolute top-3 left-3"
          >
            Back
          </button>
        )}

        <div
          className={`h-[100%] flex items-center ${
            currentPath.length > 0 ? "ml-[100px]" : "ml-[30px]"
          } font-[500] text-[20px]`}
        >
          <div>Project Dashboard</div>
        </div>

        {loading && (
          <div className="absolute top-4 right-[107px] simple-spinner"></div>
        )}
        <button onClick={onLogout} className="button absolute top-3 right-3">
          Logout
        </button>
      </div>

      {currentPath.length > 0 && (
        <div
          className="z-[998] w-[100%] h-[63px] fixed left-0 bottom-0"
          style={{ backgroundColor: "white", borderTop: "1px solid #CCCCCC" }}
        >
          {currentPath.length === 1 &&
            (currentPath[0] === "archives" ||
              currentPath[0] === "projects") && (
              <button
                onClick={() => {
                  const folderName = window.prompt("Folder Name:");
                  if (folderName && folderName !== "") {
                    const sanitizedFolderName = folderName
                      .trim()
                      .replace(/[^a-zA-Z0-9-]/g, "_");
                    handleAddFolder(sanitizedFolderName);
                  }
                }}
                className="button absolute bottom-3 right-3"
              >
                Add Folder
              </button>
            )}

          {currentPath.length > 0 &&
            (currentPath[0] === "about" ||
              (currentPath[0] === "archives" && currentPath.length === 2) ||
              (currentPath[0] === "projects" &&
                (currentPath.length === 2 || currentPath.length === 3))) && (
              <button
                onClick={() => {
                  setUploadPopup(true);
                }}
                className="button absolute bottom-3 right-3"
              >
                Upload
              </button>
            )}
        </div>
      )}
    </div>
  );
};

export default Admin;
