import React, { useEffect, useRef, useState } from "react";
import { IncomingPage, Page } from "../../App";
import { AnimatePresence, motion } from "framer-motion";
import "./Projects.css";
import useProjectColorsState from "../../store/useProjectColorsStore";
import useSelectedProjectState from "../../store/useSelectedProjectStore";
import { useLocation } from "react-router-dom";
import ProjectCover from "./ProjectCover";
import useSelectedProjectNameState from "../../store/useSelectedProjectNameStore";
import useCanSelectProjectState from "../../store/useCanSelectProjectState";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";

export interface ProjectsPageProps {
  navigate: (page: Page) => void;
  page: Page | IncomingPage;
  currentPage: boolean;
  animate: boolean;
}

export type ProjectEntryImage = {
  title: string;
  index: number;
  url: string;
  width: number;
  height: number;
};

export type ProjectEntry = {
  bg_color: string;
  text_color: string;
  description: string;
  id: string;
  index: number;
  title: string;
  images: ProjectEntryImage[];
};

const Projects: React.FC<ProjectsPageProps> = ({
  navigate,
  page,
  currentPage,
  animate,
}) => {
  const { selectedProject, setSelectedProject } = useSelectedProjectState();
  const { selectedProjectName, setSelectedProjectName } =
    useSelectedProjectNameState();
  const { projectColors, setProjectColors } = useProjectColorsState();
  const { canSelectProject, setCanSelectProject } = useCanSelectProjectState();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [coversVisible, setCoversVisible] = useState(false);
  const [titleAnimation, setTitleAnimation] = useState(true);
  const [titlesVisible, setTitlesVisible] = useState(currentPage);
  const [animateWave, setAnimateWave] = useState(false);
  const [animateWaveTrigger, setAnimateWaveTrigger] = useState(false);
  const [isSmall, setIsSmall] = useState<boolean>(false);

  const [projectsList, setProjectsList] = useState<string[]>([]);
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const coversRef = useRef<ProjectEntry[] | null>(null);
  const [coversReady, setCoversReady] = useState<ProjectEntry[] | null>(null);

  useEffect(() => {
    const project = projectAssets as any;
    if (
      project !== null &&
      project["Projects"]
    ) {
      const coversList = project["Projects"].children as ProjectEntry[];
      const newProjectsList = coversList.map((item) =>
        item.title.replaceAll("_", "").replaceAll("&", "and")
      );
      setProjectsList(newProjectsList);
      coversRef.current = coversList;
      setCoversReady(coversList);
    }
  }, [projectAssets]);

  useEffect(() => {
    if (animate === true) {
      setAnimateWave(true);
      setTimeout(() => {
        setAnimateWaveTrigger(true);
      }, 200);
    }

    if (currentPage) {
      if (page !== null) {
        const targetPage = page.split("/")[1];
        if (projectsList.includes(targetPage)) {
          setHoveredIndex(null);
          setCoversVisible(false);
          setTitleAnimation(false);
        }
      } else {
        setTitleAnimation(true);
        setCoversVisible(true);
        setTitlesVisible(true);
      }
    }
  }, [animate, currentPage, page, projectsList, selectedProject]);

  function handleProjectClick(index: number, item: any) {
    if (canSelectProject && coversReady !== null) {
      setCanSelectProject(false);
      const currentProj = selectedProject;
      const projectColorsCopy = projectColors;
      projectColorsCopy[2] = [item.bg_color, item.text_color];

      if (selectedProjectName[1] !== null) {
        projectColorsCopy[0] = [
          coversReady[currentProj ? currentProj : 0].bg_color,
          coversReady[currentProj ? currentProj : 0].text_color,
        ];
      } else {
        projectColorsCopy[0] = ["white", "white"];
      }
      setSelectedProject(index);
      setSelectedProjectName([null, currentProj, index]);
      const nextTitle =
        "projects/" +
        coversReady[index].title.replaceAll("_", "").replaceAll("&", "and");
      navigate(nextTitle);

      setProjectColors(projectColorsCopy);
      setTimeout(() => {
        projectColorsCopy[1] = [item.bg_color, item.text_color];
        setProjectColors(projectColorsCopy);
        setCanSelectProject(true);
        setSelectedProjectName([null, index, null]);
      }, 1000);
    }
  }

  return (
    <div className="fixed h-[100vh] w-[100vw] top-0 left-0">
      <div className="top-0 left-0 h-[100%] w-[100%]">
        <div
          style={{ backgroundColor: "transparent" }}
          className={`${
            selectedProjectName[1] !== null && "sm:flex hidden"
          } py-[75px] h-[100vh] min-h-[600px] md:min-h-[700px] lg:min-h-[800px] w-[auto] pl-[calc(10px+2vw)]`}
        >
          <div
            className="w-[300px] sm:w-[270px] md:w-[330px] lg:w-[400px] min-h-[calc(600px*0.9)] md:min-h-[calc(700px*0.9)] lg:min-h-[calc(800px*0.9)] h-[calc((100vh-88px)*0.9)] mt-[calc((100vh-88px)*0.025)] flex items-center"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                transform: selectedProject === null ? "none" : "scale(0.6)",
                transition: titleAnimation
                  ? "transform 1s cubic-bezier(0.6, 0.05, 0.3, 1"
                  : "none",
                transformOrigin: "left",
              }}
              className="caster cursor-pointer flex flex-col"
            >
              {coversReady !== null &&
                coversReady.map((item, index) => {
                  return (
                    <div
                      className={`text-[30px] leading-[38px] md:text-[37px] md:leading-[46px] lg:text-[46px] lg:leading-[59px]`}
                      style={{ transition: "opacity 0.5s ease-in-out" }}
                      key={index}
                      onMouseEnter={() => {
                        if (selectedProject === null) {
                          setHoveredIndex(index);
                        }
                      }}
                      onMouseLeave={() => {
                        if (selectedProject === null) {
                          setHoveredIndex(null);
                        }
                      }}
                      onClick={() => {
                        setTimeout(() => {
                          setIsSmall(true);
                        }, 1000);
                        handleProjectClick(index, item);
                      }}
                    >
                      <div
                        className={` ${titlesVisible ? "visible" : "hidden"}`}
                      >
                        <div className="project-container">
                          <div
                            key={index}
                            className={`${
                              selectedProject === null
                                ? "white-dim"
                                : "select-dark"
                            } project-letter  ${
                              titlesVisible && animate ? "project-reveal" : ""
                            }`}
                            style={{
                              whiteSpace: "nowrap",
                              display: "flex",
                              flexDirection: "row",
                              // animationDelay: animateWave
                              //   ? `${Math.pow(index, 0.75) * 0.045}s`
                              //   : "none",
                              transition: "color 0.8s ease",
                              color: projectColors[1][1],
                              opacity:
                                selectedProject === null
                                  ? "1"
                                  : selectedProject === index
                                  ? "1"
                                  : "0.5",
                              transform: animate
                                ? "translateY(%100)"
                                : "translateY(0)",
                            }}
                          >
                            {item.title
                              .split("_")
                              .map(
                                (item) =>
                                  item.charAt(0).toUpperCase() + item.slice(1)
                              )
                              .join(" ")
                              .split("")
                              .map((letter: any) => {
                                return (
                                  <span>
                                    {letter === " " ? (
                                      "\u00A0"
                                    ) : letter === "&" ? (
                                      <span className="abygaer">&</span>
                                    ) : (
                                      letter
                                    )}
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {coversVisible && (
          <div
            className="absolute right-0 top-0 w-[calc(98vw-310px)] sm:w-[calc(98vw-280px)] md:w-[calc(98vw-340px)] lg:w-[calc(98vw-410px)] min-h-[100vh] sm:flex hidden pr-[calc(3px+3vw)] pl-[30px] pt-[100px]"
            style={{
              backgroundColor: "transparent",
              transition: "transform 2s ease-in-out",
              transform:
                selectedProject === null
                  ? "translateY(0)"
                  : "translateY(calc(-30vh))",
            }}
          >
            <div
              className="w-[100%] h-[auto] relative"
              style={{ backgroundColor: "transparent" }}
            >
              <AnimatePresence>
                {hoveredIndex !== null && (
                  <motion.div
                    key={hoveredIndex}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                  >
                    <ProjectCover
                      projectIndex={hoveredIndex}
                      coversReady={coversReady}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
