import React, { useEffect, useRef, useState } from "react";
import { GIT_KEYS, Page } from "../../App";
import "./Archives.css";
import Hero from "../../Components/Slider/Hero/Hero";
import useCurrentNavColorState from "../../store/useCurrentNavColorStore";
import useSelectedArchiveGroupStore from "../../store/useSelectedArchiveGroupStore";
import usePreloadedImagesStore from "../../store/usePreloadedImagesStore";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";
import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

type ArchivesPageProps = {
  navigate: (page: Page) => void;
  slideUpComponent: boolean;
};

export type ArchivesEntryImage = {
  title: string;
  index: number;
  url: string;
  aspectRatio?: number;
};

export type ArchivesEntry = {
  bg_color: string;
  id: string;
  index: number;
  title: string;
  description: string;
  description2: string;
  description3: string;
  images: ArchivesEntryImage[];
};

const Archives: React.FC<ArchivesPageProps> = ({
  navigate,
  slideUpComponent,
}) => {
  const [isRevealing1, setIsRevealing1] = useState(true);
  const [dropdown1Display, setDropdown1Display] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [borderRadius, setBorderRadius] = useState("50%");
  const [slideOpen, setSlideOpen] = useState(true);
  const { currentNavColor, setCurrentNavColor } = useCurrentNavColorState();
  const { selectedArchiveGroup, setSelectedArchiveGroup } =
    useSelectedArchiveGroupStore();
  const [imageDisplayOpen, setImageDisplayOpen] = useState<boolean>(false);
  // const closeIconRef = useRef<HTMLDivElement>(null);
  // const playIconRef = useRef<HTMLDivElement>(null);
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const { preloadedImages, setPreloadedImages } = usePreloadedImagesStore();
  const archivesRef = useRef<ArchivesEntry[] | null>(null);

  const [bgColors, setbgColors] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayContainerRef = useRef<HTMLDivElement>(null);
  const displayContainerButtons = useRef<HTMLDivElement>(null);
  // const bgColorRef = useRef("white");
  const [arrowSRC, setArrowSRC] = useState<string>("");
  const [arrowBlackSRC, setArrowBlackSRC] = useState<string>("");

  const archivesRootDiv = useRef<HTMLDivElement | null>(null);
  const [removeContainer, setRemoveContainer] = useState<boolean>(false);
  const [currentHeroImg, setCurrentHeroImg] = useState<number>(0);
  const [revealGallery, setRevealGallery] = useState<boolean>(false);
  const container2ImageDiv = useRef<HTMLDivElement | null>(null);
  const [galleryButtonHover, setGalleryButtonHover] = useState<number>(0);
  const [startingShowGallery, setStartingShowGallery] =
    useState<boolean>(false);
  const [hideArrowButton, setHideArrowButton] = useState<boolean>(false);
  const cardTitleRef1 = useRef<(HTMLDivElement | null)[]>([]);
  const cardBorderRef1 = useRef<(HTMLDivElement | null)[]>([]);
  const cardSubTitleRef1 = useRef<(HTMLDivElement | null)[]>([]);
  const [showTitleText, setShowTitleText] = useState<boolean>(true);
  const [finalTitleTouch, setFinalTitleTouch] = useState<boolean>(false);
  const [switchPage, setSwitchPage] = useState<boolean>(false);
  const [showArchivesNavBar, setShowArchivesNavBar] = useState<boolean>(false);
  const archivesNavBar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const project = projectAssets as any;
    if (project !== null && project["Archives"]) {
      const archivesOutput = project["Archives"].children as ArchivesEntry[];
      archivesRef.current = archivesOutput;
      console.log(archivesOutput)
      const newbgColors = archivesOutput.map((item) =>
        validateColor(item.bg_color)
      );
      setbgColors(newbgColors);
      // bgColorRef.current = validateColor(newbgColors[0]);
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = validateColor(
          newbgColors[0]
        );
      }

      setArrowSRC(
        `https://raw.githubusercontent.com/${GIT_KEYS.owner}/${GIT_KEYS.repo}/refs/heads/${GIT_KEYS.branch}/constants/arrow1.png`
      );
      setArrowBlackSRC(
        `https://raw.githubusercontent.com/${GIT_KEYS.owner}/${GIT_KEYS.repo}/refs/heads/${GIT_KEYS.branch}/constants/arrow1-black.png`
      );
    }
  }, [projectAssets]);

  useEffect(() => {
    setTimeout(() => {
      if (!slideUpComponent) {
        setSlideOpen(false);
      }
      if (archivesRootDiv.current) {
        archivesRootDiv.current.style.overflow = "";
      }
    }, 1000);

    setIsRevealing1(true);
    setIsVisible(true);
    setDropdown1Display(true);
    setTimeout(() => {
      setCurrentNavColor("white");
    }, 2000);
  }, []);

  useEffect(() => {
    if (archivesRootDiv.current) {
      archivesRootDiv.current.style.overflow = "hidden";
    }
  }, [archivesRootDiv]);

  const smoothScrollTo = (targetPosition: number, duration: number) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function animateScroll(currentTime: number) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Limit progress to 1
      const ease = easeInOutQuad(progress); // Apply easing function

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    function easeInOutQuad(t: any) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    requestAnimationFrame(animateScroll);
  };

  const handleArchiveGroupClick = (index: number) => {
    document.body.style.overflow = "hidden"
    if (containerRef.current && archivesRef.current) {
      setStartingShowGallery(true);
      smoothScrollTo(
        ((containerRef.current.clientHeight - window.innerHeight) /
          (Object.keys(archivesRef.current).length - 1)) *
          index,
        1000
      );

      setTimeout(() => {
        handleOpenArchive(index);
      }, 500);
    }
  };

  const finalTitle = useRef<HTMLDivElement>(null);

  const handleOpenArchive = (index: number) => {
    setSelectedArchiveGroup(index);

    setTimeout(() => {
      setRemoveContainer(true);
      setHideArrowButton(true);
      setTimeout(() => {
        setImageDisplayOpen(true);
        setCurrentNavColor("black");

        setTimeout(
          () => {
            setShowTitleText(false);
          },
          window.innerWidth <= 1048 ? 1000 : 500
        );

        setTimeout(
          () => {
            if (container2ImageDiv.current) {
              container2ImageDiv.current.style.transition = "none";
            }
            setRevealGallery(true);
            setTimeout(() => {
              setFinalTitleTouch(true);
              document.body.style.overflow = ""
              setTimeout(() => {
                if (finalTitle.current) {
                  finalTitle.current.style.transition = "none";
                }
              }, 700);
            }, 500);
          },
          window.innerWidth <= 1048 ? 1600 : 1000
        );
      }, 200);
    }, 1000);
  };

  // const handleCloseArchiveGroup = () => {
  //   setImageDisplayOpen(false);

  //   setTimeout(() => {
  //     setSelectedArchiveGroup(null);
  //     if (closeIconRef.current && playIconRef.current) {
  //       closeIconRef.current.style.opacity = "0";
  //       playIconRef.current.style.opacity = "0";
  //     }
  //   }, 1000);
  // };

  function validateColor(input: string) {
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = bgColors[0];
    }
    if (cardTitleRef1.current) {
      cardTitleRef1.current.forEach((ref) => {
        if (ref) ref.style.color = bgColors[0];
      });
    }
    if (cardSubTitleRef1.current) {
      cardSubTitleRef1.current.forEach((ref) => {
        if (ref) ref.style.color = bgColors[0];
      });
    }
    if (cardBorderRef1.current) {
      cardBorderRef1.current.forEach((ref) => {
        if (ref) ref.style.border = `3px solid ${bgColors[0]}`;
      });
    }
  }, [bgColors]);

  useEffect(() => {
    const handleScroll = () => {
      if (finalTitleTouch && !showArchivesNavBar) {
        setShowArchivesNavBar(true);
      }
      if (!containerRef.current) return;

      const scrollTop = window.scrollY;
      const screenHeight = window.innerHeight;
      const gapHeight = screenHeight * 0.2; // 20vh gap

      // Effective height of each "page" including the gap
      const totalPageHeight = screenHeight + gapHeight;

      // Get the index of the page currently in view
      const currentPage = Math.floor(scrollTop / totalPageHeight);
      const nextPage = currentPage + 1;

      const progress =
        (scrollTop - currentPage * totalPageHeight) / screenHeight;

      // Calculate interpolated color between the current and the next page
      const currentColor =
        bgColors[currentPage] || bgColors[bgColors.length - 1];
      const nextColor = bgColors[nextPage] || bgColors[bgColors.length - 1];
      const interpolatedColor = interpolateColor(
        currentColor,
        nextColor,
        Math.max(0, Math.min(1, progress)) // Clamp progress between 0 and 1
      );

      // Apply the background color
      // bgColorRef.current = interpolatedColor;
      containerRef.current.style.backgroundColor = interpolatedColor;
      if (cardTitleRef1.current) {
        cardTitleRef1.current.forEach((ref) => {
          if (ref) ref.style.color = interpolatedColor;
        });
      }
      if (cardSubTitleRef1.current) {
        cardSubTitleRef1.current.forEach((ref) => {
          if (ref) ref.style.color = interpolatedColor;
        });
      }
      if (cardBorderRef1.current) {
        cardBorderRef1.current.forEach((ref) => {
          if (ref) ref.style.border = `3px solid ${interpolatedColor}`;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bgColors]);

  const interpolateColor = (color1: string, color2: string, factor: number) => {
    const [r1, g1, b1] = parseColor(color1);
    const [r2, g2, b2] = parseColor(color2);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const parseColor = (color: string): [number, number, number] => {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas context");

    ctx.fillStyle = color; // Set the color
    const computedColor = ctx.fillStyle; // Get the computed color (browser-standardized)

    // Convert to `rgb(r, g, b)` format if it's in hex
    if (computedColor.startsWith("#")) {
      const bigint = parseInt(computedColor.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    }

    // Match RGB components from `rgb()` format
    const rgb = computedColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) {
      throw new Error(`Invalid color format: ${computedColor}`);
    }

    return [parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10)];
  };

  // const extractImgColor = (imgName: string) => {
  //   if (imgName.split("--").length > 1) {
  //     const color = imgName.split("--").pop() || "white";
  //     if (isColor(color)) {
  //       return validateColor(color);
  //     }
  //   }
  //   return "#FFFFFF";
  // };

  const handleGalleryButtonClick = (direction: number) => {
    setSwitchPage(true);

    setTimeout(() => {
      if (archivesRef.current && selectedArchiveGroup !== null) {
        const nextIndex =
          direction === 1
            ? selectedArchiveGroup === archivesRef.current.length - 1
              ? 0
              : selectedArchiveGroup + 1
            : selectedArchiveGroup === 0
            ? archivesRef.current.length - 1
            : selectedArchiveGroup - 1;
        if (nextIndex <= archivesRef.current.length - 1) {
          setCurrentHeroImg(0);
          setSelectedArchiveGroup(nextIndex);
        }
      }
    }, 800);

    setTimeout(() => {
      setSwitchPage(false);
    }, 1100);
  };

  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleImageClick = (url: any) => {
    setFullscreenImage(url);
    if (archivesNavBar.current) {
      archivesNavBar.current.style.transition = "none";
      setShowArchivesNavBar(true);
    }
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div ref={archivesRootDiv} className="w-[100%] h-[100vh]">
      {revealGallery && (
        <div
          className="z-[201] absolute top-0 left-0 w-[100vw] h-[100vh]"
          style={{
            pointerEvents: "none",
            opacity: switchPage ? 1 : 0,
            transition: "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
            backgroundColor: "white",
          }}
        ></div>
      )}

      {revealGallery && (
        <div
          ref={archivesNavBar}
          className="z-[201] absolute top-0 left-0 w-[100vw] h-[58px] md:h-[76px] lg:h-[80px] "
          style={{
            pointerEvents: "none",
            // opacity: showArchivesNavBar ? 1 : 0,
            transform: showArchivesNavBar
              ? "translateY(0)"
              : "translateY(-80px)",
            transition:
              "transform 1s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
            backgroundColor: "white",
          }}
        ></div>
      )}

      <div
        className={`select-none absolute z-[300] flex w-[100vw] h-[100vh] items-center justify-center pl-[20px]`}
        style={{
          backgroundColor: "white",
          transition: "transform 1.6s cubic-bezier(0.5, 0, 0.1, 1)",
          transform: slideOpen ? "translateY(0%)" : "translateY(-100%)",
        }}
      >
        {!slideUpComponent && (
          <div
            className="w-[100%] flex"
            style={{ backgroundColor: "transparent" }}
          >
            <div
              className={`text-reveal-wrapper
              ${dropdown1Display ? "flex" : "hidden"}
              ${isVisible ? "visible" : ""}`}
            >
              <div
                className={`klivora ${
                  isRevealing1 ? "text-reveal" : "text-conceal"
                } text-[42px] tracking-[1px] leading-[29px] dimmer`}
              >
                ARCHIVES
              </div>
            </div>
          </div>
        )}
      </div>

      {imageDisplayOpen &&
        selectedArchiveGroup !== null &&
        archivesRef.current && (
          <div
            style={{
              opacity: revealGallery ? "1" : "0",
              transition: "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
            }}
            //     className="absolute right-0 h-[100%]
            // w-[calc(100vw-(100px+50vw+(20px+1vw)))] md:w-[calc(100vw-(300px+25vw+(20px+2vw)))] lg:w-[calc(100vw-(80px+29vw+(10px+7vw)))]"
            className="z-[200] absolute right-0 h-[100%]
              w-[100%] lg:w-[calc(100vw-(80px+29vw+(10px+7vw)))] pt-[calc(20px+0.5vw)]"
          >
            <Box
              className="w-[100%] h-[100%] p-[calc(30px+2vw)]"
              sx={{ overflowY: "scroll" }}
              onScroll={() => {
                if (finalTitleTouch && !showArchivesNavBar) {
                  setShowArchivesNavBar(true);
                }
              }}
            >
              <div>
                {fullscreenImage && (
                  <div
                    onClick={handleCloseFullscreen}
                    style={{
                      paddingTop: "90px",
                      paddingBottom: "10px",
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      backgroundColor: "rgba(256, 256, 256, 0.9)",
                      zIndex: 1000,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={fullscreenImage}
                      alt="Fullscreen"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        transition: "transform 0.3s ease-in-out",
                        transform: fullscreenImage ? "scale(1)" : "scale(0)",
                      }}
                    />
                  </div>
                )}
                <ImageList variant="masonry" cols={3} gap={22}>
                  {archivesRef.current?.[selectedArchiveGroup]?.images
                    ?.filter(
                      (item) =>
                        item.url !==
                        archivesRef.current?.[selectedArchiveGroup]?.images?.[
                          currentHeroImg
                        ]?.url
                    )
                    .map((item) => (
                      <ImageListItem
                        key={item.url}
                        sx={{ overflow: "hidden", position: "relative" }}
                        onClick={() => handleImageClick(item.url)}
                      >
                        <div
                          className="image-scale"
                          style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <img
                            className="select-none cursor-pointer"
                            srcSet={`${item.url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                            src={`${item.url}?w=248&fit=crop&auto=format`}
                            alt={item.title}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease-in-out",
                            }}
                            onLoad={(e: any) => {
                              const img = e.target;
                              const naturalWidth = img.naturalWidth;
                              const naturalHeight = img.naturalHeight;

                              // Set the aspect ratio dynamically
                              item.aspectRatio = naturalWidth / naturalHeight;
                            }}
                          />
                        </div>
                      </ImageListItem>
                    ))}
                </ImageList>
              </div>

              <div className="lg:hidden w-[100%] h-[auto] mt-[140px] relative flex items-center justify-center sm:flex-row flex-col">
                <div className="sm:w-[50%] w-[100%] ">
                  <div className="flex justify-center items-center flex-col">
                    <div
                      className="mollie text-[25px] mb-[7px]"
                      style={{ color: "black" }}
                    >
                      Next Up
                    </div>
                    <div
                      className={`mb-[29px] text-center
                      sm:max-w-[80%] max-w-[calc(100%-10vw-104px-20px)] h-[auto]
                    kayonest leading-[calc(30px+5vw)] text-[calc(12px+4vw)]`}
                      style={{
                        color: "black",
                        wordBreak: "break-word",
                      }}
                    >
                      {archivesRef.current[
                        selectedArchiveGroup === archivesRef.current.length - 1
                          ? 0
                          : selectedArchiveGroup + 1
                      ].title.replaceAll("_", " ")}
                    </div>
                  </div>

                  <div className="w-[100%] h-[50px] flex absolute sm:mt-0 mt-[-80px] sm:relative">
                    <div
                      style={{
                        borderRadius: "30px",
                      }}
                      className="absolute z-[110] left-0 sm:left-[30px] w-[calc(52px+5vw)] flex items-center justify-center"
                    >
                      <div
                        onMouseEnter={() => setGalleryButtonHover(-1)}
                        onMouseLeave={() => setGalleryButtonHover(0)}
                        onClick={() => handleGalleryButtonClick(-1)}
                        className="border border-black w-[100%] flex items-center justify-center cursor-pointer"
                        style={{
                          borderRadius: "30px",
                          height: "42px",
                          transform: "rotate(180deg)",
                          transition:
                            "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                        }}
                      >
                        <img
                          className="w-[40%] select-none"
                          src={arrowBlackSRC}
                          alt="arrow"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: "30px",
                      }}
                      className="absolute z-[110] right-0 sm:right-[30px] w-[calc(52px+5vw)] flex items-center justify-center"
                    >
                      <div
                        onMouseEnter={() => setGalleryButtonHover(1)}
                        onMouseLeave={() => setGalleryButtonHover(0)}
                        onClick={() => handleGalleryButtonClick(1)}
                        className="border border-black w-[100%] flex items-center justify-center cursor-pointer"
                        style={{
                          borderRadius: "30px",
                          height: "42px",
                          transition:
                            "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                        }}
                      >
                        <img
                          className="w-[40%] select-none"
                          src={arrowBlackSRC}
                          alt="arrow"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="image-scale sm:w-[50%] w-[100%] h-[250px] flex justify-center relative ">
                  <img
                    onClick={() => handleGalleryButtonClick(1)}
                    alt=""
                    style={{ objectFit: "cover" }}
                    className="cursor-pointer h-[100%] w-[100%]"
                    src={
                      archivesRef.current &&
                      archivesRef.current[
                        selectedArchiveGroup === archivesRef.current.length - 1
                          ? 0
                          : selectedArchiveGroup + 1
                      ] &&
                      archivesRef.current[
                        selectedArchiveGroup === archivesRef.current.length - 1
                          ? 0
                          : selectedArchiveGroup + 1
                      ].images &&
                      archivesRef.current[
                        selectedArchiveGroup === archivesRef.current.length - 1
                          ? 0
                          : selectedArchiveGroup + 1
                      ].images[currentHeroImg] &&
                      archivesRef.current[
                        selectedArchiveGroup === archivesRef.current.length - 1
                          ? 0
                          : selectedArchiveGroup + 1
                      ].images[currentHeroImg].url
                        ? archivesRef.current[
                            selectedArchiveGroup ===
                            archivesRef.current.length - 1
                              ? 0
                              : selectedArchiveGroup + 1
                          ].images[currentHeroImg].url
                        : "https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/fallback.jpeg?w=248&fit=crop&auto=format&dpr=2"
                    }
                  />
                </div>
              </div>
            </Box>
          </div>
        )}

      {!removeContainer && (
        <div ref={containerRef}>
          {archivesRef.current !== null &&
            archivesRef.current.map((item, index) => (
              <div
                key={index}
                style={{ marginBottom: "20vh" }}
                className="cursor-pointer relative w-[100%] h-[100vh] flex items-center justify-center"
                onClick={() => {
                  handleArchiveGroupClick(index);
                }}
              >
                <div
                  style={{ border: "1px solid white" }}
                  className="absolute left-0 top-[0] w-[calc(100vw-(51vw+120px))] md:w-[calc(100vw-(27vw+320px))] lg:w-[calc(100vw-(36vw+90px))] h-[100vh] z-[106]"
                >
                  <div className="w-[100%] h-[100%] relative select-none pl-[calc(20px+2.5vw)] items-center flex">
                    <div
                      className="relative flex lg:w-[100%] w-[600%] pr-[calc(20px+1vw)] lg:pr-[calc(10px+0.5vw)] pl-[calc(20px+1vw)] lg:pl-[calc(10px+0.5vw)] 
                      h-[auto] py-[calc((18px+0.5vw)+30px+1.8vw+28px)]
                      flex-col
                      bg-white lg:bg-inherit"
                      style={{
                        border: "1px solid white",
                        color: "white",
                        fontWeight: "700",
                      }}
                    >
                      <div
                        ref={(el) => (cardBorderRef1.current[index] = el)}
                        style={{ border: `3px solid ${bgColors[index]}` }}
                        className="lg:hidden z-[108] w-[calc(100%-10px)] h-[calc(100%-10px)] absolute top-[5px] left-[5px]"
                      ></div>

                      <div
                        className={`min-w-[40vw] z-[109] kayonest w-full break-words whitespace-normal overflow-visible leading-[calc((clamp(1rem,10vw+20px,10vw+20px)))]`}
                        style={{
                          fontSize: "clamp(1rem, 10vw + 20px, 10vw + 20px)",
                          maxWidth: "100%",
                        }}
                      >
                        <div className="hidden lg:flex">
                          {item.title.replaceAll("_", " ")}
                        </div>
                        <div
                          ref={(el) => (cardTitleRef1.current[index] = el)}
                          className="flex lg:hidden"
                          style={{ color: bgColors[index] }}
                        >
                          {item.title.replaceAll("_", " ")}
                        </div>
                      </div>

                      <div
                        style={{
                          color: "white",
                        }}
                        className="z-[109] px-[calc(10px+0.3vw)] absolute bottom-[calc(18px+0.5vw)] text-[calc(8px+0.3vw)] leading-[calc(10px+0.6vw)] "
                      >
                        <div className="hidden lg:flex flex-col">
                          {archivesRef.current !== null && (
                            <p>{archivesRef.current[index].description}</p>
                          )}

                          {archivesRef.current !== null && (
                            <p className="ml-[100px]">
                              {archivesRef.current[index].description2}
                            </p>
                          )}
                          {archivesRef.current !== null && (
                            <p>{archivesRef.current[index].description3}</p>
                          )}
                        </div>
                        <div
                          ref={(el) => (cardSubTitleRef1.current[index] = el)}
                          className="flex lg:hidden flex-col"
                          style={{ color: bgColors[index] }}
                        >
                          {archivesRef.current !== null && (
                            <p>{archivesRef.current[index].description}</p>
                          )}

                          {archivesRef.current !== null && (
                            <p className="ml-[100px]">
                              {archivesRef.current[index].description2}
                            </p>
                          )}
                          {archivesRef.current !== null && (
                            <p>{archivesRef.current[index].description3}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => setBorderRadius("30px")}
                      onMouseLeave={() => setBorderRadius("50%")}
                      className="absolute right-0 top-[75vh] mr-[-22px] w-[calc(70px+5vw)] h-[calc(70px+5vw)] flex items-center justify-center"
                    >
                      <div
                        className="w-[100%] flex items-center justify-center cursor-pointer"
                        style={{
                          border: "1px solid white",
                          borderRadius: borderRadius,
                          height:
                            borderRadius === "50%"
                              ? "calc(70px + 5vw)"
                              : "50px",
                          transition:
                            "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                        }}
                      >
                        <img
                          className="w-[45%] select-none"
                          src={arrowSRC}
                          alt="arrow"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute select-none top-0 right-0 w-[calc(100px+50vw+(20px+1vw))] md:w-[calc(300px+25vw+(20px+2vw))] lg:w-[calc(80px+29vw+(10px+7vw))] h-[100vh] overflow-hidden z-[105] flex items-center">
                  <div
                    style={{
                      transition: startingShowGallery
                        ? "1s cubic-bezier(0.645, 0.045, 0.355, 1)"
                        : "none",
                    }}
                    className={`${
                      selectedArchiveGroup !== null
                        ? "w-[100%] h-[100%]"
                        : "w-[calc(100px+50vw)] md:w-[calc(300px+25vw)] lg:w-[calc(80px+29vw)] h-[calc((100px+50vw)*1.4)] md:h-[calc((300px+25vw)*1.4)] lg:h-[calc((80px+29vw)*1.4)]"
                    }`}
                  >
                    <Hero
                      setCurrentHeroImgUrl={(index: number) => {
                        setCurrentHeroImg(index);
                      }}
                      images={
                        archivesRef.current === null
                          ? []
                          : archivesRef.current[index].images
                      }
                      haltSlider={startingShowGallery === true}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {archivesRef.current !== null && selectedArchiveGroup !== null && (
        <>
          <div
            style={{
              backgroundColor:
                archivesRef.current[selectedArchiveGroup].bg_color,
            }}
            className="relative w-[100%] h-[100vh] flex items-center justify-center"
          >
            <div
              style={{
                transition: "1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                border: "1px solid white",
                opacity: revealGallery ? 0 : 1,
                display: revealGallery ? "none" : "all",
              }}
              className="absolute z-[110] left-0 top-[0] w-[calc(100vw-(51vw+120px))] md:w-[calc(100vw-(27vw+320px))] lg:w-[calc(100vw-(36vw+90px))] h-[100vh]"
            >
              <div className="w-[100%] h-[100%] relative select-none pl-[calc(20px+2.5vw)] flex items-center">
                <div
                  className="relative flex justify-center lg:w-[100%] w-[600%] pr-[calc(20px+1vw)] lg:pr-[calc(10px+0.5vw)]  pl-[calc(20px+1vw)] lg:pl-[calc(10px+0.5vw)] 
                      h-[auto] py-[calc((18px+0.5vw)+30px+1.8vw+28px)]
                      flex-col
                      bg-white lg:bg-inherit"
                  style={{
                    border: "1px solid white",
                    transition:
                      "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                    color: "white",
                    fontWeight: "700",
                    opacity: hideArrowButton ? "0" : "1",
                  }}
                >
                  <div
                    style={{
                      border: `3px solid ${bgColors[selectedArchiveGroup]}`,
                    }}
                    className="lg:hidden z-[108] w-[calc(100%-10px)] h-[calc(100%-10px)] absolute top-[5px] left-[5px]"
                  ></div>

                  <div
                    className={`min-w-[40vw] z-[109] kayonest w-full break-words whitespace-normal overflow-visible leading-[calc((clamp(1rem,10vw+20px,10vw+20px)))]`}
                    style={{
                      fontSize: "clamp(1rem, 10vw + 20px, 10vw + 20px)",
                      maxWidth: "100%",
                    }}
                  >
                    <div className="hidden lg:flex">
                      {archivesRef.current[
                        selectedArchiveGroup
                      ].title.replaceAll("_", " ")}
                    </div>
                    <div
                      className="flex lg:hidden"
                      style={{ color: bgColors[selectedArchiveGroup] }}
                    >
                      {archivesRef.current[
                        selectedArchiveGroup
                      ].title.replaceAll("_", " ")}
                    </div>
                  </div>

                  <div
                    style={{
                      color: "white",
                    }}
                    className="z-[109] px-[calc(10px+0.3vw)] absolute bottom-[calc(18px+0.5vw)] text-[calc(8px+0.3vw)] leading-[calc(10px+0.6vw)] "
                  >
                    <div className="hidden lg:flex flex-col">
                      {archivesRef.current !== null && (
                        <p>
                          {
                            archivesRef.current[selectedArchiveGroup]
                              .description
                          }
                        </p>
                      )}

                      {archivesRef.current !== null && (
                        <p className="ml-[100px]">
                          {
                            archivesRef.current[selectedArchiveGroup]
                              .description2
                          }
                        </p>
                      )}
                      {archivesRef.current !== null && (
                        <p>
                          {
                            archivesRef.current[selectedArchiveGroup]
                              .description3
                          }
                        </p>
                      )}
                    </div>
                    <div
                      className="flex lg:hidden flex-col"
                      style={{ color: bgColors[selectedArchiveGroup] }}
                    >
                      {archivesRef.current !== null && (
                        <p>
                          {
                            archivesRef.current[selectedArchiveGroup]
                              .description
                          }
                        </p>
                      )}

                      {archivesRef.current !== null && (
                        <p className="ml-[100px]">
                          {
                            archivesRef.current[selectedArchiveGroup]
                              .description2
                          }
                        </p>
                      )}
                      {archivesRef.current !== null && (
                        <p>
                          {
                            archivesRef.current[selectedArchiveGroup]
                              .description3
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {startingShowGallery && (
              <div
                style={{ pointerEvents: "none" }}
                className="absolute z-[113] left-[2px] top-[0] w-[calc(100vw-(51vw+120px))] md:w-[calc(100vw-(27vw+320px))] lg:w-[calc(100vw-(36vw+90px))] h-[100vh]"
              >
                <div className="w-[100%] h-[100%] relative select-none pl-[calc(20px+2.5vw)] flex items-center">
                  <div
                    className={`${finalTitleTouch ? "lg:flex hidden" : ""}   ${
                      !showTitleText ? "lg:opacity-100 opacity-0" : ""
                    } relative flex justify-center lg:w-[100%] w-[600%] pr-[calc(20px+1vw)] lg:pr-[calc(10px+0.5vw)]  pl-[calc(20px+1vw)] lg:pl-[calc(10px+0.5vw)] 
                      h-[auto] py-[calc((18px+0.5vw)+30px+1.8vw+28px)]
                      flex-col
                      bg-red`}
                    style={{
                      transition:
                        "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                      color: "white",
                      fontWeight: "700",
                    }}
                  >
                    <div
                      ref={finalTitle}
                      className={`
                      max-w-[calc(80px+29vw+(10px+7vw)-2px-(30px+3vw))] h-[auto]
                      z-[109] kayonest leading-[calc((clamp(1rem,10vw+20px,10vw+20px)))]`}
                      style={{
                        fontSize: revealGallery
                          ? "calc(6vw + 30px)"
                          : "clamp(1rem, 10vw + 20px, 10vw + 20px)",
                        transition: "font-size 1s ease-in-out",
                        wordBreak: finalTitleTouch ? "break-word" : "normal",
                      }}
                    >
                      <div className="hidden lg:flex">
                        {archivesRef.current[
                          selectedArchiveGroup
                        ].title.replaceAll("_", " ")}
                      </div>
                      <div
                        className="flex lg:hidden"
                        style={{ color: bgColors[selectedArchiveGroup] }}
                      >
                        {archivesRef.current[
                          selectedArchiveGroup
                        ].title.replaceAll("_", " ")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {startingShowGallery && (
              <div
                style={{
                  pointerEvents: "none",
                  backgroundColor:
                    hideArrowButton &&
                    window.innerWidth <= 1024 &&
                    !revealGallery
                      ? "white"
                      : "transparent",
                  // opacity: revealGallery ? 1 : 0,
                  transition:
                    "background-color 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                }}
                className={`${
                  revealGallery ? "lg:flex hidden" : "flex"
                } w-[calc(100vw-(51vw+120px))] md:w-[calc(100vw-(27vw+320px))] lg:w-[calc(100vw-(36vw+90px))] z-[112] h-[100%] absolute left-0 top-0 select-none pl-[calc(30px+3vw)] items-center`}
              >
                <div
                  style={{
                    opacity: hideArrowButton ? "0" : "1",
                    transition: "1s ease",
                  }}
                  onMouseEnter={() => setBorderRadius("30px")}
                  onMouseLeave={() => setBorderRadius("50%")}
                  className=" mt-[1px] absolute right-[1px] top-[75vh] mr-[-22px] w-[calc(70px+5vw)] h-[calc(70px+5vw)] flex items-center justify-center"
                >
                  <div
                    className="w-[100%] flex items-center justify-center cursor-pointer"
                    style={{
                      border: "1px solid white",
                      borderRadius: borderRadius,
                      height:
                        borderRadius === "50%" ? "calc(70px + 5vw)" : "50px",
                      transition:
                        "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                    }}
                  >
                    <img
                      className="w-[45%] select-none"
                      src={arrowSRC}
                      alt="arrow"
                    />
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                transition: "width 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                backgroundColor: "white",
              }}
              className={`lg:z-[111] z-[109] absolute right-0 h-[100%] top-0 ${
                imageDisplayOpen
                  ? "w-[100%]"
                  : "w-[calc(100px+50vw+(20px+1vw))] md:w-[calc(300px+25vw+(20px+2vw))] lg:w-[calc(80px+29vw+(10px+7vw))]"
              } h-[100%]`}
            >
              <div
                ref={container2ImageDiv}
                style={{
                  transition: "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                }}
                className={`absolute top-0 left-0 select-none
                w-[calc(100px+50vw+(20px+1vw))] md:w-[calc(300px+25vw+(20px+2vw))] lg:w-[calc(80px+29vw+(10px+7vw))]
              h-[100vh]  ${
                hideArrowButton ? "opacity-0 lg:opacity-100" : "opacity-100"
              }
               ${revealGallery ? "lg:flex hidden" : "flex"} items-center`}
              >
                <div
                  style={{
                    transition: "1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                  }}
                  className="relative w-[100%] h-[100%]"
                >
                  <img
                    alt=""
                    style={{ objectFit: "cover" }}
                    className="h-[100%] w-[100%]"
                    src={
                      archivesRef.current &&
                      archivesRef.current[selectedArchiveGroup] &&
                      archivesRef.current[selectedArchiveGroup].images &&
                      archivesRef.current[selectedArchiveGroup].images[
                        currentHeroImg
                      ] &&
                      archivesRef.current[selectedArchiveGroup].images[
                        currentHeroImg
                      ].url
                        ? archivesRef.current[selectedArchiveGroup].images[
                            currentHeroImg
                          ].url
                        : "https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/fallback.jpeg?w=248&fit=crop&auto=format&dpr=2"
                    }
                  />

                  {imageDisplayOpen && (
                    <div
                      style={{
                        opacity: revealGallery ? 1 : 0,
                        transition:
                          "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                        borderRadius: "30px",
                      }}
                      className="absolute z-[110] bottom-[28px] left-[50px] w-[calc(52px+5vw)] flex items-center justify-center"
                    >
                      <div
                        onMouseEnter={() => setGalleryButtonHover(-1)}
                        onMouseLeave={() => setGalleryButtonHover(0)}
                        onClick={() => handleGalleryButtonClick(-1)}
                        className="w-[100%] flex items-center justify-center cursor-pointer"
                        style={{
                          border: "0.5px solid white",
                          borderRadius: "30px",
                          height: "42px",
                          transform: "rotate(180deg)",
                          transition:
                            "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                        }}
                      >
                        <img
                          className="w-[40%] select-none"
                          src={arrowSRC}
                          alt="arrow"
                        />
                      </div>
                    </div>
                  )}

                  {imageDisplayOpen && (
                    <div
                      style={{
                        opacity: revealGallery ? 1 : 0,
                        transition:
                          "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                        borderRadius: "30px",
                      }}
                      className="absolute z-[110] bottom-[28px] right-[50px] w-[calc(52px+5vw)] flex items-center justify-center"
                    >
                      <div
                        onMouseEnter={() => setGalleryButtonHover(1)}
                        onMouseLeave={() => setGalleryButtonHover(0)}
                        onClick={() => handleGalleryButtonClick(1)}
                        className="w-[100%] flex items-center justify-center cursor-pointer"
                        style={{
                          border: "0.5px solid white",
                          borderRadius: "30px",
                          height: "42px",
                          transition:
                            "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                        }}
                      >
                        <img
                          className="w-[40%] select-none"
                          src={arrowSRC}
                          alt="arrow"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* {imageDisplayOpen && (
                <div
                  style={{
                    opacity: revealGallery ? "1" : "0",
                    transition:
                      "opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
                  }}
                  //     className="absolute right-0 h-[100%]
                  // w-[calc(100vw-(100px+50vw+(20px+1vw)))] md:w-[calc(100vw-(300px+25vw+(20px+2vw)))] lg:w-[calc(100vw-(80px+29vw+(10px+7vw)))]"
                  className="absolute right-0 h-[100%]
              w-[100%] lg:w-[calc(100vw-(80px+29vw+(10px+7vw)))] pt-[calc(20px+0.5vw)]"
                >
                  <Box
                    className="w-[100%] h-[100%] p-[calc(30px+2vw)]"
                    sx={{ overflowY: "scroll" }}
                    onScroll={() => {
                      if (finalTitleTouch && !showArchivesNavBar) {
                        setShowArchivesNavBar(true);
                      }
                    }}
                  >
                    <ImageList variant="masonry" cols={3} gap={22}>
                      {archivesRef.current?.[selectedArchiveGroup]?.images
                        ?.filter(
                          (item) =>
                            item.url !==
                            archivesRef.current?.[selectedArchiveGroup]
                              ?.images?.[currentHeroImg]?.url
                        )
                        .map((item) => (
                          <ImageListItem key={item.url}>
                            <img
                              className="cursor-pointer"
                              srcSet={`${item.url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                              src={`${item.url}?w=248&fit=crop&auto=format`}
                              alt={item.title}
                              loading="lazy"
                            />
                          </ImageListItem>
                        ))}
                    </ImageList>

                    <div className="lg:hidden w-[100%] h-[auto] mt-[140px] relative flex items-center justify-center sm:flex-row flex-col">
                      <div className="sm:w-[50%] w-[100%] ">
                        <div className="flex justify-center items-center flex-col">
                          <div
                            className="mollie text-[25px] mb-[7px]"
                            style={{ color: "black" }}
                          >
                            Next Up
                          </div>
                          <div
                            className={`mb-[29px] text-center
                      sm:max-w-[80%] max-w-[calc(100%-10vw-104px-20px)] h-[auto]
                    kayonest leading-[calc(30px+5vw)] text-[calc(30px+5vw)]`}
                            style={{
                              color: "black",
                              wordBreak: "break-word",
                            }}
                          >
                            {archivesRef.current[
                              selectedArchiveGroup ===
                              archivesRef.current.length - 1
                                ? 0
                                : selectedArchiveGroup + 1
                            ].title.replaceAll("_", " ")}
                          </div>
                        </div>

                        <div className="w-[100%] h-[50px] flex absolute sm:mt-0 mt-[-80px] sm:relative">
                          <div
                            style={{
                              borderRadius: "30px",
                            }}
                            className="absolute z-[110] left-0 sm:left-[30px] w-[calc(52px+5vw)] flex items-center justify-center"
                          >
                            <div
                              onMouseEnter={() => setGalleryButtonHover(-1)}
                              onMouseLeave={() => setGalleryButtonHover(0)}
                              onClick={() => handleGalleryButtonClick(-1)}
                              className="border border-black w-[100%] flex items-center justify-center cursor-pointer"
                              style={{
                                borderRadius: "30px",
                                height: "42px",
                                transform: "rotate(180deg)",
                                transition:
                                  "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                              }}
                            >
                              <img
                                className="w-[40%] select-none"
                                src={arrowBlackSRC}
                                alt="arrow"
                              />
                            </div>
                          </div>

                          <div
                            style={{
                              borderRadius: "30px",
                            }}
                            className="absolute z-[110] right-0 sm:right-[30px] w-[calc(52px+5vw)] flex items-center justify-center"
                          >
                            <div
                              onMouseEnter={() => setGalleryButtonHover(1)}
                              onMouseLeave={() => setGalleryButtonHover(0)}
                              onClick={() => handleGalleryButtonClick(1)}
                              className="border border-black w-[100%] flex items-center justify-center cursor-pointer"
                              style={{
                                borderRadius: "30px",
                                height: "42px",
                                transition:
                                  "border-radius 0.2s cubic-bezier(0.15, 0.55, 0.2, 1), height 0.2s cubic-bezier(0.15, 0.55, 0.2, 1)",
                              }}
                            >
                              <img
                                className="w-[40%] select-none"
                                src={arrowBlackSRC}
                                alt="arrow"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sm:w-[50%] w-[100%] h-[250px] flex justify-center relative ">
                        <img
                          onClick={() => handleGalleryButtonClick(1)}
                          alt=""
                          style={{ objectFit: "cover" }}
                          className="cursor-pointer h-[100%] w-[100%]"
                          src={
                            archivesRef.current &&
                            archivesRef.current[
                              selectedArchiveGroup ===
                              archivesRef.current.length - 1
                                ? 0
                                : selectedArchiveGroup + 1
                            ] &&
                            archivesRef.current[
                              selectedArchiveGroup ===
                              archivesRef.current.length - 1
                                ? 0
                                : selectedArchiveGroup + 1
                            ].images &&
                            archivesRef.current[
                              selectedArchiveGroup ===
                              archivesRef.current.length - 1
                                ? 0
                                : selectedArchiveGroup + 1
                            ].images[currentHeroImg] &&
                            archivesRef.current[
                              selectedArchiveGroup ===
                              archivesRef.current.length - 1
                                ? 0
                                : selectedArchiveGroup + 1
                            ].images[currentHeroImg].url
                              ? archivesRef.current[
                                  selectedArchiveGroup ===
                                  archivesRef.current.length - 1
                                    ? 0
                                    : selectedArchiveGroup + 1
                                ].images[currentHeroImg].url
                              : "https://raw.githubusercontent.com/JosephGoff/js-portfolio/refs/heads/master/public/assets/archives/a2/3--lightblue.png?w=248&fit=crop&auto=format&dpr=2"
                          }
                        />
                      </div>
                    </div>
                  </Box>
                </div>
              )} */}
            </div>
          </div>
        </>
      )}

      {/* <div
        ref={displayContainerRef}
        className={`absolute z-[998] top-0 right-0 w-[calc(100px+50vw+(20px+1vw))] md:w-[calc(300px+25vw+(20px+2vw))] lg:w-[calc(80px+29vw+(10px+7vw))] h-[100vh]`}
        style={{
          transition: "transform 0.7s cubic-bezier(0.5, 0, 0.1, 1)",
          transform: imageDisplayOpen ? "translateY(0)" : "translateY(100%)",
          overscrollBehavior: "none",
          backgroundColor: "white",
        }}
      >
        <div className="w-[100vw] min-h-[100vh] flex flex-col overflow-hidden">
          {archivesRef.current !== null &&
            selectedArchiveGroup !== null &&
            archivesRef.current[selectedArchiveGroup].images.map(
              (image: any, index) => {
                return (
                  <div
                    key={index}
                    className="w-[100vw] h-[100vh] flex justify-center items-center sticky top-0"
                    style={{
                      opacity: 1,
                      backgroundColor: extractImgColor(
                        image.title.split(".")[0]
                      ),
                    }}
                    onClick={() => {
                      // if (displayContainerRef.current) {
                      //   customScroll(
                      //     displayContainerRef.current,
                      //     (index + 1) * window.innerHeight
                      //   );
                      // }
                    }}
                  >
                    <div className="w-[80%] h-[80%] flex items-center justify-center">
                      <img
                        alt=""
                        style={{ objectFit: "contain" }}
                        className="h-[100%] w-[100%]"
                        src={image.url}
                      />
                    </div>
                  </div>
                );
              }
            )}
        </div>
      </div> */}

      {/* <div
        ref={displayContainerButtons}
        className="z-[999] fixed w-[100%] h-[100vh] top-0 left-0 pointer-events-none"
        style={{
          opacity: 0,
          transition: "opacity 0.7s cubic-bezier(0.5, 0, 0.1, 1)",
          transform: imageDisplayOpen ? "translateY(0)" : "translateY(40%)",
        }}
      >
        <div
          className="absolute top-[25px] right-[27px] cursor-pointer hover-dim5 pointer-events-auto"
          onClick={() => {
            handleCloseArchiveGroup();
          }}
          style={{ transition: "opacity 1s ease-in-out", opacity: 0 }}
          ref={closeIconRef}
        >
          <div className="relative h-[34px] w-[35px] flex hover-dim5 pointer-events-auto">
            <div
              className="nav-transition h-[3px] w-[42px] select-none absolute top-[16px] left-0"
              style={{
                backgroundColor: "black",
                transform: "rotate(45deg)",
                borderRadius: 5,
              }}
            ></div>
            <div
              className="nav-transition h-[3px] w-[42px] select-none absolute top-[16px] left-0"
              style={{
                backgroundColor: "black",
                transform: "rotate(-45deg)",
                borderRadius: 5,
              }}
            ></div>
          </div>
        </div>

        <div
          ref={playIconRef}
          style={{ transition: "opacity 1s ease-in-out", opacity: 0 }}
          className="absolute bottom-[22px] right-[18px] w-[55px] cursor-pointer"
        >
          <IoPlayCircleOutline
            color={currentDisplayBG === "white" ? "black" : "white"}
            size={`100%`}
            className="hover-dim5"
          />
        </div>
      </div> */}
    </div>
  );
};

export default Archives;
