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
import Admin from "./Pages/Admin/Admin";
import useAppDataFileStore from "./store/useAppDataFileStore";
import { Player } from "@lottiefiles/react-lottie-player";
import flower from "./utils/flower.json";

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
  title?: string;
  url: string;
  index: number;
  description?: string;
  bg_color?: string;
  text_color?: string;
  images?: Entry[];
};

export const GIT_KEYS = {
  owner: "open-dream-studios",
  repo: "js-portfolio",
  branch: "main",
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
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [projectFile, setProjectFile] = useState<any>({});
  const collectAllImages = useRef<string[][]>([[], [], [], []]);
  // Generate an array where each number is unique to the two next to it
  const [layoutOrder, setLayoutOrder] = useState<number[]>([]);

  const [preloadedFirstImagesCount, setPreloadedFirstImagesCount] =
    useState<number>(0);
  const preloadedFirstImagesTotal = useRef<number>(0);
  const preloadedFirstImagesCurrent = useRef<number>(0);

  // Preload images function
  const preloadImages = (urls: string[], firstPage: boolean) => {
    return Promise.all(
      urls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            if (
              firstPage &&
              preloadedFirstImagesCurrent.current <
                preloadedFirstImagesTotal.current
            ) {
              preloadedFirstImagesCurrent.current += 1;
              if (preloadedFirstImagesCurrent.current % 5 === 0) {
                setPreloadedFirstImagesCount(
                  (preloadedFirstImagesCurrent.current /
                    preloadedFirstImagesTotal.current) *
                    100
                );
              }
            }
            resolve({ url, success: true });
          };
          img.onerror = () => resolve({ url, success: false });
        });
      })
    );
  };

  useEffect(() => {
    const fetchProject = async () => {
      const project = await getProject();
      if (project === null) {
        setLoading(false);
      }
    };

    fetchProject();
  }, []);

  const [preloadingScreen, setPreloadingScreen] = useState(true);

  const getProject = async () => {
    const returnedProject: any[] = [null, null];
    const url = `https://api.github.com/repos/${GIT_KEYS.owner}/${
      GIT_KEYS.repo
    }/git/trees/${GIT_KEYS.branch}?recursive=1&t=${new Date().getTime()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${GIT_KEYS.token}`,
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
              Authorization: `Bearer ${GIT_KEYS.token}`,
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

    if (returnedProject[0] === null || returnedProject[1] === null) {
      return null;
    } else {
      const tree: any = {};
      let pageNames = [];
      let pageKeys = [];
      let projectKey = null;
      for (
        let i = 0;
        i < Object.keys(returnedProject[1].children).length;
        i++
      ) {
        pageKeys.push(Object.keys(returnedProject[1].children)[i]);
        pageNames.push(
          returnedProject[1].children[
            Object.keys(returnedProject[1].children)[i]
          ].name
        );
        if (
          returnedProject[1].children[
            Object.keys(returnedProject[1].children)[i]
          ].name === "Projects"
        ) {
          projectKey = Object.keys(returnedProject[1].children)[i];
        }
      }
      if (projectKey !== null) {
        pageNames.push("Home");
        pageKeys.push(projectKey);
      }
      const appFile = { ...returnedProject[1] };
      for (let i = 0; i < pageNames.length; i++) {
        const newPage = sortPages(pageNames[i], pageKeys[i], appFile);
        if (newPage !== null && pageNames[i] !== "Home") {
          tree[pageNames[i]] = newPage;
        }
      }

      setProjectAssets(tree);

      //  HOME PAGE COVER LAYOUT ORDER (num covers, 2 layouts available so far)
      const numberOfCovers = returnedProject[1].children[0].children.length;
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

      // PRELOAD IMAAGES
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
      for (let i = 0; i <= 3; i++) {
        if (i !== startingPreloadIndex) {
          pageLoadOrder.push(i);
        }
      }

      const firstPageIndex = pageLoadOrder[0];
      if (collectAllImages.current[firstPageIndex].length > 0) {
        preloadedFirstImagesTotal.current =
          collectAllImages.current[firstPageIndex].length;
        await preloadImages(collectAllImages.current[firstPageIndex], true);
        setPreloadingScreen(false);
        const preloadedImagesCopy = preloadedImages;
        preloadedImagesCopy[firstPageIndex] = true;
        setPreloadedImages(preloadedImagesCopy);
        console.log("preloaded first screen");
      }

      for (let i = 0; i < pageLoadOrder.length; i++) {
        if (i === firstPageIndex) continue;
        const currentPageIndex = pageLoadOrder[i];
        if (collectAllImages.current[currentPageIndex].length > 0) {
          await preloadImages(
            collectAllImages.current[currentPageIndex],
            false
          );
          const preloadedImagesCopy = preloadedImages;
          preloadedImagesCopy[currentPageIndex] = true;
          setPreloadedImages(preloadedImagesCopy);
        }
      }
      console.log("ended preload");

      return returnedProject;
    }
  };

  function sortPages(page: any, pageKey: string, appFile: any) {
    let result = null;
    let collectNewImages = false;
    const collectAllImagesCopy = collectAllImages.current;

    if (page === "About" && Object.keys(appFile.children[pageKey]).length > 0) {
      if (collectAllImagesCopy[1].length === 0) {
        collectNewImages = true;
      }
      const folder = appFile.children[pageKey].children;
      const mappedImages: CoverEntryImage[] = Object.keys(folder)
        .filter((item) => folder[item].name !== "blank.png")
        .filter((item) => folder[item].index <= 13)
        .map((imgKey: any) => {
          if (collectNewImages) {
            collectAllImagesCopy[1].push(folder[imgKey].link);
          }
          return {
            url: folder[imgKey].link,
            index: folder[imgKey].index,
            width: folder[imgKey].width,
            height: folder[imgKey].height,
          };
        });
      const sortedImages = mappedImages.sort(
        (a: any, b: any) => a.index - b.index
      );
      result = appFile.children[pageKey];
      result.children = sortedImages;
      result.details.text = result.details.text.sort(
        (a: any, b: any) => a.index - b.index
      );
      result.details.colors = result.details.colors.sort(
        (a: any, b: any) => a.index - b.index
      );
    }

    if (
      page === "Projects" &&
      Object.keys(appFile.children[pageKey]).length > 0
    ) {
      if (collectAllImagesCopy[0].length === 0) {
        collectNewImages = true;
      }
      const folder = appFile.children[pageKey].children;
      const mappedEntries: any = Object.keys(folder).map((imageFolder: any) => {
        const mappedImages: Entry[] = Object.keys(folder[imageFolder].children)
          .filter(
            (imgKey) =>
              folder[imageFolder].children[imgKey].name !== "blank.png"
          )
          .map((imgKey: any, index: number) => {
            if (collectNewImages) {
              if (index < 6) {
                collectAllImagesCopy[0].push(
                  folder[imageFolder].children[imgKey].link
                );
              }
              collectAllImagesCopy[2].push(
                folder[imageFolder].children[imgKey].link
              );
            }

            return {
              url: folder[imageFolder].children[imgKey].link,
              index: folder[imageFolder].children[imgKey].index,
              width: folder[imageFolder].children[imgKey].width,
              height: folder[imageFolder].children[imgKey].height,
            };
          });

        const sortedImages = mappedImages.sort(
          (a: any, b: any) => a.index - b.index
        );

        return {
          title: folder[imageFolder].name,
          description:
            folder[imageFolder].details.text.length > 0
              ? folder[imageFolder].details.text[0].value
              : "",
          bg_color:
            folder[imageFolder].details.colors.length > 0
              ? folder[imageFolder].details.colors[0].value
              : "#FFFFFF",
          text_color:
            folder[imageFolder].details.colors.length > 1
              ? folder[imageFolder].details.colors[1].value
              : "#000000",
          images: sortedImages,
          index: folder[imageFolder].index,
        };
      });
      const sortedEntries = mappedEntries.sort(
        (a: any, b: any) => a.index - b.index
      );

      const newProjectsList = sortedEntries.map((project: any, index: number) =>
        sortedEntries[index].title.replaceAll("_", "").replaceAll("&", "and")
      );

      result = appFile.children[pageKey];
      result.children = sortedEntries;
      result.details.text = result.details.text.sort(
        (a: any, b: any) => a.index - b.index
      );
      result.details.colors = result.details.colors.sort(
        (a: any, b: any) => a.index - b.index
      );
      setProjectsList(newProjectsList);
    }

    if (
      page === "Archives" &&
      Object.keys(appFile.children[pageKey]).length > 0
    ) {
      if (collectAllImagesCopy[3].length === 0) {
        collectNewImages = true;
      }
      const folder = appFile.children[pageKey].children;
      const mappedEntries: any = Object.keys(folder).map((imageFolder: any) => {
        const mappedImages: Entry[] = Object.keys(folder[imageFolder].children)
          .filter(
            (imgKey) =>
              folder[imageFolder].children[imgKey].name !== "blank.png"
          )
          .map((imgKey: any) => {
            if (collectNewImages) {
              collectAllImagesCopy[3].push(
                folder[imageFolder].children[imgKey].link
              );
            }

            return {
              url: folder[imageFolder].children[imgKey].link,
              index: folder[imageFolder].children[imgKey].index,
              width: folder[imageFolder].children[imgKey].width,
              height: folder[imageFolder].children[imgKey].height,
            };
          });

        const sortedImages = mappedImages.sort(
          (a: any, b: any) => a.index - b.index
        );

        return {
          title: folder[imageFolder].name,
          description:
            folder[imageFolder].details.text.length > 0
              ? folder[imageFolder].details.text[0].value
              : "",
          description2:
            folder[imageFolder].details.text.length > 1
              ? folder[imageFolder].details.text[1].value
              : "",
          description3:
            folder[imageFolder].details.text.length > 2
              ? folder[imageFolder].details.text[2].value
              : "",
          bg_color:
            folder[imageFolder].details.colors.length > 0
              ? folder[imageFolder].details.colors[0].value
              : "#FFFFFF",
          text_color:
            folder[imageFolder].details.colors.length > 1
              ? folder[imageFolder].details.colors[1].value
              : "#000000",
          images: sortedImages,
          index: folder[imageFolder].index,
        };
      });
      const sortedEntries = mappedEntries.sort(
        (a: any, b: any) => a.index - b.index
      );

      result = appFile.children[pageKey];
      result.children = sortedEntries;
      result.details.text = result.details.text.sort(
        (a: any, b: any) => a.index - b.index
      );
      result.details.colors = result.details.colors.sort(
        (a: any, b: any) => a.index - b.index
      );
    }

    collectAllImages.current = collectAllImagesCopy;
    return result;
  }

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
        project["Projects"]
      ) {
        setSelectedProject(projectIndex);
        setSelectedProjectName([null, projectIndex, null]);
        const foundIndex = project["Projects"].children.findIndex(
          (item: any) => item.title === projectsList[projectIndex]
        );
        if (foundIndex !== -1) {
          const newColor1 =
            project["Projects"].children[foundIndex].bg_color || "white";
          const newColor2 =
            project["Projects"].children[foundIndex].text_color || "black";
          const newColors = [
            ["white", "black"],
            [newColor1, newColor2],
            ["white", "black"],
          ] as ProjectColors;
          setProjectColors(newColors);
        }
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
      if (
        page.startsWith("projects/") &&
        projectsList.includes(page.split("/")[1]) &&
        page.split("/").length === 2
      ) {
        setTimeout(() => {
          if (
            projectColors[1][0] !== "white" &&
            projectColors[1][0] !== "#FFF" &&
            projectColors[1][0] !== "#FFFFFF" &&
            projectColors[1][0] !== "#fff" &&
            projectColors[1][0] !== "#ffffff"
          ) {
            setCurrentNavColor("white");
          } else {
            setCurrentNavColor("black");
          }
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentNavColor("black");
        }, 900);
        setTimeout(() => {
          setCurrentNavColor("black");
        }, 2000);
      }
    }

    // Projects
    if (page.startsWith("projects") && page.split("/").length === 1) {
      setTimeout(() => {
        const projectColorsCopy = projectColors;
        projectColorsCopy[1] = ["white", "black"];
        setProjectColors(projectColorsCopy);
      }, 1000);
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

  // const playerRef = useRef<PlayerMethods | null>(null);
  // useEffect(() => {
  //   const animationProgress = preloadedFirstImagesCount / 100;
  //   if (playerRef.current) {
  //     playerRef.current.setSeeker(animationProgress * 100);
  //   }
  // }, [preloadedFirstImagesCount]);

  if (preloadingScreen) {
    return (
      <div className="w-[100vw] h-[100vh] pt-[2vh] flex flex-col gap-[10px] items-center justify-center">
        {/* <div className="flower-animation-container">
          <Player
            autoplay={false} 
            loop={false}
            src={flower}
            ref={playerRef}
            style={{
              transform: "rotate(130deg)",
              height: "300px",
              width: "300px",
            }}
          />
        </div> */}
        <div
          className="w-[400px] max-w-[65vw] h-[4px] mt-[20vh] "
          style={{ border: "1px solid #FFFFFF", borderRadius: "10px" }}
        >
          <div
            className="bg-[#BBBBBB] h-full"
            style={{
              width: `${preloadedFirstImagesCount}%`,
              transition: "width 0.2s ease-in-out",
            }}
          ></div>
        </div>
      </div>
    );
  }

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
          {currentPage === "about" && (
            <About slideUpComponent={false} navigate={navigate} />
          )}
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
                // w-[calc((310px+2vw)+(3vw+30px))] sm:w-[calc((360px+2vw)+(3vw+30px))] md:w-[calc((410px+2vw)+(3vw+30px))]
                className="w-[100vw] h-[100vh] fixed left-0 top-0 "
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
