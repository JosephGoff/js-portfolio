import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Projects from "./Pages/Projects/Projects";
import Navbar from "./Components/Navbar/Navbar";
import Archives from "./Pages/Archives/Archives";
import "./App.css";
import ProjectsPage from "./Pages/Projects/ProjectsPage/ProjectsPage";
import useProjectColorsState from "./store/useProjectColorsStore";
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
// import yaml from "js-yaml";
import axios from "axios";

export interface SlideUpPageProps {
  children: React.ReactNode;
  isVisible: boolean;
  full: boolean;
  zIdx: number;
  nextColor: string;
}

interface ImageDimension {
  width: number;
  height: number;
  src: string;
}

export interface SlideUpProjectPageProps {
  isVisible: boolean;
  zIdx: number;
}

export interface TreeNode {
  children: { [key: string]: TreeNode }; // Nested folders
  images: ImageResource[]; // Images within a folder
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

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  children?: DriveFile[]; // Optional for files; required for folders
}

export type Tree = {
  [key: string]: Tree | string[] | string;
};

export const BASE_URL = "https://drive.google.com/uc?id=";

const App = () => {
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const { preloadedImages, setPreloadedImages } = usePreloadedImagesStore();
  const [projectsList, setProjectsList] = useState<string[]>([]);
  const { selectedArchiveGroup, setSelectedArchiveGroup } =
    useSelectedArchiveGroupStore();

  const fetchFolderContents = async (
    folderId: string | undefined
  ): Promise<DriveFile[]> => {
    if (folderId === undefined) {
      return [];
    }
    try {
      const response = await axios.get(
        "https://www.googleapis.com/drive/v3/files",
        {
          params: {
            q: `'${folderId}' in parents and trashed = false`,
            key: process.env.REACT_APP_GOOGLE_DRIVE_API_KEY,
            // key: process.env.GOOGLE_DRIVE_API_KEY,
            fields: "files(id, name, mimeType)",
          },
        }
      );

      const files: DriveFile[] = response.data.files;

      const children = await Promise.all(
        files.map(async (file) => {
          if (file.mimeType === "application/vnd.google-apps.folder") {
            return {
              ...file,
              children: await fetchFolderContents(file.id), // Recursive call
            };
          }
          return file; // Return file as-is if it's not a folder
        })
      );

      return children;
    } catch (error) {
      console.error("Error fetching folder contents:", error);
      return [];
    }
  };

  // Fetch the tree structure on component mount
  useEffect(() => {
    const fetchTree = async () => {
      const treeStructure = await fetchFolderContents(
        process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID
      );
      const newTree: Tree = {};
      if (treeStructure.length > 0) {
        for (let i = 0; i < treeStructure.length; i++) {
          const page = treeStructure[i];
          newTree[page.name] = sortPages(page);
        }
        setProjectAssets(newTree)
      } else return;

      function sortPages(page: any) {
        if (page.name === "about") {
          if (page.children.length > 0) {
            return page.children.map((item: any) => {
              return {
                name: item.name,
                url: BASE_URL + item.id,
              };
            });
          } else {
            return [];
          }
        }
        if (page.children.length > 0) {
          const innerFolders: Tree = {};
          for (let i = 0; i < page.children.length; i++) {
            const innerFolder = page.children[i];
            innerFolders[innerFolder.name] = innerFolder.children.map(
              (item: any) => {
                return {
                  name: item.name,
                  url: BASE_URL + item.id,
                };
              }
            );
          }
          return innerFolders;
        }
        return {};
      }
    };

    fetchTree();
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

  const [disableTransition, setDisableTransition] = useState(false);
  const [cachedCurrent, setCachedCurrent] = useState<Page>("home");
  const [sittingProject, setSittingProject] = useState(false);
  const { currentNavColor, setCurrentNavColor } = useCurrentNavColorState();
  const [canSelectPage, setCanSelectPage] = useState<boolean>(true);

  const navigate = (page: Page) => {
    if (page === currentPage || !canSelectPage) return;

    if (page.startsWith("archives")) {
      setTimeout(() => {
        setCurrentNavColor("white");
      }, 2000);
    } else {
      setCurrentNavColor("black");
    }
    const newVal = currentPage;
    if (
      page.startsWith("projects/") &&
      projectsList.includes(page.split("/")[1]) &&
      page.split("/").length === 2
    ) {
      setSittingProject(false);
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
      }
      setCachedCurrent(newVal);
      setCanSelectPage(true);
    }, 1000); // Match this timeout to the animation duration
  };

  // HOME PAGE COVER LAYOUT ORDER (num covers, 2 layouts available so far)
  const numberOfLayoutsCreated = 7;
  const numberOfCovers = 2;
  // Generate an array where each number is unique to the two next to it
  const [layoutOrder, setLayoutOrder] = useState(() => {
    let previous = -1; // Start with a value that can't match the first random number
    const array = Array.from({ length: numberOfCovers }, (_, index) => {
      let next;
      do {
        next = Math.floor(Math.random() * numberOfLayoutsCreated);
      } while (next === previous);
      previous = next;
      return next;
    });

    // Ensure the first and last elements are different
    if (array.length > 1 && array[0] === array[array.length - 1]) {
      let replacement;
      do {
        replacement = Math.floor(Math.random() * numberOfLayoutsCreated);
      } while (
        replacement === array[array.length - 2] ||
        replacement === array[0]
      );
      array[array.length - 1] = replacement;
    }

    return array;
  });

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
          {currentPage === "about" && <About navigate={navigate} />}
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
            zIndex: selectedProjectName[1] !== null ? 102 : 101,
          }}
        >
          {currentPage?.startsWith("projects/") &&
            projectsList.includes(currentPage.split("/")[1]) &&
            currentPage.split("/").length === 2 && (
              <div>
                {sittingProject && (
                  <div
                    className="w-[0] sm:w-[calc(2vw+225px)] md:w-[calc(2vw+255px)]
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
                className="w-[calc(310px+2vw)] sm:w-[calc(360px+2vw)] md:w-[calc(410px+2vw)] h-[100vh] fixed left-0 top-0 "
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
            <About navigate={navigate} />
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
      <App />
    </Router>
  </>
);

export default Root;
