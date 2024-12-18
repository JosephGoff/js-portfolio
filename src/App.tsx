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
const preloadImages = (imagePaths: string[]) => {
  imagePaths.forEach((path) => {
    const img = new Image();
    img.src = path;
  });
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

const App = () => {
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const [projectsList, setProjectsList] = useState<string[]>([])

  useEffect(() => {
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
          console.error(
            "Failed to fetch repository tree:",
            response.statusText
          );
          return null;
        }

        const data = await response.json();

        // Convert the flat tree to a nested structure
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
      if (fullRepo && Object.keys(fullRepo).length > 0 && fullRepo["public"]) {
        if (
          Object.keys(fullRepo["public"]).length > 0 &&
          fullRepo["public"]["assets"]
        ) {
          const fullProject = fullRepo["public"]["assets"];
          if (
            fullProject["home"] &&
            Object.keys(fullProject["home"]).length > 0
          ) {
            const coversList = processAndSortHomeCoversObject(
              fullProject["home"] as CoverInputObject
            );
            fullProject["home"] = coversList;
          }

          if (
            fullProject["projects"] &&
            Object.keys(fullProject["projects"]).length > 0
          ) {
            const projectCoversList = processAndSortProjectsObject(
              fullProject["projects"] as ProjectInputObject
            );
            fullProject["projects"] = projectCoversList;
            setProjectsList(projectCoversList.map(item => item.title.replace("_","")))
          }
          console.log(fullProject)
          setProjectAssets(fullProject);
        }
      }
    };

    getRepoTree();
  }, []);

  const processAndSortProjectsObject = (
    input: ProjectInputObject
  ): ProjectOutputItem[] => {
    const entries = Object.entries(input);
    const mappedEntries = entries.map(([key, value]) => {
      const [number, title, bg_color, text_color] = key.split("--");
      return {
        title: title,
        bg_color,
        text_color,
        covers:
          Object.keys(value).length > 0 &&
          value["covers"] &&
          Object.keys(value["covers"]).length > 0
            ? Object.keys(value["covers"]).map(
                (item) =>
                  `https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/projects/${key}/covers/` +
                  item
              )
            : [],
        images:
          Object.keys(value).length > 1
            ? [
                `https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/projects/${key}/` +
                  Object.keys(value).filter(
                    (item) => item.split(".")[0] === "cover"
                  ),
                ...Object.keys(value)
                  .filter(
                    (item) =>
                      item !== "covers" && item.split(".")[0] !== "cover"
                  ) // Filter out "cover" and non-numeric keys
                  .sort((a, b) => {
                    const aNum = a.split(".")[0]; // Extract numeric part of the filename
                    const bNum = b.split(".")[0];
                    return parseInt(aNum, 10) - parseInt(bNum, 10); // Sort numerically
                  })
                  .map(
                    (item) =>
                      `https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/projects/${key}/` +
                      item
                  ),
              ]
            : [],
        number: parseInt(number, 10),
      };
    });

    const sortedEntries = mappedEntries.sort((a, b) => a.number - b.number);
    return sortedEntries.map(({ number, ...rest }) => rest);
  };

  const processAndSortHomeCoversObject = (
    input: CoverInputObject
  ): CoverOutputItem[] => {
    const entries = Object.entries(input);
    const mappedEntries = entries.map(([key, value]) => {
      const [number, title, subTitle] = key.split("--");
      return {
        title,
        subTitle,
        images: Object.keys(value).map(
          (item) =>
            `https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/home/${key}/` +
            item
        ),
        number: parseInt(number, 10), // Parse the number to use for sorting
      };
    });

    const sortedEntries = mappedEntries.sort((a, b) => a.number - b.number);
    return sortedEntries.map(({ number, ...rest }) => rest);
  };

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

  const navigate = (page: Page) => {
    if (page === currentPage) return;

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
    const path = location.pathname;
    console.log(   projectsList.length > 0,
      selectedProjectName[1] === null,
      path.startsWith("/projects/"),
      projectsList.includes(path.split("/")[2]),
      path.split("/").length === 3,
      projectAssets !== null && 
      projectAssets["projects"] )
    if (
      projectsList.length > 0 &&
      selectedProjectName[1] === null &&
      path.startsWith("/projects/") &&
      projectsList.includes(path.split("/")[2]) &&
      path.split("/").length === 3 && 
      projectAssets !== null && 
      projectAssets["projects"] 
    ) {
      const projects = projectAssets["projects"] as any[]
      const insertProject = projectsList.findIndex(
        (link) => link === path.split("/")[2]
      );
      setSelectedProject(insertProject);
      setSelectedProjectName([null, insertProject, null]);
      let projectColorsCopy = projectColors;
      projectColorsCopy[1] = [
        projects[insertProject].bg_color,
        projects[insertProject].text_color,
      ];
      // setProjectColors(projectColorsCopy);

      // const loadImageDimensions = async () => {
      //   const dimensions = await Promise.all(
      //     projects[insertProject].images.project_images.map(
      //       (item: any) => {
      //         const imgSrc = item
      //         return new Promise<ImageDimension>((resolve) => {
      //           const img = new Image();
      //           img.onload = () =>
      //             resolve({
      //               width: img.naturalWidth,
      //               height: img.naturalHeight,
      //               src: imgSrc,
      //             });
      //           img.src = imgSrc;
      //         });
      //       }
      //     )
      //   );
      //   setIncomingImageDimensions(dimensions);

      //   const newSpeeds = [0];
      //   if (dimensions.length > 0) {
      //     const styles = dimensions.map((img, index) => {
      //       const isHorizontal = img.width > img.height;
      //       const dynamicBaseWidth = isHorizontal ? 70 : 45;
      //       const dynamicWidth = dynamicBaseWidth + Math.random() * 25;
      //       const dynamicMarginLeft = Math.random() * (100 - dynamicWidth);
      //       const currentSeparation =
      //         index === 2
      //           ? -25 + Math.random() * 50
      //           : -25 + Math.random() * 100;
      //       if (index !== 0) {
      //         if (index < 4) {
      //           newSpeeds.push(Math.random() * 0.13 + 0.05);
      //         } else {
      //           newSpeeds.push(Math.random() * 0.19 + 0.05);
      //         }
      //       }

      //       return {
      //         width: `${dynamicWidth}%`,
      //         marginLeft: `${dynamicMarginLeft}%`,
      //         marginTop: index === 1 ? "0" : `${currentSeparation}px`,
      //       };
      //     });
      //     setIncomingImageStyles(styles);
      //     setIncomingSpeed(newSpeeds);
      //   }
      // };
      // loadImageDimensions();
    }
  }, [location, projectAssets, projectsList, selectedProjectName]);

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
    const path = location.pathname
    if (
      path.startsWith("/projects/") &&
      projectsList.includes(path.split("/")[2]) &&
      path.split("/").length === 3
    ) {
      console.log("setting true")
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
