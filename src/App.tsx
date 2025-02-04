import React, { useState, useEffect, useRef } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Home, { CoverEntryImage } from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Projects from "./Pages/Projects/Projects";
import Navbar from "./Components/Navbar/Navbar";
import Archives from "./Pages/Archives/Archives";
import ProjectsPage from "./Pages/Projects/ProjectsPage/ProjectsPage";
import useProjectColorsState, {
  ProjectColors,
} from "./store/useProjectColorsStore";
import useCurrentPageState from "./store/useCurrentPageStore";
import useCurrentNavColorState from "./store/useCurrentNavColorStore";
import useSelectedProjectNameState from "./store/useSelectedProjectNameStore";
import useSelectedProjectState from "./store/useSelectedProjectStore";
import useIncomingImageDimensionsState from "./store/useIncomingImageDimensionsState";
import useIncomingImageStylesStore from "./store/useIncomingImageStylesStore";
import useIncomingImageSpeedState from "./store/useIncomingImageSpeedState";
import useProjectAssetsStore from "./store/useProjectAssetsStore";
import usePreloadedImagesStore from "./store/usePreloadedImagesStore";
import useSelectedArchiveGroupStore from "./store/useSelectedArchiveGroupStore";
import Admin, { isColor } from "./Pages/Admin/Admin";
import useAppDataFileStore from "./store/useAppDataFileStore";

export interface SlideUpPageProps {
  children: React.ReactNode;
  isVisible: boolean;
  full: boolean;
  zIdx: number;
  nextColor: string;
}

export interface SlideUpProjectPageProps {
  isVisible: boolean;
  zIdx: number;
}

export interface TreeNode {
  children: { [key: string]: TreeNode };
  images: ImageResource[];
}

interface ImageResource {
  public_id: string;
  url: string;
  type: string;
}

// export type Page = "home" | "about" | "projects" | "archives";
// export type IncomingPage = "home" | "about" | "projects" | "archives" | "projects" | null;
export type Page = string;
export type IncomingPage = string | null;
export interface PageProps {
  navigate: (page: Page) => void;
}

// Preload images function
const preloadImages = (urls: string[]) => {
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve({ url, success: true });
        img.onerror = () => resolve({ url, success: false });
      });
    })
  );
};

const random4Digits = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const SlideUpPage: React.FC<SlideUpPageProps> = ({
  children,
  isVisible,
  full,
  zIdx,
  nextColor,
}) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={isVisible ? { y: "0%" } : {}}
      exit={{}}
      transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: full ? nextColor : "transparent",
        zIndex: isVisible ? zIdx : 0,
      }}
    >
      {children}
    </motion.div>
  );
};

const SlideUpProjectPage: React.FC<SlideUpProjectPageProps> = ({
  isVisible,
  zIdx,
}) => {
  const { projectColors, setProjectColors } = useProjectColorsState();

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={isVisible ? { y: "0%" } : {}}
      exit={{}}
      transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: projectColors[2][0],
        // background: full ? "white" : "transparent",
        // zIndex: isVisible ? zIdx : 0, // Ensure the incoming page overlays the current one
        zIndex: 100,
      }}
    ></motion.div>
  );
};

export type FileTree = {
  [key: string]: string | FileTree | FileTree[] | string[];
};

export type Tree = {
  [key: string]: Tree | string[] | string;
};

export type Entry = {
  id?: string;
  title: string;
  url: string;
  index: number;
  description?: string;
  bg_color?: string;
  text_color?: string;
  images?: Entry[];
};

export const GIT_KEYS = {
  owner: "JosephGoff",
  repo: "js-portfolio",
  branch: "master",
  token: process.env.REACT_APP_GIT_PAT,
};

export const BASE_URL = `https://raw.githubusercontent.com/${GIT_KEYS.owner}/${GIT_KEYS.repo}/refs/heads/${GIT_KEYS.branch}/public/assets/`;

const App = () => {
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const { preloadedImages, setPreloadedImages } = usePreloadedImagesStore();
  const [projectsList, setProjectsList] = useState<string[]>([]);
  const { selectedArchiveGroup, setSelectedArchiveGroup } =
    useSelectedArchiveGroupStore();
  const { appDataFile, setAppDataFile } = useAppDataFileStore();
  const [loading, setLoading] = useState(true);

  // FULL REPOSITORY & APP FILE
  const fetchAppFileContents = async (blobUrl: string) => {
    try {
      const response = await fetch(blobUrl, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_GIT_PAT}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${blobUrl}`);
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
          setAppDataFile(parsedContent);
          return parsedContent;
        } catch (error) {
          console.error("Error parsing JSON content:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching file contents:", error);
    }
  };

  const fetchFullRepoTree = async (
    owner: string,
    repo: string,
    branch = "master"
  ) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const token = GIT_KEYS.token;

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
  const collectAllImages = useRef<string[][]>([[], [], [], []]);
  const getRepoTree = async () => {
    const fullRepo = await fetchFullRepoTree("JosephGoff", "js-portfolio");
    let appFile = null;
    if (fullRepo["src"]["app.json"]) {
      const appFileURL = fullRepo["src"]["app.json"];
      appFile = await fetchAppFileContents(appFileURL);
    }

    if (fullRepo && fullRepo["public"]?.["assets"] && appFile !== null) {
      const { icons, ...filteredProject } = fullRepo["public"]["assets"];
      const tree: any = {};
      const pageNames = Object.keys(filteredProject);
      pageNames.push("home");
      pageNames.push("aboutText");

      for (let i = 0; i < pageNames.length; i++) {
        const newPage = sortPages(pageNames[i], filteredProject, appFile);
        if (newPage !== null) {
          tree[pageNames[i]] = newPage;
        }
      }

      setProjectAssets(tree);
      let startingPreloadIndex = 0;
      if (location.pathname.startsWith("/about")) {
        startingPreloadIndex = 1;
      }
      if (location.pathname.startsWith("/projects")) {
        startingPreloadIndex = 2;
      }
      if (location.pathname.startsWith("/archives")) {
        startingPreloadIndex = 3;
      }
      const pageLoadOrder = [];
      pageLoadOrder.push(startingPreloadIndex);
      for (let i = 0; i < 4; i++) {
        if (i !== startingPreloadIndex) {
          pageLoadOrder.push(i);
        }
      }
      for (let i = 0; i < pageLoadOrder.length; i++) {
        if (collectAllImages.current[i].length > 0) {
          const currentPageIndex = pageLoadOrder[i]; // 0 = home, 1 = about, 2 = project, 3 = archives
          await preloadImages(collectAllImages.current[currentPageIndex]);
          const preloadedImagesCopy = preloadedImages;
          preloadedImagesCopy[currentPageIndex] = true;
          setPreloadedImages(preloadedImagesCopy);
        }
      }

      //  HOME PAGE COVER LAYOUT ORDER (num covers, 2 layouts available so far)
      const projectCovers = appFile["pages"]["projects"].filter(
        (item: any) => item.home_page === true
      );
      if (projectCovers.length !== 0) {
        const numberOfCovers = 3;
        const numberOfLayoutsCreated = 7;

        let previous = -1; // Start with a value that can't match the first random number
        const newLayoutOrder = Array.from(
          { length: numberOfCovers },
          (_, index) => {
            let next;
            do {
              next = Math.floor(Math.random() * numberOfLayoutsCreated);
            } while (next === previous);
            previous = next;
            return next;
          }
        );

        // Ensure the first and last elements are different
        if (
          newLayoutOrder.length > 1 &&
          newLayoutOrder[0] === newLayoutOrder[newLayoutOrder.length - 1]
        ) {
          let replacement;
          do {
            replacement = Math.floor(Math.random() * numberOfLayoutsCreated);
          } while (
            replacement === newLayoutOrder[newLayoutOrder.length - 2] ||
            replacement === newLayoutOrder[0]
          );
          newLayoutOrder[newLayoutOrder.length - 1] = replacement;
        }

        setLayoutOrder(newLayoutOrder);
      }
    }
  };

  // Generate an array where each number is unique to the two next to it
  const [layoutOrder, setLayoutOrder] = useState<number[]>([]);

  function sortPages(page: any, project: any, appFile: any) {
    let result = null;
    let collectNewImages = false;
    const collectAllImagesCopy = collectAllImages.current;

    if (page === "aboutText" && Object.keys(project["about"]).length > 0) {
      const folder = appFile["pages"]["about"]["sections"];
      return folder;
    }

    if (page === "about" && Object.keys(project[page]).length > 0) {
      if (collectAllImagesCopy[1].length === 0) {
        collectNewImages = true;
      }
      const folder = appFile["pages"]["about"]["images"];
      const mappedImages: CoverEntryImage[] = Object.keys(project[page])
        .filter((item) => item !== "blank.png")
        .filter(
          (img: any) =>
            folder.findIndex((item: any) => item.name === img) !== -1
        )
        .map((img: any) => {
          const index = folder.findIndex((item: any) => item.name === img);
          if (collectNewImages) {
            collectAllImagesCopy[1].push(BASE_URL + page + "/" + img);
          }
          return {
            title: img,
            url: BASE_URL + page + "/" + img,
            index: folder[index].index,
            width: folder[index].width,
            height: folder[index].height,
          };
        });
      const sortedImages = mappedImages.sort(
        (a: any, b: any) => a.index - b.index
      );
      result = sortedImages;
    }

    if (page === "projects" && Object.keys(project[page]).length > 0) {
      const newProjectsList: string[] = [];
      if (collectAllImagesCopy[2].length === 0) {
        collectNewImages = true;
      }
      const indexMap: any =
        appFile["pages"] === undefined
          ? null
          : Object.values(appFile["pages"])
              .flat()
              .reduce((map: any, item: any) => {
                map[item.id] = item.title;
                return map;
              }, {});

      const appFilePage = appFile["pages"][page];
      const mappedEntries: any = Object.keys(project[page])
        .filter((item) => item !== "blank.png")
        .filter(
          (folder: any) =>
            appFilePage.findIndex((item: any) => item.id === folder) !== -1
        )
        .map((folder: any) => {
          if (indexMap !== null) {
            newProjectsList.push(
              indexMap[folder].replaceAll("_", "").replaceAll("&", "and")
            );
          }
          const appFolderIndex = appFilePage.findIndex(
            (item: any) => item.id === folder
          );
          const appFileFolder =
            appFile["pages"][page][appFolderIndex]["images"];
          const mappedImages: Entry[] = Object.keys(project[page][folder])
            .filter((item) => item !== "blank.png")
            .filter(
              (img: any) =>
                appFileFolder.findIndex((item: any) => item.name === img) !== -1
            )
            .map((folderItem: any) => {
              const foundIndex = appFileFolder.findIndex(
                (item: any) => item.name === folderItem
              );
              const imgIndex = appFileFolder[foundIndex].index;

              if (collectNewImages) {
                collectAllImagesCopy[2].push(
                  BASE_URL + page + "/" + folder + "/" + folderItem
                );
              }

              return {
                title: folderItem,
                url: BASE_URL + page + "/" + folder + "/" + folderItem,
                index: imgIndex,
                width: appFileFolder[foundIndex].width,
                height: appFileFolder[foundIndex].height,
              };
            });

          const sortedImages = mappedImages.sort(
            (a: any, b: any) => a.index - b.index
          );

          if (!appFile["pages"][page]) return null;
          const appFileProjectIndex = appFile["pages"][page].findIndex(
            (item: any) => item.id === folder
          );
          const appFileProject = appFile["pages"][page][appFileProjectIndex];
          return {
            title: appFileProject.title,
            description: appFileProject.description,
            id: appFileProject.id,
            bg_color: isColor(appFileProject.bg_color)
              ? appFileProject.bg_color
              : "#FFFFFF",
            text_color: isColor(appFileProject.text_color)
              ? appFileProject.text_color
              : "#000000",
            images: sortedImages,
            index: appFileProject.index,
          };
        });
      const sortedEntries = mappedEntries.sort(
        (a: any, b: any) => a.index - b.index
      );

      result = sortedEntries;
      setProjectsList(newProjectsList);
    }

    if (page === "archives" && Object.keys(project[page]).length > 0) {
      if (collectAllImagesCopy[3].length === 0) {
        collectNewImages = true;
      }
      const appFilePage = appFile["pages"][page];
      const mappedEntries: any = Object.keys(project[page])
        .filter((item) => item !== "blank.png")
        .filter(
          (folder: any) =>
            appFilePage.findIndex((item: any) => item.id === folder) !== -1
        )
        .map((folder: any) => {
          const appFolderIndex = appFilePage.findIndex(
            (item: any) => item.id === folder
          );
          const appFileFolder =
            appFile["pages"][page][appFolderIndex]["images"];
          const mappedImages: Entry[] = Object.keys(project[page][folder])
            .filter((item) => item !== "blank.png")
            .filter(
              (img: any) =>
                appFileFolder.findIndex((item: any) => item.name === img) !== -1
            )
            .map((folderItem: any) => {
              const foundIndex = appFileFolder.findIndex(
                (item: any) => item.name === folderItem
              );
              const imgIndex = appFileFolder[foundIndex].index;

              if (collectNewImages) {
                collectAllImagesCopy[3].push(
                  BASE_URL + page + "/" + folder + "/" + folderItem
                );
              }
              return {
                title: folderItem,
                url: BASE_URL + page + "/" + folder + "/" + folderItem,
                index: imgIndex,
                width: appFileFolder[foundIndex].width,
                height: appFileFolder[foundIndex].height,
              };
            });
          const sortedImages = mappedImages.sort(
            (a: any, b: any) => a.index - b.index
          );

          if (!appFile["pages"][page]) return null;
          const appFileProjectIndex = appFile["pages"][page].findIndex(
            (item: any) => item.id === folder
          );
          const appFileProject = appFile["pages"][page][appFileProjectIndex];
          return {
            title: appFileProject.title,
            description: appFileProject.description
              .replaceAll("_", " ")
              .toUpperCase(),
            description2: appFileProject.description2
              .replaceAll("_", " ")
              .toUpperCase(),
            description3: appFileProject.description3
              .replaceAll("_", " ")
              .toUpperCase(),
            id: appFileProject.id,
            bg_color: isColor(appFileProject.bg_color)
              ? appFileProject.bg_color
              : "#FFFFFF",
            images: sortedImages,
            index: appFileProject.index,
          };
        });
      const sortedEntries = mappedEntries.sort(
        (a: any, b: any) => a.index - b.index
      );
      result = sortedEntries;
    }

    if (page === "home" && Object.keys(project["projects"]).length > 0) {
      page = "projects";
      if (collectAllImagesCopy[0].length === 0) {
        collectNewImages = true;
      }

      const appFilePage = appFile["pages"][page];
      const mappedEntries: any = Object.keys(project[page])
        .filter((item) => item !== "blank.png")
        .filter(
          (folder: any) =>
            appFilePage.findIndex((item: any) => item.id === folder) !== -1
        )
        .filter(
          (folder: any) =>
            appFile["pages"][page][
              appFilePage.findIndex((item: any) => item.id === folder)
            ].home_page === true
        )
        .map((folder: any) => {
          const appFolderIndex = appFilePage.findIndex(
            (item: any) => item.id === folder
          );
          const appFileFolder =
            appFile["pages"][page][appFolderIndex]["images"];
          const mappedImages: Entry[] = Object.keys(project[page][folder])
            .filter((item) => item !== "blank.png")
            .filter(
              (img: any) =>
                appFileFolder.findIndex((item: any) => item.name === img) !== -1
            )
            .filter(
              (img: any) =>
                appFileFolder[
                  appFileFolder.findIndex((item: any) => item.name === img)
                ].projectCover === true
            )
            // .filter((item: any) => item.projectCover === true)
            .map((folderItem: any) => {
              const foundIndex = appFileFolder.findIndex(
                (item: any) => item.name === folderItem
              );
              const imgIndex = appFileFolder[foundIndex].index;

              if (collectNewImages) {
                collectAllImagesCopy[0].push(
                  BASE_URL + page + "/" + folder + "/" + folderItem
                );
              }

              return {
                title: folderItem,
                url: BASE_URL + page + "/" + folder + "/" + folderItem,
                index: imgIndex,
                width: appFileFolder[foundIndex].width,
                height: appFileFolder[foundIndex].height,
              };
            });

          const sortedImages = mappedImages.sort(
            (a: any, b: any) => a.index - b.index
          );

          if (!appFile["pages"][page]) return null;
          const appFileProjectIndex = appFile["pages"][page].findIndex(
            (item: any) => item.id === folder
          );
          const appFileProject = appFile["pages"][page][appFileProjectIndex];
          return {
            title: appFileProject.title,
            description: appFileProject.description,
            id: appFileProject.id,
            bg_color: isColor(appFileProject.bg_color)
              ? appFileProject.bg_color
              : "#FFFFFF",
            text_color: isColor(appFileProject.text_color)
              ? appFileProject.text_color
              : "#000000",
            images: sortedImages,
            index: appFileProject.index,
          };
        });
      const sortedEntries = mappedEntries.sort(
        (a: any, b: any) => a.index - b.index
      );
      result = sortedEntries;
    }
    collectAllImages.current = collectAllImagesCopy;
    return result;
  }

  useEffect(() => {
    getRepoTree();
  }, []);

  const [incomingPage, setIncomingPage] = useState<IncomingPage>(null);
  const [incomingPageDecision, setIncomingPageDecision] =
    useState<IncomingPage>(null);
  const navigateTo = useNavigate();
  const location = useLocation();

  const { projectColors, setProjectColors } = useProjectColorsState();
  const { currentPage, setCurrentPage } = useCurrentPageState();
  const { selectedProjectName, setSelectedProjectName } =
    useSelectedProjectNameState();
  const { selectedProject, setSelectedProject } = useSelectedProjectState();
  const { incomingImageDimensions, setIncomingImageDimensions } =
    useIncomingImageDimensionsState();
  const { incomingImageStyles, setIncomingImageStyles } =
    useIncomingImageStylesStore();
  const { incomingSpeed, setIncomingSpeed } = useIncomingImageSpeedState();
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);

  useEffect(() => {
    const path = location.pathname.replace("/", "") || "home";
    if (
      path !== currentPage && // Prevent redundant updates
      (["home", "about", "projects", "archives"].includes(path) ||
        (path.startsWith("projects/") &&
          projectsList.includes(path.split("/")[1]) &&
          path.split("/").length === 2))
    ) {
      setCurrentPage(path as Page);
    }
  }, [location, projectsList]);

  // useEffect(() => {
  //   const path = location.pathname.replace("/", "") || "home";
  //   if (
  //     ["home", "about", "projects", "archives"].includes(path) ||
  //     (path.startsWith("projects/") &&
  //       projectsList.includes(path.split("/")[1]) &&
  //       path.split("/").length === 2)
  //   ) {
  //     setCurrentPage(path as Page);
  //   }
  // }, [currentPage, location, projectsList]);

  useEffect(() => {
    const path = location.pathname.replace("/", "") || "home";
    if (
      path !== currentPage &&
      path.startsWith("projects/") &&
      projectsList.includes(path.split("/")[1]) &&
      path.split("/").length === 2
    ) {
      setCurrentPage(path as Page);
      const projectIndex = projectsList.findIndex(
        (item) => item === path.split("/")[1]
      );
      const project = projectAssets as any;
      if (
        projectIndex !== -1 &&
        project &&
        project !== null &&
        project["projects"]
      ) {
        setSelectedProject(projectIndex);
        setSelectedProjectName([null, projectIndex, null]);
        const newColor1 = project["projects"][projectIndex].bg_color || "white";
        const newColor2 =
          project["projects"][projectIndex].text_color || "white";
        const newColors = [
          ["white", "white"],
          [newColor1, newColor2],
          ["white", "white"],
        ] as ProjectColors;
        setProjectColors(newColors);
      }
    }
  }, [location, projectsList, projectAssets]);

  const [disableTransition, setDisableTransition] = useState(false);
  const [cachedCurrent, setCachedCurrent] = useState<Page>("home");
  const [sittingProject, setSittingProject] = useState(false);
  const { currentNavColor, setCurrentNavColor } = useCurrentNavColorState();
  const [canSelectPage, setCanSelectPage] = useState<boolean>(true);
  const [zTrigger, setZTrigger] = useState<null | number>(null);
  const navigate = (page: Page) => {
    if (page === currentPage || !canSelectPage) return;

    // NAV
    if (page.startsWith("archives")) {
      setTimeout(() => {
        setCurrentNavColor("white");
      }, 2000);
    } else {
      setCurrentNavColor("black");
      setTimeout(() => {
        setCurrentNavColor("black");
      }, 2000);
    }

    // Archives
    setSelectedArchiveGroup(null);

    const newVal = currentPage;
    if (
      page.startsWith("projects/") &&
      projectsList.includes(page.split("/")[1]) &&
      page.split("/").length === 2
    ) {
      setSittingProject(false);
      setZTrigger(800);
    }
    setCanSelectPage(false);
    setIncomingPage(page); // Set the incoming page to trigger animation
    setIncomingPageDecision(page);
    setTimeout(() => {
      setCurrentPage(page); // Once animation is done, switch to the new page
      setIncomingPage(null); // Reset incoming page
      navigateTo(`/${page}`);
      window.scrollTo(0, 0);
      setDisableTransition(true);
      setTimeout(() => {
        setDisableTransition(false);
      }, 50);
      setTimeout(() => {
        setIncomingPageDecision(null);
      }, 100);
      if (
        page.startsWith("projects/") &&
        projectsList.includes(page.split("/")[1]) &&
        page.split("/").length === 2
      ) {
        setSittingProject(true);
      } else {
        setSittingProject(false);
        setSelectedProjectName([null, null, null]);
      }
      setCachedCurrent(newVal);
      setCanSelectPage(true);
    }, 1000); // Match this timeout to the animation duration
    setTimeout(() => {
      setZTrigger(null);
    }, 1200);
  };

  useEffect(() => {
    if (location.pathname === "/home") {
      setTimeout(() => {
        document.body.style.overflow = "hidden";
      }, 1000);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [location]);

  useEffect(() => {
    const path = location.pathname;
    if (
      path.startsWith("/projects/") &&
      projectsList.includes(path.split("/")[2]) &&
      path.split("/").length === 3
    ) {
      setSittingProject(true);
    } else {
      setSittingProject(false);
    }
  }, [projectsList]);

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <Navbar navigate={navigate} />
        <motion.div
          initial={{ y: 0 }}
          animate={
            incomingPage &&
            !(
              incomingPage.startsWith("projects/") &&
              projectsList.includes(incomingPage.split("/")[1]) &&
              incomingPage.split("/").length === 2 &&
              (currentPage === "projects" ||
                (currentPage.startsWith("projects/") &&
                  projectsList.includes(currentPage.split("/")[1]) &&
                  currentPage.split("/").length === 2))
            )
              ? { y: "-15%" }
              : { y: 0 }
          }
          transition={
            disableTransition
              ? { duration: 0 } // Disable transition
              : { duration: 1, ease: [0.95, 0, 0.4, 1] } // Enable animation
          }
          // transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 102,
            // zIndex: zTrigger !== null && selectedProjectName[1] === null
            //     ? zTrigger : 102
          }}
        >
          {currentPage === "home" && (
            <Home
              layoutOrder={layoutOrder}
              navigate={navigate}
              slideUpComponent={false}
            />
          )}
          {currentPage === "projects" && (
            <Projects
              navigate={navigate}
              page={null}
              currentPage={true}
              animate={true}
            />
          )}
          {currentPage === "about" && <About slideUpComponent={false} navigate={navigate} />}
          {currentPage === "archives" && (
            <Archives navigate={navigate} slideUpComponent={false} />
          )}
          {currentPage?.startsWith("projects/") &&
            projectsList.includes(currentPage.split("/")[1]) &&
            currentPage.split("/").length === 2 && (
              <motion.div
                initial={{ y: 0 }}
                animate={
                  incomingPage &&
                  incomingPage.startsWith("projects/") &&
                  projectsList.includes(incomingPage.split("/")[1]) &&
                  incomingPage.split("/").length === 2 &&
                  currentPage.startsWith("projects/") &&
                  projectsList.includes(currentPage.split("/")[1]) &&
                  currentPage.split("/").length === 2
                    ? { y: "-15%" }
                    : { y: 0 }
                }
                transition={
                  disableTransition
                    ? { duration: 0 }
                    : { duration: 1, ease: [0.95, 0, 0.4, 1] }
                }
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 105,
                  pointerEvents: "none",
                }}
              >
                <ProjectsPage
                  navigate={navigate}
                  page={currentPage}
                  slideUpComponent={false}
                />
              </motion.div>
            )}
        </motion.div>

        <motion.div
          initial={{ y: 0 }}
          animate={
            incomingPage &&
            !(
              incomingPage.startsWith("projects/") &&
              projectsList.includes(incomingPage.split("/")[1]) &&
              incomingPage.split("/").length === 2 &&
              (currentPage === "projects" ||
                (currentPage.startsWith("projects/") &&
                  projectsList.includes(currentPage.split("/")[1]) &&
                  currentPage.split("/").length === 2))
            )
              ? { y: "-15%" }
              : { y: 0 }
          }
          transition={
            disableTransition
              ? { duration: 0 } // Disable transition
              : { duration: 1, ease: [0.95, 0, 0.4, 1] } // Enable animation
          }
          // transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex:
              selectedProjectName[1] === null && zTrigger === null
                ? 101
                : zTrigger === null
                ? 102
                : zTrigger,
          }}
        >
          {currentPage?.startsWith("projects/") &&
            projectsList.includes(currentPage.split("/")[1]) &&
            currentPage.split("/").length === 2 && (
              <div>
                {sittingProject && (
                  <div
                    className="w-[0] sm:w-[calc((2vw+225px)+(3vw+30px))] md:w-[calc((2vw+255px)+(3vw+30px))]
                    h-[100vh] fixed left-0 top-0 "
                    style={{
                      backgroundColor: projectColors[1][0],
                    }}
                  ></div>
                )}

                <Projects
                  navigate={navigate}
                  page={currentPage}
                  currentPage={true}
                  animate={
                    incomingPage
                      ? incomingPage.startsWith("projects/") &&
                        projectsList.includes(incomingPage.split("/")[1]) &&
                        incomingPage.split("/").length === 2 &&
                        currentPage !== "projects" &&
                        !(
                          currentPage.startsWith("projects/") &&
                          projectsList.includes(currentPage.split("/")[1]) &&
                          currentPage.split("/").length === 2
                        )
                      : !(
                          cachedCurrent.startsWith("projects/") &&
                          projectsList.includes(cachedCurrent.split("/")[1]) &&
                          cachedCurrent.split("/").length === 2
                        ) && cachedCurrent !== "projects"
                  }
                />
              </div>
            )}
        </motion.div>

        {/* Animate the incoming page */}
        {incomingPageDecision === "home" && (
          <SlideUpPage zIdx={702} isVisible full={true} nextColor={"white"}>
            <Home
              layoutOrder={layoutOrder}
              navigate={navigate}
              slideUpComponent={true}
            />
          </SlideUpPage>
        )}
        {incomingPageDecision === "projects" && (
          <SlideUpPage zIdx={702} isVisible full={true} nextColor={"white"}>
            <Projects
              navigate={navigate}
              page={null}
              currentPage={false}
              animate={false}
            />
          </SlideUpPage>
        )}
        {incomingPageDecision?.startsWith("projects/") &&
          projectsList.includes(incomingPageDecision.split("/")[1]) &&
          incomingPageDecision.split("/").length === 2 && (
            <>
              <div
                className="w-[calc((310px+2vw)+(3vw+30px))] sm:w-[calc((360px+2vw)+(3vw+30px))] md:w-[calc((410px+2vw)+(3vw+30px))] h-[100vh] fixed left-0 top-0 "
                style={{ backgroundColor: projectColors[0][0] }}
              ></div>

              <Projects
                navigate={navigate}
                page={incomingPageDecision}
                currentPage={false}
                animate={false}
              />
              <SlideUpProjectPage zIdx={100} isVisible></SlideUpProjectPage>

              <SlideUpPage
                zIdx={702}
                isVisible
                full={
                  (currentPage.startsWith("projects/") &&
                    projectsList.includes(currentPage.split("/")[1]) &&
                    currentPage.split("/").length === 2) ||
                  currentPage === "projects"
                    ? false
                    : true
                }
                nextColor={
                  (currentPage.startsWith("projects/") &&
                    projectsList.includes(currentPage.split("/")[1]) &&
                    currentPage.split("/").length === 2) ||
                  currentPage === "projects"
                    ? "white"
                    : projectColors[2][0]
                }
              >
                <ProjectsPage
                  navigate={navigate}
                  page={incomingPageDecision}
                  slideUpComponent={true}
                />
              </SlideUpPage>
            </>
          )}
        {incomingPageDecision === "about" && (
          <SlideUpPage isVisible zIdx={702} full={true} nextColor={"white"}>
            <About slideUpComponent={true} navigate={navigate} />
          </SlideUpPage>
        )}
        {incomingPageDecision === "archives" && (
          <SlideUpPage isVisible zIdx={702} full={true} nextColor={"white"}>
            <Archives navigate={navigate} slideUpComponent={true} />
          </SlideUpPage>
        )}
      </div>
    </>
  );
};

const Root = () => (
  <>
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  </>
);

export default Root;
