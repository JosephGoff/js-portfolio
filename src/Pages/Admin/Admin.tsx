import React, { useEffect, useRef, useState } from "react";
import "./Admin.css";
import { BiPlus, BiSolidPencil } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import Upload from "./Upload";
import ColorPicker from "./ColorPicker";
import axios from "axios";
import { GoChevronRight } from "react-icons/go";
import { GIT_KEYS } from "../../config";
import Draggable from "react-draggable";
import { FaUndoAlt } from "react-icons/fa";
import { getCurrentTimestamp } from "../../utils/helperFunctions";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <div className="flex justify-center items-center absolute left-0 top-0 h-[100vh] w-[100vw]">
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <div className="loginBox pb-[10vh]">
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
  const { owner, repo, branch, token } = GIT_KEYS;

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("Loading...");
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [projectFile, setProjectFile] = useState<any>({});

  useEffect(() => {
    const fetchProject = async () => {
      const project = await getProject();
      if (project === null) {
        setLoadingText("Something went wrong");
      }
    };

    fetchProject();
  }, []);

  const getProject = async () => {
    const returnedProject: any[] = [null, null];
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1&t=${new Date().getTime()}`;

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

      if (
        Object.keys(tree).length > 0 &&
        Object.keys(tree).includes("project.json")
      ) {
        if (Object.keys(tree).includes("images")) {
          returnedProject[0] = Object.keys(tree["images"]);
          setProjectImages(Object.keys(tree["images"]));
        } else {
          returnedProject[0] = [];
          setProjectImages([]);
        }

        const projectJSONLink = tree["project.json"];

        try {
          const response = await fetch(projectJSONLink, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          // Correctly decode Base64 content into UTF-8
          const base64Content = data.content;
          const decodedContent = new TextDecoder("utf-8").decode(
            Uint8Array.from(atob(base64Content), (char) => char.charCodeAt(0))
          );

          if (decodedContent) {
            try {
              const parsedContent = JSON.parse(decodedContent);
              setProjectFile(parsedContent);
              returnedProject[1] = parsedContent;
              if (returnedProject[0] === null || returnedProject[1] === null) {
                return null;
              } else {
                return returnedProject;
              }
            } catch (error) {
              console.error("Error parsing JSON content:", error);
            }
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error fetching file contents:", error);
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching repository tree:", error);
      return null;
    }
  };

  const updateProjectFile = async (newProjectFile: any) => {
    setLoading(true);
    cancelTimer();
    const filePath = "project.json";
    try {
      const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      };
      const { data: fileInfo } = await axios.get(fileUrl, { headers });
      const fileSha = fileInfo.sha;

      // Convert the JSON to a UTF-8 encoded Base64 string
      const updatedContent = btoa(
        unescape(
          encodeURIComponent(
            typeof newProjectFile === "string"
              ? newProjectFile
              : JSON.stringify(newProjectFile)
          )
        )
      );
      const commitMessage = "Update project.json with new content";
      await axios.put(
        fileUrl,
        {
          message: commitMessage,
          content: updatedContent,
          sha: fileSha,
          branch,
        },
        { headers }
      );

      console.log("Project file updated successfully");
      setProjectFile(newProjectFile);
      return true;
    } catch (error) {
      console.error("Error updating project file:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editDetailsMode, setEditDetailsMode] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(true);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleSideBarToggle = () => {
    setSideBarOpen((prev) => !prev);
    if (sidebarRef.current) {
      sidebarRef.current.style.transition =
        "left 0.25s ease-in-out, width 0.25s ease-in-out";
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.style.transition = "none";
        }
      }, 250);
    }
  };

  const handlePageClick = async (pageName: string) => {
    setCurrentPath([pageName]);
  };

  const handleAddPage = async (pageName: string) => {
    setLoading(true);
    if (projectFile === undefined || projectFile === null) return;
    const projectFileObject = structuredClone(projectFile);
    const projectFileContents = projectFileObject.children;
    if (!Object.keys(projectFileContents).includes(pageName)) {
      let highestIndex = 0;
      let newIndex = 0;

      for (let i = 0; i < Object.keys(projectFileContents).length; i++) {
        if (
          projectFileContents[Object.keys(projectFileContents)[i]].index >=
          highestIndex
        ) {
          highestIndex =
            projectFileContents[Object.keys(projectFileContents)[i]].index;
          newIndex = highestIndex + 1;
        }
      }

      let highestKeyIndex = 0;
      let newKeyIndex = 0;
      for (let i = 0; i < Object.keys(projectFileContents).length; i++) {
        if (parseInt(Object.keys(projectFileContents)[i]) >= highestKeyIndex) {
          highestKeyIndex = parseInt(Object.keys(projectFileContents)[i]);
          newKeyIndex = highestKeyIndex + 1;
        }
      }

      projectFileContents[newKeyIndex] = {
        type: "folder",
        name: pageName,
        index: newIndex,
        children: {},
        details: {
          colors: [],
          text: [],
        },
      };
      projectFileObject.children = projectFileContents;
      await updateProjectFile(projectFileObject);
    } else {
      alert("That page name is already being used");
      return;
    }
    setLoading(false);
  };

  const handleDeletePage = async (folderName: string) => {
    setLoading(true);
    if (
      projectFile !== null &&
      projectFile !== undefined &&
      Object.keys(projectFile).includes("children") &&
      Object.keys(projectFile.children).includes(folderName)
    ) {
      const projectFileCopy = projectFile;
      delete projectFileCopy.children[folderName];
      await updateProjectFile(projectFileCopy);
    }
    setLoading(false);
  };

  const getCurrentFolder = () => {
    if (!projectFile) return null;

    let currentFolder = projectFile;
    if (currentPath.length === 0) {
      return currentFolder;
    }
    for (let i = 0; i < currentPath.length; i++) {
      currentFolder = currentFolder.children[currentPath[i]];
    }
    return currentFolder;
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleAddFolder = async (folderName: string) => {
    setLoading(true);
    const currentFolder = getCurrentFolder();
    if (
      currentFolder !== null &&
      currentFolder !== undefined &&
      typeof currentFolder === "object" &&
      "children" in currentFolder
    ) {
      if (Object.keys(currentFolder.children).includes(folderName)) {
        alert("That page name is already being used");
        return;
      } else {
        if (projectFile === undefined || projectFile === null) return;
        const projectFileObject = structuredClone(projectFile);
        const children = currentFolder.children;
        let highestIndex = 0;
        let newIndex = 0;
        for (const key in children) {
          if (children[key].index >= highestIndex) {
            highestIndex = children[key].index;
            newIndex = highestIndex + 1;
          }
        }

        let highestKeyIndex = 0;
        let newKeyIndex = 0;
        for (const key in children) {
          if (parseInt(key) >= highestKeyIndex) {
            highestKeyIndex = parseInt(key);
            newKeyIndex = highestKeyIndex + 1;
          }
        }

        const newEntryData = {
          type: "folder",
          name: folderName,
          index: newIndex,
          children: {},
          details: {
            colors: [],
            text: [],
          },
        };
        const getTargetObject = (obj: any, path: string[]) => {
          return path.reduce((acc, key) => acc?.children?.[key], obj);
        };
        const targetObject = getTargetObject(projectFileObject, currentPath);
        if (targetObject && targetObject.children) {
          targetObject.children[newKeyIndex] = newEntryData;
        } else {
          return;
        }

        await updateProjectFile(projectFileObject);
      }
    }
    setLoading(false);
  };

  const handleDeleteItem = async (folderName: string) => {
    setLoading(true);
    const currentFolder = getCurrentFolder();
    if (
      currentFolder !== null &&
      currentFolder !== undefined &&
      typeof currentFolder === "object" &&
      "children" in currentFolder
    ) {
      if (Object.keys(currentFolder.children).includes(folderName)) {
        if (projectFile === undefined || projectFile === null) return;
        const projectFileObject = structuredClone(projectFile);
        const getTargetObject = (obj: any, path: string[]) => {
          return path.reduce((acc, key) => acc?.children?.[key], obj);
        };
        let targetObject = getTargetObject(projectFileObject, currentPath);
        if (targetObject && targetObject.children) {
          delete targetObject.children[folderName];
        }
        if (Object.keys(targetObject.children).length > 1) {
          let sortedEntries = Object.entries(targetObject.children).sort(
            (a: any, b: any) => a[1].index - b[1].index
          );
          sortedEntries.forEach(
            (obj: any, newIndex: number) => (obj[1].index = newIndex)
          );
          for (let i = 0; i < sortedEntries.length; i++) {
            targetObject.children[sortedEntries[i][0]] = sortedEntries[i][1];
          }
        } else if (Object.keys(targetObject.children).length === 1) {
          targetObject.children[
            Object.keys(targetObject.children)[0]
          ].index = 0;
        }
        await updateProjectFile(projectFileObject);
      }
    }
    setLoading(false);
  };

  const handleDeleteFolderDetail = async (
    objectType: string,
    index: number
  ) => {
    setLoading(true);
    const currentFolder = getCurrentFolder();
    if (
      currentFolder !== null &&
      currentFolder !== undefined &&
      typeof currentFolder === "object" &&
      Object.keys(currentFolder).includes("details") &&
      Object.keys(currentFolder["details"]).includes(objectType) &&
      currentFolder["details"][objectType].findIndex(
        (item: any) => item.index === index
      ) !== -1
    ) {
      if (projectFile === undefined || projectFile === null) return;
      const projectFileObject = structuredClone(projectFile);
      const getTargetObject = (obj: any, path: string[]) => {
        return path.reduce((acc, key) => acc?.children?.[key], obj);
      };
      const targetObject = getTargetObject(projectFileObject, currentPath);
      if (
        targetObject &&
        Object.keys(targetObject).includes("details") &&
        Object.keys(targetObject["details"]).includes(objectType) &&
        targetObject["details"][objectType].findIndex(
          (item: any) => item.index === index
        ) !== -1
      ) {
        const foundIndex = targetObject["details"][objectType].findIndex(
          (item: any) => item.index === index
        );
        targetObject["details"][objectType] = targetObject["details"][
          objectType
        ].filter((item: any, index: number) => index !== foundIndex);
      }
      await updateProjectFile(projectFileObject);
    }
    setLoading(false);
  };

  const handleAddFolderDetail = async (objectType: string) => {
    setLoading(true);
    const currentFolder = getCurrentFolder();
    if (
      currentFolder !== null &&
      currentFolder !== undefined &&
      typeof currentFolder === "object" &&
      Object.keys(currentFolder).includes("details") &&
      Object.keys(currentFolder["details"]).includes(objectType)
    ) {
      if (projectFile === undefined || projectFile === null) return;
      const projectFileObject = structuredClone(projectFile);
      const getTargetObject = (obj: any, path: string[]) => {
        return path.reduce((acc, key) => acc?.children?.[key], obj);
      };
      const targetObject = getTargetObject(projectFileObject, currentPath);
      if (
        targetObject &&
        Object.keys(targetObject).includes("details") &&
        Object.keys(targetObject["details"]).includes(objectType)
      ) {
        let highestIndex = 0;
        let newIndex = 0;
        for (let i = 0; i < targetObject["details"][objectType].length; i++) {
          if (targetObject["details"][objectType][i].index >= highestIndex) {
            highestIndex = targetObject["details"][objectType][i].index;
            newIndex = highestIndex + 1;
          }
        }

        const newEntry =
          objectType === "colors"
            ? {
                name: `Color ${newIndex + 1}`,
                value: "#999999",
                index: newIndex,
              }
            : {
                name: `Text ${newIndex + 1}`,
                value: "New Text",
                index: newIndex,
              };

        targetObject["details"][objectType].push(newEntry);
      }
      await updateProjectFile(projectFileObject);
    }
    setLoading(false);
  };

  const handleEditFolderColor = async (index: number, newColor: string) => {
    setLoading(true);
    const currentFolder = getCurrentFolder();
    if (
      currentFolder !== null &&
      currentFolder !== undefined &&
      typeof currentFolder === "object" &&
      Object.keys(currentFolder).includes("details") &&
      Object.keys(currentFolder["details"]).includes("colors") &&
      currentFolder["details"]["colors"].findIndex(
        (item: any) => item.index === index
      ) !== -1
    ) {
      if (projectFile === undefined || projectFile === null) return;
      const projectFileObject = structuredClone(projectFile);
      const getTargetObject = (obj: any, path: string[]) => {
        return path.reduce((acc, key) => acc?.children?.[key], obj);
      };
      const targetObject = getTargetObject(projectFileObject, currentPath);
      if (
        targetObject &&
        Object.keys(targetObject).includes("details") &&
        Object.keys(targetObject["details"]).includes("colors") &&
        targetObject["details"]["colors"].findIndex(
          (item: any) => item.index === index
        ) !== -1
      ) {
        const foundIndex = targetObject["details"]["colors"].findIndex(
          (item: any) => item.index === index
        );
        targetObject["details"]["colors"][foundIndex].value = newColor;
      }
      await updateProjectFile(projectFileObject);
    }
    setLoading(false);
  };

  const updateFolderName = (newValue: string) => {
    if (
      currentPath.length === 1 &&
      Object.keys(projectFile).includes("projectDetails") &&
      Object.keys(projectFile["projectDetails"]).includes("pagesLock") &&
      projectFile.projectDetails.pagesLock
    ) {
      return;
    }
    const newProjectFile = { ...projectFile };
    let node = newProjectFile;
    for (let i = 0; i < currentPath.length; i++) {
      if (!node.children[currentPath[i]]) return projectFile;
      node.children[currentPath[i]] = { ...node.children[currentPath[i]] };
      node = node.children[currentPath[i]];
    }
    node.name = newValue;
    setProjectFile(newProjectFile);
    resetTimer();
  };

  const updateFolderDetailsItem = (
    objectType: string,
    index: number,
    newValue: string,
    isTitle: boolean
  ) => {
    const newProjectFile = { ...projectFile };
    let node = newProjectFile;
    for (let i = 0; i < currentPath.length; i++) {
      if (!node.children[currentPath[i]]) return;
      node.children[currentPath[i]] = { ...node.children[currentPath[i]] };
      node = node.children[currentPath[i]];
    }

    const foundIndex = node["details"][objectType].findIndex(
      (item: any) => item.index === index
    );
    if (foundIndex !== -1) {
      if (isTitle) {
        node["details"][objectType][foundIndex]["name"] = newValue;
      } else {
        if (objectType === "colors") {
          node["details"][objectType][foundIndex]["name"] = newValue;
        } else if (objectType === "text") {
          node["details"][objectType][foundIndex]["value"] = newValue;
        }
      }
    }
    setProjectFile(newProjectFile);
    resetTimer();
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(async () => {
      await updateProjectFile(projectFile);
    }, 3000);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimer();
  };

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReorganizeItem = async (item: any) => {
    if (finalDraggedIndex === null) return;

    const currentFolder = getCurrentFolder();
    if (
      currentFolder !== null &&
      currentFolder !== undefined &&
      Object.keys(currentFolder).includes("children") &&
      Object.keys(currentFolder.children).length > 0
    ) {
      const project = projectFile;
      if (project === undefined || project === null) return;
      const projectFileObject = structuredClone(project);
      const getTargetObject = (obj: any, path: string[]) => {
        return path.reduce((acc, key) => acc?.children?.[key], obj);
      };
      const targetObject = getTargetObject(projectFileObject, currentPath);
      if (
        targetObject !== null &&
        targetObject !== undefined &&
        Object.keys(targetObject).includes("children") &&
        Object.keys(targetObject.children).length > 0
      ) {
        let highestIndex = 0;
        for (let i = 0; i < Object.keys(targetObject.children).length; i++) {
          if (
            targetObject.children[Object.keys(targetObject.children)[i]].index >
            highestIndex
          ) {
            highestIndex =
              targetObject.children[Object.keys(targetObject.children)[i]]
                .index;
          }
        }
        const startingIndex = currentFolder.children[item].index;
        let finalIndex = finalDraggedIndex;
        if (highestIndex < finalDraggedIndex) {
          finalIndex = highestIndex;
        }
        if (finalIndex === startingIndex) return;

        setLoading(true);
        setPositions((prev: any) => ({
          ...prev,
          [item]: finalDragPosition,
        }));

        for (let i = 0; i < Object.keys(targetObject.children).length; i++) {
          let item =
            targetObject.children[Object.keys(targetObject.children)[i]];

          if (item.index === startingIndex) {
            item.index = finalIndex;
          } else {
            if (item.index > startingIndex && item.index <= finalIndex) {
              item.index -= 1;
            } else if (item.index < startingIndex && item.index >= finalIndex) {
              item.index += 1;
            }
          }
        }
      }

      await updateProjectFile(projectFileObject);
      setFinalDragPosition({ x: 0, y: 0 });
      setFinalDraggedIndex(null);
      setPositions((prev: any) => {
        const newPositions = { ...prev };
        for (let i = 0; i < Object.keys(currentFolder.children).length; i++) {
          const itemKey = Object.keys(currentFolder.children)[i];
          newPositions[itemKey].x = 0;
          newPositions[itemKey].y = 0;
        }
        return newPositions;
      });
    }
    setLoading(false);
  };

  const handleDrag = (x: number, y: number, item: string, itemObject: any) => {
    const gridColumns = window.innerWidth > 1024 ? 4 : 2;
    if (renderContentParentRef.current && divRefs.current[0] !== null) {
      const itemWidth = divRefs.current[0].offsetWidth;
      const itemHeight = divRefs.current[0].offsetHeight;
      const parentWidth = renderContentParentRef.current.offsetWidth - 30;

      const halfY = y > 0 ? 0.5 : -0.5;
      let spacesVertical = y / (itemHeight + 15) + halfY;
      spacesVertical =
        spacesVertical > 0
          ? Math.floor(spacesVertical)
          : Math.ceil(spacesVertical);

      const halfX = x > 0 ? 0.5 : -0.5;
      let spacesHorizontal = x / (itemWidth + 15) + halfX;
      spacesHorizontal =
        spacesHorizontal > 0
          ? Math.floor(spacesHorizontal)
          : Math.ceil(spacesHorizontal);

      const startingIndex = itemObject[item].index;
      const finalIndex =
        itemObject[item].index +
        spacesHorizontal +
        spacesVertical * gridColumns;
      if (finalDraggedIndex !== finalIndex) {
        setFinalDraggedIndex(finalIndex);
      }

      setFinalDragPosition({
        x: spacesHorizontal * (itemWidth + 14.5),
        y: spacesVertical * (itemHeight + 15),
      });

      setPositions((prev: any) => {
        const newPositions = { ...prev };
        for (let i = 0; i < Object.keys(itemObject).length; i++) {
          const itemKey = Object.keys(itemObject)[i];
          if (itemKey === item) continue;
          if (
            itemObject[itemKey].index > startingIndex &&
            itemObject[itemKey].index <= finalIndex
          ) {
            newPositions[itemKey].x =
              itemObject[itemKey].index % gridColumns === 0
                ? parentWidth - itemWidth
                : -itemWidth - 14.5;
            newPositions[itemKey].y =
              itemObject[itemKey].index % gridColumns === 0
                ? -itemHeight - 15
                : 0;
          } else if (
            itemObject[itemKey].index < startingIndex &&
            itemObject[itemKey].index >= finalIndex
          ) {
            newPositions[itemKey].x =
              (itemObject[itemKey].index + 1) % gridColumns === 0
                ? -parentWidth + itemWidth
                : itemWidth + 14.5;
            newPositions[itemKey].y =
              (itemObject[itemKey].index + 1) % gridColumns === 0
                ? itemHeight + 15
                : 0;
          } else {
            newPositions[itemKey].x = 0;
            newPositions[itemKey].y = 0;
          }
        }
        return newPositions;
      });
    }
  };

  const divRefs = useRef<HTMLDivElement[] | null[]>([]);
  const renderContentParentRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<any>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [finalDraggedIndex, setFinalDraggedIndex] = useState<number | null>(
    null
  );
  const [finalDragPosition, setFinalDragPosition] = useState<any>({
    x: 0,
    y: 0,
  });

  const renderContent = () => {
    if (currentPath.length === 0) {
      return <></>;
    }
    const currentFolder = getCurrentFolder();
    if (
      currentFolder === null ||
      currentFolder === undefined ||
      typeof currentFolder === "string"
    ) {
      return <></>;
    }

    return (
      <div
        ref={renderContentParentRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-[15px] w-full h-[auto] p-[15px]"
      >
        {currentFolder.type === "folder" &&
          Object.keys(currentFolder.children).length > 0 &&
          Object.keys(currentFolder.children)
            .sort(
              (a, b) =>
                currentFolder.children[a].index -
                currentFolder.children[b].index
            )
            .map((item: any, index: number) => {
              const folderChildren = currentFolder.children as any;
              if (!positions[item]) {
                setPositions((prev: any) => ({
                  ...prev,
                  [item]: { x: 0, y: 0 },
                }));
              }

              return (
                <Draggable
                  key={index}
                  bounds="parent"
                  position={positions[item]}
                  onDrag={(e, data) => {
                    if (draggedItem === null) {
                      setDraggedItem(item);
                    }
                    handleDrag(data.x, data.y, item, currentFolder.children);
                  }}
                  disabled={editDetailsMode}
                  onStop={() => {
                    if (!editDetailsMode) {
                      if (draggedItem === null) {
                        if (folderChildren[item].type === "image") {
                          window.location.href =
                            currentFolder.children[item].link;
                        } else {
                          handleFolderClick(item);
                        }
                      }
                      setDraggedItem(null);
                      handleReorganizeItem(item);
                    }
                  }}
                >
                  <div
                    ref={(el) => (divRefs.current[index] = el)}
                    className={`${
                      draggedItem === item ? "z-[103]" : ""
                    } cursor-pointer ${
                      folderChildren[item].type === "image"
                        ? "h-[200px]"
                        : "h-[48px]"
                    } bg-[#EEEEEE] relative border border-gray-400 rounded-md justify-center flex p-[10px] select-none`}
                  >
                    {editDetailsMode && (
                      <button
                        className="absolute top-[-10px] right-[-10px] w-[23px] h-[23px] border border-[#999] bg-[#FFFFFF] rounded-full flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              folderChildren[item].type === "image"
                                ? "Delete image?"
                                : `Delete ${folderChildren[item].name}?`
                            )
                          ) {
                            handleDeleteItem(item);
                          }
                        }}
                      >
                        <FaTrash color={"#222"} size={11} />
                      </button>
                    )}
                    {folderChildren[item].type === "image" ? (
                      <img
                        alt=""
                        draggable="false"
                        onDragStart={(event) => event.preventDefault()}
                        className="select-none pointer-events-none w-[100%] h-[100%] object-contain"
                        src={folderChildren[item].link}
                      />
                    ) : (
                      <div className="w-auto h-full block truncate">
                        {folderChildren[item].name}
                      </div>
                    )}
                  </div>
                </Draggable>
              );
            })}
      </div>
    );
  };

  const [uploadPopup, setUploadPopup] = useState(false);
  const uploadPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        uploadPopupRef.current &&
        !uploadPopupRef.current.contains(event.target as Node)
      ) {
        setUploadPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  type FileImage = {
    name: string;
    file: File;
  };

  const handleSend = async (files: FileImage[]) => {
    const formData = new FormData();
    files.forEach((fileImage, index) => {
      formData.append("files", fileImage.file, fileImage.name);
    });
    formData.append("branch", GIT_KEYS.branch);
    formData.append("repo", GIT_KEYS.repo);
    formData.append("owner", GIT_KEYS.owner);
    try {
      const local = false;
      let serverUrl =
        "https://cms-server-production-b414.up.railway.app/compress";
      if (local) {
        serverUrl = "http://localhost:3001/compress";
      }
      const response = await axios.post(serverUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error("Upload error:", error);
      return false;
    }
  };

  const handleFiles = (files: File[]) => {
    if (
      projectFile === null ||
      projectFile === undefined ||
      currentPath.length === 0
    ) {
      return;
    }
    const currentFolder = getCurrentFolder();
    if (
      currentFolder === null ||
      currentFolder === undefined ||
      typeof currentFolder === "string"
    ) {
      return;
    }

    setLoading(true);
    let highestIndex = 0;
    let nextIndex = 0;
    for (let i = 0; i < Object.keys(currentFolder.children).length; i++) {
      if (
        currentFolder.children[Object.keys(currentFolder.children)[i]].index >=
        highestIndex
      ) {
        highestIndex =
          currentFolder.children[Object.keys(currentFolder.children)[i]].index;
        nextIndex = highestIndex + 1;
      }
    }

    const projectFileObject = structuredClone(projectFile);
    const uploadedNames: string[] = [];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const readerPromises = imageFiles.map((file) => {
        return new Promise<FileImage>(async (resolve) => {
          const extension = file.type.split("/").pop();
          if (!extension) return;

          const lastDotIndex = file.name.lastIndexOf(".");
          if (lastDotIndex === -1) return;
          const newFileName = file.name.slice(0, lastDotIndex);

          let sanitizedFileName = newFileName.replace(/[^a-zA-Z0-9]/g, "_");
          const newExtension = "webp";
          const timeStamp = getCurrentTimestamp();

          sanitizedFileName = `${timeStamp}--${sanitizedFileName}.${newExtension}`;
          uploadedNames.push(sanitizedFileName);

          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const imageWidth = img.width;
              const imageHeight = img.height;

              if (Object.keys(currentFolder).includes("children")) {
                const getTargetObject = (obj: any, path: string[]) => {
                  return path.reduce((acc, key) => acc?.children?.[key], obj);
                };
                const targetObject = getTargetObject(
                  projectFileObject,
                  currentPath
                );

                if (
                  Object.keys(targetObject).length > 0 &&
                  Object.keys(targetObject).includes("children")
                ) {
                  targetObject.children[nextIndex] = {
                    type: "image",
                    index: nextIndex,
                    width: imageWidth,
                    height: imageHeight,
                    link:
                      "https://raw.githubusercontent.com/open-dream-studios/test-project/refs/heads/main/images/" +
                      sanitizedFileName,
                  };
                }
              }

              nextIndex += 1;
              resolve({
                name: sanitizedFileName,
                file: file,
              });
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises)
        .then(async (images) => {
          setUploadPopup(false);
          await handleSend(images);
        })
        .then(async () => {
          await updateProjectFile(projectFileObject);
          setLoading(false);
        });
    } else {
      alert("Only image files are allowed!");
    }
  };

  const [showResetOption, setShowResetOption] = useState<boolean>(false);

  if (projectImages.length === 0 && Object.keys(projectFile).length === 0) {
    return <div>{loadingText}</div>;
  }

  return (
    <div
      className="w-[100vw] h-[100vh] fixed"
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
              ref={uploadPopupRef}
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

      <div
        className="z-[998] w-[100%] h-[63px] fixed left-0 top-0 flex flex-row"
        style={{ backgroundColor: "white", borderBottom: "1px solid #CCCCCC" }}
      >
        <div className="h-[100%] w-[50px] items-center flex justify-end">
          <button
            onClick={handleSideBarToggle}
            style={{ transform: "scale(0.8)" }}
            className="cursor-pointer absolute flex-col gap-[5px] w-[40px] h-[40px] flex items-center justify-center"
          >
            <div className="bg-black w-[30px] h-[3px]"></div>
            <div className="bg-black w-[30px] h-[3px]"></div>
            <div className="bg-black w-[30px] h-[3px]"></div>
          </button>
        </div>

        <div
          className={`h-[100%] flex items-center ml-[11px]
          font-[500] text-[20px] mt-[-1px]`}
        >
          <div
            className="cursor-pointer"
            onClick={() => {
              setCurrentPath([]);
            }}
          >
            Project Dashboard
          </div>
          <div className="ml-[25px] flex flex-row">
            {currentPath.map((item: any, index: number) => {
              let currentPathCutoff = currentPath.slice(0, index + 1);
              let node = projectFile;
              for (let i = 0; i < currentPathCutoff.length; i++) {
                if (!node.children[currentPathCutoff[i]]) return "";
                node.children[currentPathCutoff[i]] = {
                  ...node.children[currentPathCutoff[i]],
                };
                node = node.children[currentPathCutoff[i]];
              }
              const pathItemName = node.name;
              return (
                <div
                  className="ml-[5px] flex flex-row mt-[1px] cursor-pointer"
                  onClick={() => {
                    setCurrentPath(currentPath.slice(0, index + 1));
                  }}
                  key={index}
                >
                  <p style={{ color: "#AAAAAA" }}>{pathItemName}</p>
                  {currentPath.length - 1 > 0 &&
                    index !== currentPath.length - 1 && (
                      <GoChevronRight
                        className="mt-[1px] mx-[1px]"
                        color={"#AAAAAA"}
                        size={29}
                      />
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="absolute top-4 right-[107px] simple-spinner"></div>
        )}
        <button
          onClick={onLogout}
          className="button absolute top-3 right-[13px]"
        >
          Logout
        </button>
      </div>

      <div className="absolute w-[100%] h-[calc(100%-63px)] top-[63px] left-0 flex justify-end">
        <div
          style={{
            transform: sideBarOpen
              ? "translateX(0px)"
              : window.innerWidth > 1024
              ? "translateX(-180px)"
              : "translateX(-140px)",
            transition: "transform 0.3s ease-in-out",
            borderRight: "1px solid #BBBBBB",
          }}
          className="z-[500] bg-[white] w-[140px] lg:w-[180px] h-[100%] absolute top-0 left-0 px-[12px] pt-[6px]"
        >
          <div className="relative select-none">
            <p
              className="font-[500] text-[16px] pb-[5px] mb-[5px]"
              style={{ borderBottom: "1px solid #BBB" }}
            >
              Pages
            </p>

            {Object.keys(projectFile).includes("projectDetails") &&
              Object.keys(projectFile["projectDetails"]).includes(
                "pagesLock"
              ) &&
              !projectFile.projectDetails.pagesLock && (
                <BiSolidPencil
                  onClick={() => {
                    setEditMode((prev) => !prev);
                  }}
                  color={"#222"}
                  size={24}
                  className={`p-[3px] right-[1px] border-[#999] ${
                    editMode && "bg-[#DDDDDD]"
                  }  absolute top-0 cursor-pointer`}
                  style={{ borderRadius: "8px", border: "0.1px solid #999" }}
                />
              )}
            {/* 
            {Object.keys(projectFile).includes("projectDetails") &&
              Object.keys(projectFile["projectDetails"]).includes(
                "pagesLock"
              ) && (
                <FaUndoAlt
                  onClick={() => {
                    if (window.prompt("Are you sure you want to reset your project? \n \nThis will delete all folders and images within each page. Press ok to reset to a blank slate.")) {
                      console.log(1);
                    }
                  }}
                  color={"#222"}
                  size={23}
                  className={`p-[5px] ${
                    !projectFile.projectDetails.pagesLock
                      ? "right-[29px]"
                      : "right-[1px]"
                  } border-[#999] 
                  absolute top-0 cursor-pointer`}
                  style={{ borderRadius: "8px", border: "0.1px solid #999" }}
                />
              )} */}
          </div>
          {Object.keys(projectFile).length > 0 &&
            projectFile.children &&
            Object.keys(projectFile.children)
              .sort(
                (a, b) =>
                  projectFile.children[a].index - projectFile.children[b].index
              )
              .map((key, index) => {
                return (
                  <div
                    key={index}
                    style={{ borderRadius: "3px" }}
                    className={`cursor-pointer hover-dim pl-[6px] pt-[2px] pb-[3px] relative flex flex-row ${
                      currentPath.length > 0 &&
                      currentPath[0] === key &&
                      "bg-[#DDDDDD]"
                    }`}
                    onClick={() => {
                      handlePageClick(key);
                    }}
                  >
                    <p>{projectFile.children[key].name}</p>
                    {editMode && (
                      <button
                        className="absolute bg-white right-[10px] w-[23px] h-[23px] border rounded-full flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete page: ${key}?`)) {
                            handleDeletePage(key);
                          }
                        }}
                      >
                        <FaTrash color={"#222"} size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
          {Object.keys(projectFile).includes("projectDetails") &&
            Object.keys(projectFile["projectDetails"]).includes("pagesLock") &&
            !projectFile.projectDetails.pagesLock && (
              <div className="w-[calc(100%-24px)] flex justify-center absolute bottom-[15px]">
                <button
                  onClick={() => {
                    const folderName = window.prompt("New Page Name:");
                    if (folderName && folderName !== "") {
                      handleAddPage(folderName.trim());
                    }
                  }}
                  className="px-[10px] py-[5px] text-[13px] flex-items-center justify-center font-[500]"
                  style={{ borderRadius: "3px", border: "1px solid #999" }}
                >
                  Add Page
                </button>
              </div>
            )}
        </div>
        <div
          ref={sidebarRef}
          className={`h-[100%] absolute ${
            currentPath.length > 0 &&
            getCurrentFolder() !== null &&
            getCurrentFolder() !== undefined &&
            Object.keys(getCurrentFolder()).includes("details")
              ? sideBarOpen
                ? "w-[calc(100vw-240px-140px)] lg:w-[calc(100vw-280px-180px)]"
                : "w-[calc(100vw-240px)] lg:w-[calc(100vw-280px)]"
              : sideBarOpen
              ? "w-[calc(100vw-140px)] lg:w-[calc(100vw-180px)]"
              : "w-[100vw]"
          } bg-white ${
            sideBarOpen ? "left-[140px] lg:left-[180px]" : "left-0"
          }`}
        >
          <div className="w-full h-full max-h-[calc(100vh-124px)] overflow-scroll">
            {renderContent()}
          </div>
        </div>

        {currentPath.length > 0 &&
          getCurrentFolder() !== null &&
          getCurrentFolder() !== undefined &&
          Object.keys(getCurrentFolder()).includes("details") && (
            <div
              style={{
                borderLeft: "1px solid #BBBBBB",
              }}
              className="overflow-scroll bg-[white] w-[240px] lg:w-[280px] h-[calc(100%-63px)] absolute top-0 right-[2px]"
            >
              <div
                className="fixed w-[240px] lg:w-[280px] z-[102] h-[50px] bg-white"
                style={{ borderBottom: "1px solid #BBBBBB" }}
              >
                <div className="relative w-[100%] h-[50px] flex flex-row items-center ">
                  {currentPath.length > 0 && (
                    <input
                      type="text"
                      value={getCurrentFolder()["name"]}
                      className="font-[600] text-[18px] text-[#888] pb-[1px] pl-[14px] w-[calc(100%-47px)] mr-[5px] outline-none border-none"
                      onChange={(e: any) => {
                        updateFolderName(e.target.value);
                      }}
                    />
                  )}

                  <BiSolidPencil
                    onClick={() => {
                      setEditDetailsMode((prev) => !prev);
                    }}
                    color={"#222"}
                    size={24}
                    className={`p-[3px] border-[#999] ${
                      editDetailsMode && "bg-[#DDDDDD]"
                    } cursor-pointer`}
                    style={{ borderRadius: "8px", border: "0.1px solid #999" }}
                  />
                </div>
              </div>
              {Object.keys(getCurrentFolder()["details"]).includes(
                "colors"
              ) && (
                <div className="mt-[59px] w-[100%] px-[15px]">
                  <div className="relative pb-[15px] overflow-scroll flex flex-col gap-[6px]">
                    <p className="select-none font-[500] text-[18px] text-[#888] pb-[1px]">
                      Colors
                    </p>

                    <BiPlus
                      onClick={() => {
                        handleAddFolderDetail("colors");
                      }}
                      color={"#999"}
                      size={24}
                      className={`absolute right-0 top-[1px] p-[3px] border-[#999] cursor-pointer rounded-full`}
                      style={{ border: "0.1px solid #999" }}
                    />

                    {getCurrentFolder()["details"]["colors"].length > 0 &&
                      getCurrentFolder()
                        ["details"]["colors"].sort((a: any, b: any) => {
                          if (a === null || b === null) {
                            return 0;
                          } else {
                            return a.index - b.index;
                          }
                        })
                        .map((colorObject: any, index: number) => (
                          <div
                            key={index}
                            className="flex flex-row w-full gap-[5px] items-center"
                          >
                            {colorObject !== null &&
                              Object.keys(colorObject).includes("name") &&
                              Object.keys(colorObject).includes("value") && (
                                <>
                                  <div className="w-[100%] h-[38px] rounded-[5px] gap-[6px] border border-[#BBBBBB] flex items-center px-[9px] text-[#888] font-[500]">
                                    <input
                                      type="text"
                                      value={colorObject["name"]}
                                      className="border-none w-[calc(100%-31px)] outline-none"
                                      onChange={(e: any) => {
                                        updateFolderDetailsItem(
                                          "colors",
                                          colorObject.index,
                                          e.target.value,
                                          false
                                        );
                                      }}
                                    />

                                    <div
                                      onClick={(e: any) => e.stopPropagation()}
                                      className="w-[25px] h-[25px] relative rounded-[5px]"
                                    >
                                      <ColorPicker
                                        initialColor={colorObject["value"]}
                                        primary={true}
                                        onColorChange={(
                                          primary: boolean,
                                          newValue: string
                                        ) =>
                                          handleEditFolderColor(
                                            colorObject.index,
                                            newValue
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                            {editDetailsMode && (
                              <button
                                className="w-[28px] h-[25px] border border-[#999] bg-[#FFFFFF] rounded-full flex items-center justify-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      `Delete ${colorObject["name"]}?`
                                    )
                                  ) {
                                    handleDeleteFolderDetail(
                                      "colors",
                                      colorObject.index
                                    );
                                  }
                                }}
                              >
                                <FaTrash color={"#222"} size={11} />
                              </button>
                            )}
                          </div>
                        ))}
                  </div>
                </div>
              )}

              <div className="w-ful h-[1px] mt-[3px] mb-[8px] bg-[#BBBBBB]"></div>

              {Object.keys(getCurrentFolder()["details"]).includes("text") && (
                <div className="mt-[5px] pb-[10px] w-[100%] px-[15px]">
                  <div className="relative overflow-scroll flex flex-col gap-[6px]">
                    <p className="select-none font-[500] text-[18px] text-[#888] pb-[1px]">
                      Text
                    </p>
                    <BiPlus
                      onClick={() => {
                        handleAddFolderDetail("text");
                      }}
                      color={"#999"}
                      size={24}
                      className={`absolute right-0 top-[1px] p-[3px] border-[#999] cursor-pointer rounded-full`}
                      style={{ border: "0.1px solid #999" }}
                    />
                    {getCurrentFolder()["details"]["text"].length > 0 &&
                      getCurrentFolder()
                        ["details"]["text"].sort((a: any, b: any) => {
                          if (a === null || b === null) {
                            return 0;
                          } else {
                            return a.index - b.index;
                          }
                        })
                        .map((textObject: any, index: number) => (
                          <div
                            key={index}
                            className="flex flex-row w-full gap-[5px] items-center"
                          >
                            {textObject !== null &&
                              Object.keys(textObject).includes("name") &&
                              Object.keys(textObject).includes("value") && (
                                <>
                                  <div className="flex flex-col mb-[4px]">
                                    <input
                                      type="text"
                                      value={textObject["name"]}
                                      className="text-[15px] text-[#777] outline-none border-none"
                                      onChange={(e: any) => {
                                        updateFolderDetailsItem(
                                          "text",
                                          textObject.index,
                                          e.target.value,
                                          true
                                        );
                                      }}
                                    />
                                    <div className="flex flex-row items-center h-[auto] w-full gap-[5px]">
                                      <textarea
                                        value={textObject["value"]}
                                        className="mt-[2px] w-full border text-[#888] font-[500] border-[#BBBBBB] rounded-[5px] h-[auto] p-2 outline-none resize-none whitespace-pre-wrap break-words"
                                        onChange={(e: any) => {
                                          updateFolderDetailsItem(
                                            "text",
                                            textObject.index,
                                            e.target.value,
                                            false
                                          );
                                        }}
                                      />

                                      {editDetailsMode && (
                                        <button
                                          className="w-[28px] h-[25px] border border-[#999] bg-[#FFFFFF] rounded-full flex items-center justify-center cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                              window.confirm(
                                                `Delete ${textObject["name"]}?`
                                              )
                                            ) {
                                              handleDeleteFolderDetail(
                                                "text",
                                                textObject.index
                                              );
                                            }
                                          }}
                                        >
                                          <FaTrash color={"#222"} size={11} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                          </div>
                        ))}
                  </div>
                </div>
              )}
            </div>
          )}

        {currentPath.length > 0 && (
          <div
            className="z-[998] w-[100%] h-[63px] fixed left-0 bottom-0 flex justify-end py-[12px] pr-[13px] gap-[10px]"
            style={{ backgroundColor: "white", borderTop: "1px solid #CCCCCC" }}
          >
            {currentPath.length > 0 &&
              getCurrentFolder() !== null &&
              getCurrentFolder() !== undefined &&
              Object.keys(getCurrentFolder()).includes("children") &&
              (Object.keys(getCurrentFolder()["children"]).length === 0 ||
                (Object.keys(getCurrentFolder()["children"]).length > 0 &&
                  getCurrentFolder()["children"][
                    Object.keys(getCurrentFolder()["children"])[0]
                  ].type !== "image")) && (
                <button
                  onClick={() => {
                    const folderName = window.prompt("Folder Name:");
                    if (folderName && folderName !== "") {
                      handleAddFolder(folderName.trim());
                    }
                  }}
                  className="px-[10px] py-[5px] text-[13px] flex-items-center justify-center font-[500]"
                  style={{ borderRadius: "3px", border: "1px solid #999" }}
                >
                  Add Folder
                </button>
              )}

            {currentPath.length > 0 &&
              getCurrentFolder() !== null &&
              getCurrentFolder() !== undefined &&
              Object.keys(getCurrentFolder()).includes("children") &&
              (Object.keys(getCurrentFolder()["children"]).length === 0 ||
                (Object.keys(getCurrentFolder()["children"]).length > 0 &&
                  getCurrentFolder()["children"][
                    Object.keys(getCurrentFolder()["children"])[0]
                  ].type === "image")) && (
                <button
                  onClick={() => {
                    setUploadPopup(true);
                  }}
                  className="px-[10px] py-[5px] text-[13px] flex-items-center justify-center font-[500]"
                  style={{ borderRadius: "3px", border: "1px solid #999" }}
                >
                  Upload
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
