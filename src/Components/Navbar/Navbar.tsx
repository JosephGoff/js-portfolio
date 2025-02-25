import React, { useEffect, useRef, useState } from "react";
import { Page } from "../../App";
import "./Navbar.css";
import { useLocation } from "react-router-dom";
import useCurrentPageState from "../../store/useCurrentPageStore";
import useSelectedProjectState from "../../store/useSelectedProjectStore";
import useCurrentNavColorState from "../../store/useCurrentNavColorStore";
import useSelectedProjectNameState from "../../store/useSelectedProjectNameStore";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";
import useSelectedArchiveGroupStore from "../../store/useSelectedArchiveGroupStore";
import { ProjectEntry } from "../../Pages/Projects/Projects";

interface PageProps {
  navigate: (page: Page) => void;
}

const Navbar: React.FC<PageProps> = ({ navigate }) => {
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [navOpenSpin, setNavOpenSpin] = useState<boolean>(false);
  const [navOnScreen, setNavOnScreen] = useState<boolean>(false);
  const isOpenRef = useRef<boolean>(false);
  const navOverlayBG = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { currentNavColor, setCurrentNavColor } = useCurrentNavColorState();
  const { selectedArchiveGroup, setSelectedArchiveGroup } =
    useSelectedArchiveGroupStore();

  const indexRef = useRef<HTMLDivElement>(null);
  const infosRef = useRef<HTMLDivElement>(null);
  const archivesRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const [canSelectPage, setCanSelectPage] = useState(true);

  const [isVisible, setIsVisible] = useState(false);
  const [isRevealing1, setIsRevealing1] = useState(true);
  const [isRevealing2, setIsRevealing2] = useState(true);
  const [isRevealing3, setIsRevealing3] = useState(true);
  const [dropdown1Display, setDropdown1Display] = useState(false);
  const [dropdown2Display, setDropdown2Display] = useState(false);
  const [dropdown3Display, setDropdown3Display] = useState(false);

  const { currentPage, setCurrentPage } = useCurrentPageState();
  const { selectedProject, setSelectedProject } = useSelectedProjectState();
  const { selectedProjectName, setSelectedProjectName } =
    useSelectedProjectNameState();

  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const [projectsList, setProjectsList] = useState<string[]>([]);

  // useEffect(() => {
  //   if (navRef.current) {
  //     if (selectedArchiveGroup == null) {
  //       navRef.current.style.opacity = "1";
  //       navRef.current.style.pointerEvents = "all";
  //     } else {
  //       navRef.current.style.opacity = "0";
  //       navRef.current.style.pointerEvents = "none";
  //     }
  //   }
  // }, [selectedArchiveGroup]);

  useEffect(() => {
    const projects = projectAssets as any
    if (
      projects !== null &&
      projects["projects"] &&
      Array.isArray(projects["projects"]) &&
      projects["projects"].length > 0
    ) {
      const coversList = projects["projects"] as ProjectEntry[];
      const newProjectsList = coversList.map((item) =>
        item.title.replace("_", "")
      );
      setProjectsList(newProjectsList);
    }
  }, [projectAssets]);

  function showText() {
    setTimeout(() => {
      setIsRevealing1(true);
      setIsRevealing2(true);
      setIsRevealing3(true);
      setIsVisible(true);
      setDropdown1Display(true);
    }, 200);

    setTimeout(() => {
      setDropdown2Display(true);
    }, 350);

    setTimeout(() => {
      setDropdown3Display(true);
    }, 500);
  }

  function hideText() {
    setIsRevealing3(false);
    setTimeout(() => {
      setIsRevealing2(false);
    }, 150);
    setTimeout(() => {
      setIsRevealing1(false);
    }, 300);

    setTimeout(() => {
      setIsVisible(false);
      setDropdown1Display(false);
      setDropdown2Display(false);
      setDropdown3Display(false);
    }, 900);
  }

  useEffect(() => {
    const handleNavResize = () => {
      if (window.innerWidth >= 768 && isOpenRef && isOpenRef.current) {
        isOpenRef.current = false;
        setNavOpen(false);
        setNavOpenSpin(false);
        setNavOnScreen(false);
        hideText();
        document.body.style.overflow = "";
      }
    };

    window.addEventListener("resize", handleNavResize);
    return () => {
      window.removeEventListener("resize", handleNavResize);
    };
  }, []);

  function closeNavQuick() {
    if (isOpenRef && isOpenRef.current) {
      isOpenRef.current = false;
      setNavOpen(false);
      setNavOpenSpin(false);
      setNavOnScreen(false);
      document.body.style.overflow = "";
    }
  }

  const [isAnimatingNav, setIsAnimatingNav] = useState<boolean>(false);
  function toggleNav() {
    if (isOpenRef) {
      const newVal = !isOpenRef.current;
      if (isOpenRef.current) {
        // Close Nav
        document.body.style.overflow = "";
        hideText();
        setIsAnimatingNav(true);
        setNavOpenSpin(newVal);
        setTimeout(() => {
          setNavOpen(newVal);
          setTimeout(() => {
            setNavOnScreen(false);
            setIsAnimatingNav(false);
          }, 700);
        }, 680);
      } else {
        // Open Nav
        document.body.style.overflow = "hidden";
        setNavOpen(newVal);
        setNavOpenSpin(newVal);
        showText();
        setNavOnScreen(true);
        setIsAnimatingNav(true);
        setTimeout(() => {
          setIsAnimatingNav(false);
        }, 700);
      }
      isOpenRef.current = newVal;
    }
  }

  const [firstPageLoad, setFirstPageLoad] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setFirstPageLoad(true);
    }, 200);
  }, []);

  const handleSendNewEmailClick = () => {
    const sendEmail = "jessshul27@gmail.com";
    window.location.href = `mailto:${sendEmail}`;
  };

  const [pageTrue, setPageTrue] = useState(0);

  useEffect(() => {
    if (
      location.pathname.startsWith("/projects/") &&
      projectsList.includes(location.pathname.split("/")[2]) &&
      location.pathname.split("/").length === 3 &&
      indexRef &&
      infosRef &&
      archivesRef &&
      indexRef.current &&
      infosRef.current &&
      archivesRef.current
      // &&
      // !indexRef.current.classList.contains("nav-item2")
    ) {
      // indexRef.current.classList.add("nav-item2");
      // infosRef.current.classList.remove("nav-item2");
      // archivesRef.current.classList.remove("nav-item2");
      // setPageTrue(1);
    }

    // if (
    //   ["/about", "/projects", "/archives"].includes(location.pathname) ||
    //   (location.pathname.startsWith("/projects/") &&
    //     projectsList.includes(location.pathname.split("/")[2]) &&
    //     location.pathname.split("/").length === 3)
    // ) {
    //   if (location.pathname.includes("/projects")) {
    //     setPageTrue(1);
    //   } else if (location.pathname.includes("/about")) {
    //     setPageTrue(2);
    //   } else if (location.pathname.includes("/archives")) {
    //     setPageTrue(3);
    //   } else setPageTrue(0);
    // }
  }, [location, projectsList]);

  function updateClasses(item: number) {
    const current = pageTrue;
    if (
      indexRef &&
      infosRef &&
      archivesRef &&
      indexRef.current &&
      infosRef.current &&
      archivesRef.current
    ) {
      // if (item === 1 && current !== 1) {
      //   indexRef.current.classList.add("nav-item2");
      //   infosRef.current.classList.remove("nav-item2");
      //   archivesRef.current.classList.remove("nav-item2");
      // }
      // if (item === 2 && current !== 2) {
      //   indexRef.current.classList.remove("nav-item2");
      //   infosRef.current.classList.add("nav-item2");
      //   archivesRef.current.classList.remove("nav-item2");
      // }
      // if (item === 3 && current !== 3) {
      //   indexRef.current.classList.remove("nav-item2");
      //   infosRef.current.classList.remove("nav-item2");
      //   archivesRef.current.classList.add("nav-item2");
      // }
      // if (item !== 3 && item !== 2 && item !== 1) {
      //   indexRef.current.classList.remove("nav-item2");
      //   infosRef.current.classList.remove("nav-item2");
      //   archivesRef.current.classList.remove("nav-item2");
      // }
    }
  }

  function selectedPage() {
    setCanSelectPage(false);
    setTimeout(() => {
      setCanSelectPage(true);
    }, 1000);
  }

  function clickedDropdownPage(newPage: string) {
    const currentPage = location.pathname.replace("/", "") || "home";
    if (
      ["home", "about", "projects", "archives"].includes(currentPage) &&
      newPage === currentPage
    ) {
      toggleNav();
      return;
    }

    setNavOpenSpin(false);
    hideText();

    if (navOverlayBG && navOverlayBG.current !== null) {
      navOverlayBG.current.style.transition = "none";
    }

    setTimeout(() => {
      closeNavQuick();
    }, 990);

    setTimeout(() => {
      if (navOverlayBG && navOverlayBG.current !== null) {
        navOverlayBG.current.style.transition =
          "transform 0.7s cubic-bezier(0.5, 0, 0.1, 1)";
      }
    }, 1200);
  }

  const handleHomeClick = () => {
    if (canSelectPage) {
      updateClasses(0);
      if (navOpen) {
        clickedDropdownPage("home");
      }
      selectedPage();
      navigate("home");
    }
  };

  const handleIndexClick = (dropdown: boolean) => {
    if (canSelectPage) {
      selectedPage();
      if (dropdown) {
        setSelectedProject(null);
        setSelectedProjectName([null, null, null]);

        clickedDropdownPage("projects");
      } else {
        if (currentPage !== "projects") {
          setTimeout(() => {
            setSelectedProject(null);
            setSelectedProjectName([null, null, null]);
          }, 1000);
        }
      }
      updateClasses(1);
      setPageTrue(1);
      navigate("projects");
    }
  };

  const handleInfosClick = (dropdown: boolean) => {
    if (canSelectPage) {
      selectedPage();
      if (dropdown) {
        clickedDropdownPage("about");
      }
      updateClasses(2);
      setPageTrue(2);
      navigate("about");
    }
  };

  const handleArchivesClick = (dropdown: boolean) => {
    if (canSelectPage) {
      selectedPage();
      if (dropdown) {
        clickedDropdownPage("archives");
      }
      updateClasses(3);
      setPageTrue(3);
      navigate("archives");
    }
  };

  return (
    <div ref={navRef} style={{transition: "opacity 0.9s ease-in-out"}}>
      <div
        className="w-[100vw] h-[88px] fixed z-[910] flex justify-between lg:px-[32px] px-[18px]"
        style={{
          backgroundColor: "transparent",
          opacity: firstPageLoad ? 1 : 0,
          transition: "opacity 0.9s ease-in-out",
        }}
      >
        <div
          className="nav-text-item mr-[calc(22px+1vw)] select-none cursor-pointer mt-[20px] md:mt-[32px] text-[16px] lg:text-[21px] leading-[16px] lg:leading-[21px] font-[400]"
          onClick={handleHomeClick}
          style={{ color: currentNavColor }}
        >
          JESS SHULMAN
        </div>
        <div className="mt-[32px] lg:flex hidden flex-col leading-[14px] gap-[3.5px]">
          <div
            style={{ color: currentNavColor }}
            className="nav-text-item select-none text-[14px]"
          >
            PHOTOGRAPHER & DESIGNER
          </div>
          <div className="flex flex-row gap-[6px] text-[14px] h-[15px]">
            <div
              onClick={handleSendNewEmailClick}
              className="nav-item cursor-pointer"
              style={{ color: currentNavColor }}
            >
              JESSSHUL27@GMAIL.COM
            </div>
            <p
              style={{ color: currentNavColor }}
              className="nav-text-item select-none text-[13px] mt-[-1.3px] font-[400]"
            >
              /
            </p>
            <a
              className="select-none nav-item cursor-pointer"
              href="https://www.instagram.com/jessica.shulman.design/"
              style={{ color: currentNavColor }}
            >
              INSTAGRAM
            </a>
          </div>
        </div>
        <div
          style={{ color: currentNavColor }}
          className="select-none mt-[32px] hidden md:flex flex-row h-[15px] text-[14px] leading-[14px]"
        >
          <div
            ref={indexRef}
            className={`nav-item cursor-pointer mx-[calc(3px+0.3vw)]`}
            onClick={() => handleIndexClick(false)}
            style={{ color: currentNavColor }}
          >
            INDEX
          </div>
          <div
            ref={infosRef}
            className={`cursor-pointer nav-item mx-[calc(3px+0.3vw)]`}
            onClick={() => handleInfosClick(false)}
            style={{ color: currentNavColor }}
          >
            INFOS
          </div>
          <div
            ref={archivesRef}
            className={`cursor-pointer nav-item mx-[calc(3px+0.3vw)]`}
            onClick={() => handleArchivesClick(false)}
            style={{ color: currentNavColor }}
          >
            ARCHIVES
          </div>
        </div>

        <div
          className="relative mt-[12px] h-[34px] w-[35px] md:hidden flex cursor-pointer"
          onClick={() => {
            if (!isAnimatingNav) {
              toggleNav();
            }
          }}
        >
          <div
            className="nav-transition nav-hamburger-bar select-none absolute top-[16px] left-0"
            style={{
              backgroundColor: currentNavColor,
              marginTop: navOpenSpin ? 0 : "-4.5px",
              transform: navOpenSpin ? "rotate(45deg)" : "none",
            }}
          ></div>
          <div
            className="nav-transition nav-hamburger-bar select-none absolute top-[16px] left-0"
            style={{
              backgroundColor: currentNavColor,
              opacity: navOpenSpin ? 0 : 1,
            }}
          ></div>
          <div
            className="nav-transition nav-hamburger-bar select-none absolute top-[16px] left-0"
            style={{
              backgroundColor: currentNavColor,
              marginTop: navOpenSpin ? 0 : "4.5px",
              transform: navOpenSpin ? "rotate(-45deg)" : "none",
            }}
          ></div>
        </div>
      </div>

      <div
        ref={navOverlayBG}
        className={`fixed z-[701] min-h-[500px] top-0 left-0 md:hidden flex w-[100vw] h-[100vh] items-start justify-center flex-col pl-[20px]`}
        style={{
          backgroundColor: "white",
          transition: "transform 0.7s cubic-bezier(0.5, 0, 0.1, 1)",
          transform: navOpen ? "translateY(0)" : "translateY(-100%)",
        }}
      ></div>

      <div
        className={`fixed z-[701] min-h-[500px] top-0 left-0 md:hidden 
          ${navOnScreen ? "flex" : "hidden"}
          w-[100vw] h-[calc(100vh-20px)] mt-[20px] items-center justify-center pl-[20px]`}
        style={{ backgroundColor: "transparent" }}
      >
        <div
          className="h-[160px] w-[100%] flex flex-col gap-[26px]"
          style={{ backgroundColor: "transparent" }}
        >
          <div
            className={`text-reveal-wrapper 
            ${dropdown1Display ? "flex" : "hidden"}
            ${isVisible ? "visible" : ""}`}
          >
            <div
              onClick={() => {
                handleIndexClick(true);
              }}
              className={`klivora ${
                isRevealing1 ? "text-reveal" : "text-conceal"
              } 
      hover-dim5 text-[42px] tracking-[1px] leading-[29px] dimmer cursor-pointer`}
            >
              INDEX
            </div>
          </div>
          <div
            className={`text-reveal-wrapper
            ${dropdown2Display ? "flex" : "hidden"}
             ${isVisible ? "visible" : ""}`}
          >
            <div
              onClick={() => {
                handleInfosClick(true);
              }}
              className={`klivora ${
                isRevealing2 ? "text-reveal" : "text-conceal"
              } 
      hover-dim5 text-[42px] tracking-[1px] leading-[29px] dimmer cursor-pointer`}
            >
              INFOS
            </div>
          </div>
          <div
            className={`text-reveal-wrapper
            ${dropdown3Display ? "flex" : "hidden"}
             ${isVisible ? "visible" : ""}`}
          >
            <div
              onClick={() => {
                handleArchivesClick(true);
              }}
              className={`klivora ${
                isRevealing3 ? "text-reveal" : "text-conceal"
              } 
      hover-dim5 text-[42px] tracking-[1px] leading-[29px] dimmer cursor-pointer`}
            >
              ARCHIVES
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
