import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import { CoverOutputItem, Page } from "../../App";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { debounce } from "lodash";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";
import usePreloadedImagesStore from "../../store/usePreloadedImagesStore";

export interface HomePageProps {
  navigate: (page: Page) => void;
  layoutOrder: number[];
  slideUpComponent: boolean;
}


const Home: React.FC<HomePageProps> = ({
  navigate,
  layoutOrder,
  slideUpComponent,
}) => {
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const { preloadedImages, setPreloadedImages } = usePreloadedImagesStore();
  const coversRef = useRef<CoverOutputItem[] | null>(null);
  const [coversReady, setCoversReady] = useState<CoverOutputItem[] | null>(null);

  useEffect(() => {
   if (
    projectAssets !== null &&
    projectAssets["home"] &&
    Array.isArray(projectAssets["home"]) &&
    projectAssets["home"].length > 0
  ) {
      coversRef.current = projectAssets["home"] as CoverOutputItem[]
      readyToTransition.current = true;
      setCoversReady(projectAssets["home"] as CoverOutputItem[]);
    }
  }, [projectAssets]);

  const coverLayouts = [
    [
      { x: 10, y: 9, w: 24, h: 1.4, z: 104, top: true },
      { x: 45, y: 10, w: 19, h: 1.2, z: 103, top: true },
      { x: 73, y: 5, w: 20, h: 1.3, z: 104, top: true },
      { x: 4, y: 15, w: 18, h: 1.4, z: 104, top: false },
      { x: 37, y: 2, w: 23, h: 1.2, z: 104, top: false },
      { x: 62, y: 6, w: 28, h: 1.3, z: 104, top: false },
    ],
    [
      { x: 5, y: 9, w: 16, h: 1.2, z: 104, top: true },
      { x: 37, y: 3, w: 22, h: 1.2, z: 103, top: true },
      { x: 72, y: 9, w: 20, h: 1.3, z: 104, top: true },
      { x: 11, y: 15, w: 24, h: 1.4, z: 104, top: false },
      { x: 45, y: 0, w: 23, h: 1.2, z: 104, top: false },
      { x: 72, y: 13, w: 15, h: 1.3, z: 104, top: false },
    ],
    [
      { x: 3, y: 8, w: 23, h: 1.3, z: 104, top: true },
      { x: 44, y: 0, w: 23, h: 1.3, z: 103, top: true },
      { x: 70, y: 10, w: 23, h: 1.3, z: 104, top: true },
      { x: 15, y: 10, w: 25, h: 1.2, z: 104, top: false },
      { x: 44, y: 0, w: 24, h: 1.35, z: 104, top: false },
      { x: 81, y: 6, w: 16, h: 1.25, z: 104, top: false },
    ],
    [
      { x: 14, y: 8, w: 17, h: 1.3, z: 104, top: true },
      { x: 47, y: 10, w: 24, h: 1.3, z: 103, top: true },
      { x: 78, y: 13.5, w: 20, h: 1.3, z: 104, top: true },
      { x: 0, y: 9, w: 16, h: 1.25, z: 104, top: false },
      { x: 26, y: 0, w: 25, h: 1.35, z: 104, top: false },
      { x: 68, y: 9, w: 20, h: 1.25, z: 104, top: false },
    ],
    [
      { x: 12, y: 9, w: 14, h: 1.3, z: 104, top: true },
      { x: 34, y: 11, w: 25, h: 1.3, z: 103, top: true },
      { x: 77, y: 8, w: 13, h: 1.3, z: 104, top: true },
      { x: 4.5, y: 0, w: 19, h: 1.25, z: 104, top: false },
      { x: 27, y: 7, w: 24, h: 1.35, z: 104, top: false },
      { x: 75.5, y: 9, w: 20, h: 1.25, z: 104, top: false },
    ],
    [
      { x: 0, y: 9, w: 16, h: 1.2, z: 104, top: true },
      { x: 37, y: 0, w: 22, h: 1.2, z: 103, top: true },
      { x: 72, y: 3, w: 15, h: 1.3, z: 104, top: true },
      { x: 11, y: 15, w: 24, h: 1.4, z: 104, top: false },
      { x: 37, y: 0, w: 23, h: 1.2, z: 104, top: false },
      { x: 73, y: 6, w: 18, h: 1.3, z: 104, top: false },
    ],
    [
      { x: 12, y: 5, w: 21, h: 1.3, z: 104, top: true },
      { x: 31, y: 0, w: 19, h: 1.3, z: 103, top: true },
      { x: 70, y: 0, w: 15, h: 1.3, z: 104, top: true },
      { x: 5, y: 10, w: 24, h: 1.25, z: 104, top: false },
      { x: 37, y: 0, w: 23, h: 1.2, z: 104, top: false },
      { x: 73, y: 6, w: 18, h: 1.2, z: 104, top: false },
    ],
  ];
  const pageLayouts = layoutOrder.map((item) => coverLayouts[item]);
  const nextMove = useRef([0, false]);
  const [currentCover, setCurrentCover] = useState(0);
  const currentCoverRef = useRef(0);
  const [currentLayout, setCurrentLayout] = useState(pageLayouts[0]);

  const [exitingCover, setExitingCover] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Text
  const [coverTitle, setCoverTitle] = useState<string[]>([]);
  const [nextTitle, setNextTitle] = useState<string[]>([]);
  const [subTitle, setSubTitle] = useState<string[]>([]);

  // Display
  const [isVisible, setIsVisible] = useState(true);
  const [isRevealing1, setIsRevealing1] = useState([1, true]);
  const [isDisplayed, setIsDisplayed] = useState(true);

  // Next Display
  const [isRevealingNext, setIsRevealingNext] = useState([1, true]);
  const [isNextVisible, setIsNextVisible] = useState(false);
  const [isNextDisplayed, setIsNextDisplayed] = useState(false);

  // Sub Title
  const [isSubVisible, setSubIsVisible] = useState(false);
  const [isRevealing2, setIsRevealing2] = useState([1, true]);

  const readyToTransition = useRef(false);
  const animatingRef = useRef([0, 0]);
  const [firstPageLoad, setFirstPageLoad] = useState(false);

  const readyToRetrigger = useRef(false);

  useEffect(() => {
    const handleScroll = debounce((event: any) => {
      event.stopPropagation();
      const deltaY = event.deltaY;
      if (readyToTransition) {
        if (deltaY > 20) {
          if (readyToTransition.current) {
            handleNextCover(event);
          } else {
            if (nextMove && !nextMove.current[1] && readyToRetrigger.current) {
              nextMove.current = [1, true];
              readyToRetrigger.current = false;
            }
          }
        } else if (deltaY < -20) {
          if (readyToTransition.current) {
            handlePrevCover(event);
          } else {
            if (nextMove && !nextMove.current[1] && readyToRetrigger.current) {
              nextMove.current = [-1, true];
              readyToRetrigger.current = false;
            }
          }
        } else if (deltaY < 4 && deltaY > -4) {
          if (
            !readyToRetrigger.current &&
            !nextMove.current[1] &&
            animatingRef.current[0] !== animatingRef.current[1]
          ) {
            readyToRetrigger.current = true;
          }
          if (
            readyToRetrigger.current &&
            animatingRef.current[0] === animatingRef.current[1]
          ) {
            readyToRetrigger.current = false;
          }
        }
      }
    }, 5);
    window.addEventListener("wheel", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!slideUpComponent && coversRef.current !== null) {
      let timeoutId: NodeJS.Timeout;
      let intervalId: NodeJS.Timeout;
      const maxWaitTime = 60000; 
      const checkInterval = 50; 

      const startChecking = () => {
        const startTime = Date.now();

        intervalId = setInterval(() => {
          if (preloadedImages[0] === true) {
            clearInterval(intervalId);
            setFirstPageLoad(true);
          } else if (Date.now() - startTime >= maxWaitTime) {
            clearInterval(intervalId);
          }
        }, checkInterval);
      };

      timeoutId = setTimeout(startChecking, 260);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [coversReady]);

  useEffect(() => {
    if (!slideUpComponent && currentCoverRef && coversRef.current !== null) {
      const text = coversRef.current[currentCoverRef.current].title
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("_")
        .replace(" ", "_")
        .split("");
      const text2 = coversRef.current[currentCoverRef.current].subTitle
        .replace(" ", "_")
        .toUpperCase()
        .split("");
      setCoverTitle(text);
      setSubTitle(text2);
      setTimeout(() => {
        setSubIsVisible(true);
      }, 200);
    }
  }, [coversRef, currentCoverRef, slideUpComponent, coversReady]);

  const changeCover = (direction: number) => {
    if (isTransitioning || !currentCoverRef || coversRef.current === null)
      return;
    const incomingProject =
      direction === 1
        ? currentCoverRef.current === coversRef.current.length - 1
          ? 0
          : currentCoverRef.current + 1
        : currentCoverRef.current === 0
        ? coversRef.current.length - 1
        : currentCoverRef.current - 1;

    const text = coversRef.current[incomingProject].title
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("_")
      .replace(" ", "_")
      .split("");
    const text2 = coversRef.current[incomingProject].subTitle
      .replace(" ", "_")
      .toUpperCase()
      .split("");

    // Subtitle
    setIsRevealing2([direction, false]);
    setTimeout(() => {
      setSubTitle(text2);
      setIsRevealing2([direction, true]);
    }, 400);

    // Main title
    setNextTitle(text);
    setTimeout(() => {
      setIsRevealing1([direction, false]);
      setTimeout(() => {
        if (currentCoverRef && coversRef.current !== null) {
          if (direction === 1) {
            const nextCover =
              currentCoverRef.current === coversRef.current.length - 1
                ? 0
                : currentCoverRef.current + 1;
            currentCoverRef.current = nextCover;
            setCurrentCover(nextCover);
            setCurrentLayout(pageLayouts[nextCover]);
          } else {
            const nextCover =
              currentCoverRef.current === 0
                ? coversRef.current.length - 1
                : currentCoverRef.current - 1;
            currentCoverRef.current = nextCover;
            setCurrentCover(nextCover);
            setCurrentLayout(pageLayouts[nextCover]);
          }
        }
        setExitingCover(null);
      }, 600);

      setTimeout(() => {
        // reveal the next
        setIsNextDisplayed(true);
        setIsRevealingNext([direction, true]);
        setIsNextVisible(true);

        setTimeout(() => {
          // hide the first
          setIsVisible(false);
          setIsRevealing1([direction, true]);
          setCoverTitle(text);

          setTimeout(() => {
            setIsDisplayed(true);
            setTimeout(() => {
              setIsVisible(true);
              setIsNextVisible(false);
              setIsNextDisplayed(false);
              setIsRevealingNext([direction, true]);
            }, 100);
          }, 1000);
        }, 600);
      }, 100);
    }, 100);

    setIsTransitioning(true);
    setExitingCover(currentCoverRef.current);

    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleNextCover = debounce((event: any) => {
    event.stopPropagation();
    if (readyToTransition && readyToTransition.current) {
      changeCover(1);
      readyToTransition.current = false;
      if (animatingRef) {
        animatingRef.current[0] += 1;
      }
      setTimeout(() => {
        if (readyToTransition) {
          readyToTransition.current = true;
          readyToRetrigger.current = true;
          if (nextMove.current[1]) {
            if (animatingRef) {
              animatingRef.current[1] += 1;
            }
            doNextMove();
          } else {
            nextMove.current = [0, false];
            readyToRetrigger.current = false;
            readyToTransition.current = true;
            if (animatingRef) {
              animatingRef.current[1] += 1;
            }
          }
        }
      }, 1910);
    }
  }, 50);

  const handlePrevCover = (event: any) => {
    event.stopPropagation();
    if (readyToTransition && readyToTransition.current) {
      changeCover(-1);
      readyToTransition.current = false;
      if (animatingRef) {
        animatingRef.current[0] += 1;
      }
      setTimeout(() => {
        if (readyToTransition) {
          readyToTransition.current = true;
          readyToRetrigger.current = true;
          if (nextMove.current[1]) {
            if (animatingRef) {
              animatingRef.current[1] += 1;
            }
            doNextMove();
          } else {
            nextMove.current = [0, false];
            readyToRetrigger.current = false;
            readyToTransition.current = true;
            if (animatingRef) {
              animatingRef.current[1] += 1;
            }
          }
        }
      }, 1910);
    }
  };

  function doNextMove() {
    const fakeEvent = { stopPropagation: () => {} };
    if (nextMove.current[0] === 1) {
      nextMove.current = [0, false];
      handleNextCover(fakeEvent);
    }
    if (nextMove.current[0] === -1) {
      nextMove.current = [0, false];
      handlePrevCover(fakeEvent);
    }
  }

  const disableTransitionRef = useRef(true);
  const disableTransition = () => {
    disableTransitionRef.current = true;
    setTimeout(() => {
      disableTransitionRef.current = false;
    }, 0);
  };

  const location = useLocation();
  const previousRoute = useRef<string | null>(null);

  useEffect(() => {
    if (
      previousRoute.current &&
      previousRoute.current.startsWith(window.location.origin)
    ) {
      disableTransition();
    }
    previousRoute.current = `${window.location.origin}${location.pathname}`;
  }, [location]);

  const generateRandomDelay = () => Math.random() * 0.3;

  return (
    <div className="fixed w-[100vw] h-[100vh] py-[calc(20px+10vh)] md:py-0">
      <div
        className="cursor-pointer relative w-[100vw] h-[100%] flex items-center justify-center"
        style={{
          backgroundColor: "white",
        }}
        onClick={(event: any) => {
          if (readyToTransition.current) {
            handleNextCover(event);
          } else {
            if (nextMove && !nextMove.current[1]) {
              nextMove.current = [1, true];
            }
          }
        }}
      >
        {currentLayout.map((item, index) => {
          return (
            <React.Fragment key={`layout-${index}`}>
              <AnimatePresence>
                {exitingCover !== null && (
                  <motion.div
                    key={`exiting-${exitingCover}`}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                      delay: generateRandomDelay(),
                    }}
                    style={{
                      zIndex: item.z,
                    }}
                  >
                    <div
                      className="image absolute"
                      style={{
                        aspectRatio: `1/${item.h}`,
                        width: `${item.w}vw`,
                        left: `${item.x}vw`,
                        top: item.top ? `${item.y}vh` : "none",
                        bottom: item.top ? "none" : `${item.y}vh`,
                        backgroundColor: "#cccccc",
                      }}
                    >
                      <img
                        alt=""
                        className="image w-[100%] h-[100%]"
                        style={{ objectFit: "cover" }}
                        src={
                          coversRef.current === null
                            ? ""
                            : coversRef.current[currentCoverRef.current].images[
                                index
                              ]
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {firstPageLoad && (
                <AnimatePresence>
                  {exitingCover === null && (
                    <motion.div
                      key={`current-${currentCoverRef.current}`}
                      initial={
                        disableTransitionRef.current
                          ? { opacity: 1 }
                          : { opacity: 0 }
                      }
                      animate={
                        disableTransitionRef.current
                          ? { opacity: 1 }
                          : { opacity: 1 }
                      }
                      exit={
                        disableTransitionRef.current
                          ? { opacity: 1 }
                          : { opacity: 0 }
                      }
                      transition={
                        disableTransitionRef.current
                          ? { duration: 0 }
                          : {
                              duration: 0.7,
                              ease: "easeInOut",
                              delay: generateRandomDelay(),
                            }
                      }
                      style={{
                        zIndex: item.z,
                      }}
                    >
                      <div
                        className="image absolute"
                        style={{
                          aspectRatio: `1/${item.h}`,
                          width: `${item.w}vw`,
                          left: `${item.x}vw`,
                          top: item.top ? `${item.y}vh` : "none",
                          bottom: item.top ? "none" : `${item.y}vh`,
                        }}
                      >
                        <img
                          alt=""
                          className="image w-[100%] h-[100%]"
                          style={{ objectFit: "cover" }}
                          src={
                            coversRef.current === null
                              ? ""
                              : coversRef.current[currentCoverRef.current]
                                  .images[index]
                          }
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </React.Fragment>
          );
        })}

        {isDisplayed && (
          <div
            style={{ opacity: isVisible ? 1 : 0 }}
            className={`home-text-reveal-wrapper inverted-text klivora text-[calc(20px+9vw)] leading-[calc(20px+9vw)]`}
          >
            <div className="klivora wave-container">
              {coverTitle.map((letter, index) => (
                <span
                  key={index}
                  className={`wave-letter ${
                    isRevealing1[0] === 1
                      ? isRevealing1[1]
                        ? "wave-reveal"
                        : "wave-conceal"
                      : isRevealing1[1]
                      ? "wave-reveal-flip"
                      : "wave-conceal-flip"
                  }`}
                  style={{
                    animationDelay: `${Math.pow(index, 0.65) * 0.025}s`,
                    opacity: letter === "_" ? 0 : 1,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}
        {isDisplayed && (
          <div
            style={{ opacity: isVisible ? 1 : 0 }}
            className={`home-text-reveal-wrapper 
           inverted-text-black klivora text-[calc(20px+9vw)] leading-[calc(20px+9vw)]`}
          >
            <div className="klivora wave-container">
              {coverTitle.map((letter, index) => (
                <span
                  key={index}
                  className={`wave-letter ${
                    isRevealing1[0] === 1
                      ? isRevealing1[1]
                        ? "wave-reveal"
                        : "wave-conceal"
                      : isRevealing1[1]
                      ? "wave-reveal-flip"
                      : "wave-conceal-flip"
                  }`}
                  style={{
                    animationDelay: `${Math.pow(index, 0.75) * 0.02}s`,
                    opacity: letter === "_" ? 0 : 1,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        {isNextDisplayed && (
          <div
            style={{ opacity: isNextVisible ? 1 : 0 }}
            className={`home-text-reveal-wrapper inverted-text klivora text-[calc(20px+9vw)] leading-[calc(20px+9vw)]`}
          >
            <div className="klivora wave-container">
              {nextTitle.map((letter, index) => (
                <span
                  key={index}
                  className={`wave-letter ${
                    isRevealingNext[0] === 1
                      ? isRevealingNext[1]
                        ? "wave-reveal"
                        : "wave-conceal"
                      : isRevealingNext[1]
                      ? "wave-reveal-flip"
                      : "wave-conceal-flip"
                  }`}
                  style={{
                    animationDelay: `${Math.pow(index, 0.65) * 0.025}s`,
                    opacity: letter === "_" ? 0 : 1,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}
        {isNextDisplayed && (
          <div
            style={{ opacity: isNextVisible ? 1 : 0 }}
            className={`home-text-reveal-wrapper inverted-text-black klivora text-[calc(20px+9vw)] leading-[calc(20px+9vw)]`}
          >
            <div className="klivora wave-container">
              {nextTitle.map((letter, index) => (
                <span
                  key={index}
                  className={`wave-letter ${
                    isRevealingNext[0] === 1
                      ? isRevealingNext[1]
                        ? "wave-reveal"
                        : "wave-conceal"
                      : isRevealingNext[1]
                      ? "wave-reveal-flip"
                      : "wave-conceal-flip"
                  }`}
                  style={{
                    animationDelay: `${Math.pow(index, 0.75) * 0.02}s`,
                    opacity: letter === "_" ? 0 : 1,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          className={`inverted-text absolute mt-[calc(35px+10vw)] text-[calc(8px+0.75vw)] ${
            isSubVisible ? "visible" : "hidden"
          }`}
        >
          <div className="wave-container">
            {subTitle.map((letter, index) => (
              <span
                key={index}
                className={`wave-letter ${
                  isRevealing2[0] === 1
                    ? isRevealing2[1]
                      ? "wave-reveal2"
                      : "wave-conceal2"
                    : isRevealing2[1]
                    ? "wave-reveal-flip2"
                    : "wave-conceal-flip2"
                }`}
                style={{
                  opacity: letter === "_" ? 0 : 1,
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
        <div
          className={`inverted-text-black absolute mt-[calc(35px+10vw)] text-[calc(8px+0.75vw)] ${
            isSubVisible ? "visible" : "hidden"
          }`}
        >
          <div className="wave-container">
            {subTitle.map((letter, index) => (
              <span
                key={index}
                className={`wave-letter ${
                  isRevealing2[0] === 1
                    ? isRevealing2[1]
                      ? "wave-reveal2"
                      : "wave-conceal2"
                    : isRevealing2[1]
                    ? "wave-reveal-flip2"
                    : "wave-conceal-flip2"
                }`}
                style={{
                  opacity: letter === "_" ? 0 : 1,
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
