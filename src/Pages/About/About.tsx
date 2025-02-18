import React, { useEffect, useRef, useState } from "react";
import { Page, PageProps } from "../../App";
import useProjectColorsState from "../../store/useProjectColorsStore";
import useSelectedProjectState from "../../store/useSelectedProjectStore";
import useSelectedProjectNameState from "../../store/useSelectedProjectNameStore";
import usePreloadedImagesStore from "../../store/usePreloadedImagesStore";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";
import { CoverEntry, CoverEntryImage } from "../Home/Home";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./About.css";

export interface AboutPageProps {
  navigate: (page: Page) => void;
  slideUpComponent: boolean;
}

// Use Share URL, but replace end with /formResponse
// To get entries, click ... prefill form, then prefill tabs, submit, and copy link to get entries
// Enable responses in responses => enable email

const ContactForm2 = (text: any) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [displayText, setDisplayText] = useState<any>({});
  useEffect(() => {
    setDisplayText(text.text);
  }, [text]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const formURL =
      "https://docs.google.com/forms/d/e/1FAIpQLSefgkOVmZsuBuglgw9YzEoX8FJ1wdEs1hGIU9_womrnLO6xDQ/formResponse";

    const formDataToSend = new FormData();
    formDataToSend.append("entry.1601100610", formData.name);
    formDataToSend.append("entry.1899991606", formData.email);
    formDataToSend.append("entry.193734573", formData.message);

    fetch(formURL, {
      method: "POST",
      body: formDataToSend,
    })
      .then((response) => {
        toast.success("Form submitted successfully!");
      })
      .catch((error) => {
        toast.success("Form submitted successfully!");
      });
  };

  return (
    <div className="w-[100%] h-[100%] bg-[#EEEEEE] py-[calc(2vw+15px)] px-[calc(2vw+15px)] md:pl-0 flex flex-col items-center justify-center">
      {displayText && Object.keys(displayText).length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="relative h-[100%] flex flex-col w-[100%] items-center justify-center bg-white "
        >
          <p className="baskara text-[calc(3.5vw+30px)] text-[#323232]">
            {displayText.section7.text1}
          </p>
          <div
            className="flex flex-row  w-[80%] mt-[-10px]"
            style={
              {
                // borderTop: "1px solid #999999",
              }
            }
          >
            <div className="w-[50%] flex flex-row">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ borderBottom: "1px solid #999999" }}
                placeholder={displayText.section7.text2}
                required
                className="pl-[1px] pb-[3px] w-[100%] abygaer text-[calc(0.5vw+10px)] border-none outline-none"
              />
            </div>
            <div className="w-[50%] pl-[calc(1vw+10px)] flex flex-row">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ borderBottom: "1px solid #999999" }}
                placeholder={displayText.section7.text3}
                required
                inputMode="text"
                autoComplete="off"
                className="pl-[1px] pb-[3px] w-[100%] abygaer border-none outline-none text-[calc(0.5vw+10px)]"
              />
            </div>
          </div>
          <div className="abygaer w-[80%] text-center">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder=""
              required
              className="abygaer w-[100%] py-[10px] text-center min-h-[160px] resize-none border-none outline-none"
              style={{
                borderBottom: "1px solid #999999",
                // borderTop: "1px solid #999999",
              }}
            />
          </div>

          <button
            className="flex flex-row items-center gap-[10px] priestacy cursor-pointer mt-[25px] pl-[30px] pr-[25px] text-[#BBBBBB] text-[calc((0.5vw+10px)*1.4)] leading-[calc((0.5vw+10px)*1.5)]"
            style={{ borderRadius: "24px", border: "1px solid #DDDDDD" }}
            type="submit"
          >
            <div className="mt-[9px] mb-[13px]">
              {displayText.section7.text4}
            </div>{" "}
            <img
              src="assets/icons/arrow1-grey.png"
              alt=""
              className="w-[30px]"
            />
          </button>
          <img
            src="assets/about/contact-flower.png"
            alt=""
            className="absolute bottom-0 right-[3%] opacity-[72%] w-[20%] sm:w-[25%] aspect-[1/1]"
          />
        </form>
      )}
    </div>
  );
};

const About: React.FC<AboutPageProps> = ({ navigate, slideUpComponent }) => {
  const { projectColors, setProjectColors } = useProjectColorsState();
  const { selectedProject, setSelectedProject } = useSelectedProjectState();
  const { selectedProjectName, setSelectedProjectName } =
    useSelectedProjectNameState();
  const { projectAssets, setProjectAssets } = useProjectAssetsStore();
  const { preloadedImages, setPreloadedImages } = usePreloadedImagesStore();

  const coversRef = useRef<CoverEntryImage[] | null>(null);
  const [coversReady, setCoversReady] = useState<CoverEntryImage[] | null>(
    null
  );
  const contactRef = useRef<HTMLDivElement | null>(null);
  const [aboutText, setAboutText] = useState<any>({});

  useEffect(() => {
    const project = projectAssets as any;
    if (project !== null) {
      coversRef.current = project["About"].children as CoverEntryImage[];
      setCoversReady(project["About"].children as CoverEntryImage[]);
      const newAboutText = project["About"].details.text;
      if (newAboutText.length > 0) {
        setAboutText(newAboutText);
      }
    }
  }, [projectAssets]);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const translateDiv1 = useRef<HTMLDivElement | null>(null);
  const whiteCoverRef = useRef<HTMLDivElement | null>(null);

  const translateY1 = useRef(-20);
  const translateCover1 = useRef(-20);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const handleParallax = () => {
      if (!translateDiv1.current || !imgRef.current || !whiteCoverRef.current)
        return;

      const div = translateDiv1.current;
      const divHeight = div.clientHeight;
      const scrollRelation = -(div.getBoundingClientRect().y - divHeight);

      if (scrollRelation >= 0) {
        let progress = scrollRelation / (2 * divHeight);
        progress = Math.min(1, Math.max(0, progress));
        const newTranslateY1 = -20 + progress * 40;
        const newTranslateCover1 = 72.5 - progress * 72.5;

        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }

        animationFrame.current = requestAnimationFrame(() => {
          translateY1.current = newTranslateY1;
          translateCover1.current = newTranslateCover1;
          if (imgRef.current) {
            imgRef.current.style.transform = `translate3d(0, ${translateY1.current}%, 0)`;
          }
          if (whiteCoverRef.current) {
            whiteCoverRef.current.style.transform = `translate3d(0, ${translateCover1.current}%, 0)`;
          }
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          window.addEventListener("scroll", handleParallax);
        } else {
          window.removeEventListener("scroll", handleParallax);
        }
      },
      { threshold: 0.01 }
    );

    if (translateDiv1.current) observer.observe(translateDiv1.current);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleParallax);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  const smoothScrollTo = (targetPosition: number) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();
    const duration = 1200;

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

  const handleSendRequestClick = () => {
    if (contactRef.current !== null) {
      smoothScrollTo(contactRef.current.getBoundingClientRect().top);
    }
  };

  const items = [
    {
      text1: "01",
      text2: "PHOTOGRAPHY",
      text3: "PRICE ¥200,000〜",
      text4:
        "We offer original floral arrangements, blizzard flower gift boxes, pressed flower panels, and other original floral arrangements suitable for your project as promotional tools for distribution at events, commemorative parties, and various campaigns.",
    },
  ];

  const item = items[0];
  const [imagesOpacity, setImagesOpacity] = useState(false);

  useEffect(() => {
    if (!slideUpComponent) {
      setImagesOpacity(true);
    }
  }, []);

  const section2Ref = useRef<HTMLDivElement | null>(null);

  const section5TranslateDiv1 = useRef<HTMLDivElement | null>(null);
  const section5img1Ref = useRef<HTMLImageElement | null>(null);
  const section5img2Ref = useRef<HTMLImageElement | null>(null);
  const section5img3Ref = useRef<HTMLImageElement | null>(null);
  const section5img4Ref = useRef<HTMLImageElement | null>(null);
  const section5Text1Ref = useRef<HTMLDivElement | null>(null);
  const section5Text2Ref = useRef<HTMLDivElement | null>(null);
  const section5Text3Ref = useRef<HTMLDivElement | null>(null);
  const section5TranslateY1 = useRef(-50);
  const section5Opacity1 = useRef(0);
  const section5Text1Opacity = useRef(0);
  const section5Text2Opacity = useRef(0);
  const section5Text3Opacity = useRef(0);
  const section5AnimationFrame = useRef<number | null>(null);

  useEffect(() => {
    const handleParallax = () => {
      if (
        !section5TranslateDiv1.current ||
        !section5img1Ref.current ||
        !section5img2Ref.current ||
        !section5img3Ref.current ||
        !section5img4Ref.current ||
        !section5Text1Ref.current ||
        !section5Text2Ref.current ||
        !section5Text3Ref.current ||
        !section2Ref.current
      )
        return;

      const topPosition =
        section2Ref.current.offsetTop - 0.8 * window.innerHeight;

      let fourImagesProgress = (window.scrollY - topPosition) / 23;
      console.log(topPosition)
      fourImagesProgress = Math.min(30, Math.max(0, fourImagesProgress));

      let fourImagesOpacityProgress = (window.scrollY - topPosition) / 300;
      fourImagesOpacityProgress = Math.min(
        1,
        Math.max(0, fourImagesOpacityProgress)
      );

      let fourImagesOpacityText1Progress =
        (window.scrollY - (topPosition + 150)) / 300;
      fourImagesOpacityText1Progress = Math.min(
        1,
        Math.max(0, fourImagesOpacityText1Progress)
      );

      let fourImagesOpacityText2Progress =
        (window.scrollY - (topPosition + 250)) / 300;
      fourImagesOpacityText2Progress = Math.min(
        1,
        Math.max(0, fourImagesOpacityText2Progress)
      );

      let fourImagesOpacityText3Progress =
        (window.scrollY - (topPosition + 350)) / 300;
      fourImagesOpacityText3Progress = Math.min(
        1,
        Math.max(0, fourImagesOpacityText3Progress)
      );

      if (section5AnimationFrame.current) {
        cancelAnimationFrame(section5AnimationFrame.current);
      }

      section5AnimationFrame.current = requestAnimationFrame(() => {
        section5TranslateY1.current = fourImagesProgress;
        section5Opacity1.current = fourImagesOpacityProgress;
        section5Text1Opacity.current = fourImagesOpacityText1Progress;
        section5Text2Opacity.current = fourImagesOpacityText2Progress;
        section5Text3Opacity.current = fourImagesOpacityText3Progress;
        if (section5TranslateDiv1.current) {
          section5TranslateDiv1.current.style.opacity = `${fourImagesOpacityProgress}`;
        }
        if (section5Text1Ref.current) {
          section5Text1Ref.current.style.opacity = `${section5Text1Opacity.current}`;
          section5Text1Ref.current.style.transform = `translate3d(0, ${
            section5Text1Opacity.current * -15
          }px, 0)`;
        }
        if (section5Text2Ref.current) {
          section5Text2Ref.current.style.opacity = `${section5Text2Opacity.current}`;
          section5Text2Ref.current.style.transform = `translate3d(0, ${
            section5Text2Opacity.current * -15
          }px, 0)`;
        }
        if (section5Text3Ref.current) {
          section5Text3Ref.current.style.opacity = `${section5Text3Opacity.current}`;
          section5Text3Ref.current.style.transform = `translate3d(0, ${
            section5Text3Opacity.current * -15
          }px, 0)`;
        }

        if (section5img1Ref.current) {
          section5img1Ref.current.style.transform = `translate3d(${section5TranslateY1.current}px, ${section5TranslateY1.current}px, 0)`;
        }

        if (section5img2Ref.current) {
          section5img2Ref.current.style.transform = `translate3d(${
            section5TranslateY1.current
          }px, ${-section5TranslateY1.current}px, 0)`;
        }

        if (section5img3Ref.current) {
          section5img3Ref.current.style.transform = `translate3d(${-section5TranslateY1.current}px, ${
            section5TranslateY1.current
          }px, 0)`;
        }

        if (section5img4Ref.current) {
          section5img4Ref.current.style.transform = `translate3d(${-section5TranslateY1.current}px, ${-section5TranslateY1.current}px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", handleParallax);
    return () => {
      window.removeEventListener("scroll", handleParallax);
      if (section5AnimationFrame.current)
        cancelAnimationFrame(section5AnimationFrame.current);
    };
  }, []);

  const aboutNavBar = useRef<HTMLDivElement>(null);
  const showAboutNavBar = useRef<boolean>(false);
  const aboutCoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (aboutCoverRef.current && !slideUpComponent) {
        aboutCoverRef.current.style.opacity = "1";
        aboutCoverRef.current.style.transform = "translateY(0)";
      }
    }, 500);

    const handleScroll = () => {
      if (
        window.scrollY > 120 &&
        aboutNavBar.current &&
        !showAboutNavBar.current
      ) {
        aboutNavBar.current.style.transform = "translateY(-80)";
        aboutNavBar.current.style.opacity = "1";
        showAboutNavBar.current = true;
      }
      if (
        window.scrollY < 120 &&
        aboutNavBar.current &&
        showAboutNavBar.current
      ) {
        aboutNavBar.current.style.transform = "translateY(0)";
        aboutNavBar.current.style.opacity = "0";
        showAboutNavBar.current = false;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-[100vw] min-h-[100vh] select-none">
      <div
        className="z-[201] fixed top-0 left-0 w-[100vw] h-[58px] md:h-[76px] lg:h-[80px] "
        ref={aboutNavBar}
        style={{
          pointerEvents: "none",
          opacity: showAboutNavBar.current ? 1 : 0,
          transition:
            "transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
          backgroundColor: "white",
        }}
      ></div>

      <div
        className="w-[100vw] h-[100vh] min-h-[600px]"
        style={{
          opacity: 0,
          transform: "translateY(7px)",
          transition:
            "opacity 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), transform 0.8s ease-in-out",
        }}
        ref={aboutCoverRef}
      >
        <div className="bz-[105] w-[100%] h-[100%] absolute top-0 left-0 min-h-[600px]">
          <div className="lg:hidden absolute left-[10%] akitha text-[calc(4vw+20px)] bottom-[46%] md:bottom-[45%]">
            Jess Shulman
          </div>
          <div className="sephir lg:hidden absolute left-[18%] sm:left-[21%] text-[calc(1vw+10px)] bottom-[37%] md:bottom-[35%]">
            <span> Graphic Designer</span> & <br />{" "}
            <span className="ml-[44%]">Photographer</span>
          </div>
        </div>

        <div className="h-[100vh] w-[100vw] p-[5%] pt-[60px] md:pt-[80px] flex flex-row">
          <div className="min-h-[500px] w-[46%] md:w-[40%] lg:mt-[40px] mt-[5px] lg:w-[48%] relative flex flex-col items-end">
            <div className="aspect-[1.1/1] lg:relative absolute lg:bottom-0 bottom-[64%] w-[85%] max-h-[70%] lg:w-[100%] max-w-[550px]">
              <img
                className="w-[100%] h-[100%] lg:ml-0 ml-[20px] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 1"
              />
            </div>
            <div className=" z-[105] w-[100%] h-[100%] flex flex-col items-end">
              <div className="lg:flex hidden akitha lg:text-[calc(50px+1vw)] mt-[48px] mr-[-5%] w-[110%] justify-end">
                Jess Shulman
              </div>
              <div className="sephir hidden lg:flex lg:mr-[-23%] mr-[9%] mt-[calc(1vw+25px)] text-[calc(1vw+10px)] flex-col lg:flex-row">
                <span>Graphic Designer</span>
                <span className="mx-2">&</span>
                <span className="lg:ml-[-22%] ml-[61%] mt-[30px]">
                  Photographer
                </span>
              </div>
            </div>
          </div>

          <div className="lg:mt-[-2px] min-h-[500px] relative w-[53%] lg:w-[45%] ml-[1%] md:ml-[7%] h-[100%] flex flex-col">
            <div className="absolute bottom-[60%] w-[80%] max-w-[420px] ml-[20%] aspect-[1.5/1]">
              <img
                className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[1].url}
                alt="about 2"
              />
            </div>
            <div className="absolute top-[55%] lg:top-[45%] ml-[20px] max-w-[330px] w-[55%] lg:w-[65%] aspect-[1/1.1]">
              <img
                className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[2].url}
                alt="about 3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="w-[100vw] h-[100vh] justify-center flex bg-[white] mb-[300px]">
        <img
          className="aspect-[1.6/1] w-[100%] object-cover"
          src={coversRef.current === null ? "" : coversRef.current[17].url}
          alt="about 1"
        />
        <div className="bg-[red] w-[30%] aspect-[1/1.5] absolute"></div>
      </div>  */}
      {/* <div className="w-[100vw] bg-white bg-[#a6c379] h-[1000vh] "></div>

      {/* TEXT */}
      {/* <div className="text-black pt-[0px] w-[100vw]  flex flex-col items-center px-[calc(10vw+40px)]">
        <p className="abygaer pb-[calc(2vw+20px)] text-[calc(20px+5vw)] font-[600]">
          About Me
        </p>
        <p className=" sandemore flex text-center pb-[61px] text-[calc(10px+1vw)]">
          Hi! I’m Jess Shulman—a photographer, designer, and lover of all things
          creative
          <br /> <br />I get my inspiration from the lovely humans around me,
          this amazing earth, and all the little things that make life beautiful
          <br /> <br /> You can find me gardening, behind the camera, sketching,
          making something handmade, spending time with my favorite people —
          whatever it is, you can expect I’ll be laughing
        </p>

        <div
          style={{
            opacity: imagesOpacity ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
          className="aspect-[1/1.2] w-[37vw]"
        >
          <img
            className="w-[100%] h-[100%] object-cover object-[50%_50%]"
            src={coversRef.current === null ? "" : coversRef.current[0].url}
            alt="about 1"
          />
        </div>

        <p className="sandemore flex text-center text-[calc(10px+1vw)] pt-[32px] pb-[130px] ">
          <br /> <br /> I care deeply about the earth, sustainability, and am
          always looking for ways to bring the beauty of nature into your daily
          life, whether it’s flowers from the farm or the artistry in my
          designs.
          <br />
          <br /> I'd love to meet you and see how I can help capture your story.
          Send me a message and let’s make something beautiful together!
        </p>
      </div> */}

      <div
        className="w-[100vw] lg:h-[80vh] h-[auto] min-h-[700px] flex flex-col-reverse lg:flex-row lg:mt-[50px] lg:mb-[90px] md:mt-[-60px] mt-[-130px]"
        ref={section2Ref}
      >
        <div
          className="lg:w-[49vw] w-[91vw] px-[5vw] md:px-[14vw] lg:px-[2vw] lg:h-[90%] h-[65vw] mb-[10vw] md:mb-0 flex flex-row mt-[40px] md:mt-[-10px] lg:mt-0"
          ref={section5TranslateDiv1}
          style={{ opacity: 0 }}
        >
          <div className="w-[calc((100%-27px)*0.45)] mr-[27px] h-[100%] flex flex-col">
            <div className="relative w-[100%] h-[calc((100%-27px)*0.54)] mb-[27px] ">
              <img
                ref={section5img1Ref}
                style={{ marginBottom: "30px", marginRight: "30px" }}
                className="absolute bottom-0 right-0 aspect-[1/1.38] w-[43%] object-cover"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 1"
              />
            </div>
            <div className="relative w-[100%] h-[calc((100%-27px)*0.46)] ">
              <img
                ref={section5img2Ref}
                style={{ marginTop: "30px", marginRight: "30px" }}
                className="absolute top-0 right-0 aspect-[1/1.35] w-[53%] object-cover"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 2"
              />
            </div>
          </div>
          <div className="w-[calc((100%-27px)*0.55)] h-[100%] ">
            <div className="relative w-[100%] h-[calc((100%-27px)*0.61)] mb-[27px] ">
              <img
                ref={section5img3Ref}
                style={{ marginBottom: "30px", marginLeft: "30px" }}
                className="absolute bottom-0 left-0 aspect-[1/1.35] w-[72%] object-cover"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 3"
              />
            </div>
            <div className="relative w-[100%] h-[calc((100%-27px)*0.39)] ">
              <img
                ref={section5img4Ref}
                style={{ marginTop: "30px", marginLeft: "30px" }}
                className="absolute top-0 left-0 aspect-[1/1.38] w-[52%] object-cover"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 4"
              />
            </div>
          </div>
        </div>

        <div className="lg:text-left text-center lg:w-[51vw] w-[100vw] h-[auto] pb-[30px] pt-[90px] lg:pb-0 lg:pt-[18px] lg:h-[100%] pl-[calc(5vw+40px)] lg:pl-[10px] pr-[calc(5vw+40px)] flex flex-col justify-center ">
          <div
            ref={section5Text1Ref}
            style={{ opacity: 0 }}
            className="text-[calc(0.9vw+11px)] font-[300]"
          >
            About me
          </div>
          <div
            ref={section5Text2Ref}
            style={{ opacity: 0 }}
            className="mt-[20px] leading-[calc(1vw+18px)] font-[300] text-[calc(0.5vw+11px)]"
          >
            Anai Wood Factory, established in 1964 in the Aso Minamioguni region
            of Kumamoto Prefecture, is situated alongside a river, right next to
            a cluster of residential homes. We specialize in the production and
            sale of all construction-related components, ranging from structural
            materials to interior finishes, using the renowned Oguni cedar and
            cypress, which are local specialties of Minamioguni. Known for our
            extensive forestry knowledge and unique geothermal drying process,
            our timber has earned the love and trust of local carpenters as well
            as architects, construction firms, and individual customers, far and
            wide, who appreciate top-quality materials. With unwavering
            dedication, we have been engaging with wood for over 60 years.
          </div>

          <div
            ref={section5Text3Ref}
            style={{ opacity: 0 }}
            className="relative mt-[30px] cursor-pointer"
          >
            <div
              className="lg:flex hidden w-[10px] h-[10px] absolute  mt-[calc(0.3vw+5px)] left-[-18px] top-0"
              style={{ borderRadius: "50%", border: "0.5px solid #999" }}
            ></div>
            <div
              className="text-[calc(0.6vw+11px)]  inline-block font-[300]"
              style={{ borderBottom: "1px solid black" }}
            >
              Get in touch
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-[100vw] aspect-[1.4/1] lg:mt-[30px] mt-[calc(3vw+80px)] bg-green-300 flex justify-center">
        <div className="h-[100%] bg-white w-[40px] absolute left-0 top-0"></div>
        <img
          alt=""
          className="w-[calc(100vw] aspect-[1.4/1] object-cover"
          src={coversRef.current === null ? "" : coversRef.current[0].url}
        />
        <div className="h-[100%] bg-white w-[40px] absolute right-0 top-0"></div>
      </div>

      <div className="w-[100vw] px-[70px] mt-[calc(3vh+86px)] min-h-[350px] h-[auto] flex flex-col lg:flex-row">
        <div className="lg:pl-[30px] kayonest text-[calc(3vw+50px)] leading-[calc(3vw+50px)] mb-[calc(2vw+30px)] lg:w-[calc(45vw-35px)] lg:mb-0[font-[500]">
          Overview
        </div>
        <div className="lg:mt-[5px] text-[calc(0.57vw+11px)] font-[300] leading-[calc(0.92vw+22px)] lg:w-[calc(55vw-35px)] lg:pr-[25px]">
          The interior and furniture of the “Open Innovation Platform,” an
          industry-academic collaboration office at Kyushu University, was
          furnished with cedar cut from the university's research forest. The
          design concept focused on taking advantage of the charm of
          large-diameter trees without waste. From a single tree, the walls of a
          conference room, tables, a reception desk, and stools were born. This
          efficient use of lumber was realized through the collaboration of
          Kyushu University students. The conference room, revealing the natural
          curves of the wood, was crafted by carpenters from Oguni Town.
        </div>
      </div>

      <div className="lg:w-[70vw] lg:ml-[14vw] w-[96vw] lg:mt-0 mt-[50px] h-[calc(100vw*0.57)] min-h-[480px] flex flex-row gap-[12.5vw] justify-center items-center">
        <div className="w-[37vw] h-[calc(37vw*1.33)] object-cover flex items-center bg-red-500">
          <img
            alt=""
            className="w-[100%]] h-[100%] object-cover"
            src={coversRef.current === null ? "" : coversRef.current[0].url}
          />
        </div>
        <div className="w-[25vw] h-[calc(25vw*1.39)] object-cover flex items-center">
          <img
            alt=""
            className="w-[100%] h-[100%] object-cover"
            src={coversRef.current === null ? "" : coversRef.current[0].url}
          />
        </div>
      </div>

      <div
        ref={translateDiv1}
        className="h-[100vh] mt-[100px] min-h-[600px] w-[100vw] overflow-hidden relative flex justify-center"
      >
        <img
          className="w-[100%] h-[100%] object-cover"
          ref={imgRef}
          src={coversRef.current === null ? "" : coversRef.current[2].url}
          alt=""
          style={{ transform: `translate3d(0, -20%, 0)` }} // Initial position
        />

        <div
          ref={whiteCoverRef}
          className="bg-white absolute top-0 aspect-[1/1.15] h-[58%] flex justify-center items-center flex-col"
          style={{ borderRadius: "6px", transform: `translate3d(0, 72.5%, 0)` }}
        >
          <div className="h-[5.5%] text-[calc(12px+0.22vw)] font-[500] text-center">
            {item.text1}
          </div>
          <div className="mb-[3.5%] text-[calc(27px+0.5vw)] leading-[calc(27px+0.5vw)] mx-[20%] font-[600] text-center">
            {item.text2}
          </div>
          <div className="mb-[3.3%] text-[calc(12px+0.1vw)] text-center">
            {item.text3}
          </div>
          <div className="text-center mx-[21%] mb-[3.8%] leading-[calc(13px+0.28vw)] text-[calc(11px+0.2vw)]">
            {item.text4}
          </div>

          <img
            className="aspect-[1.5/1] mb-[2%] h-[31%] object-cover"
            src={coversRef.current === null ? "" : coversRef.current[0].url}
            alt=""
            style={{ borderRadius: 5 }}
          />
        </div>
      </div>

      {/* <div
        style={{ borderTop: "0.5px solid #bbbbbb" }}
        className="flex flex-row mx-[calc(2vw+15px)] py-[40px]"
      >
        <div className="md:flex hidden w-[calc((96vw-30px)*0.5)] h-[calc((96vw-30px)*0.65)] bg-[#EEEEEE] relative p-[4vw]">
          <img
            alt=""
            style={{}}
            className="w-[100%] h-[100%] object-cover"
            src="assets/about/contact.png"
          />
          <div className="absolute top-0 left-0 w-[100%] h-[100%] opacity-[0%] bg-white"></div>
        </div>
        <div
          ref={contactRef}
          className="w-[100%] md:w-[calc((96vw-30px)*0.5)] h-[calc((96vw-30px))] md:h-[calc((96vw-30px)*0.65)]"
        >
          <ContactForm2 text={aboutText} />
        </div>
      </div> */}
    </div>
  );
};

export default About;
