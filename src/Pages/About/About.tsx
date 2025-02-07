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
                borderTop: "1px solid #999999",
              }}
            />
          </div>

          <div className="flex flex-row mt-[15px] w-[80%]">
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
    if (
      project !== null &&
      project["about"] &&
      Array.isArray(project["about"]) &&
      project["about"].length > 0
    ) {
      coversRef.current = project["about"] as CoverEntryImage[];
      setCoversReady(project["about"] as CoverEntryImage[]);
      let newAboutText = projectAssets as any;
      newAboutText = newAboutText["aboutText"];
      if (Object.keys(newAboutText).length > 0) {
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

  const scroll1AnimationFrame = useRef<number | null>(null);

  const scroll1Div1 = useRef<HTMLDivElement | null>(null);
  const scroll1Div1Value = useRef(1);

  const scroll1Div2 = useRef<HTMLDivElement | null>(null);

  const scroll1Div3 = useRef<HTMLDivElement | null>(null);

  const scroll1Div4 = useRef<HTMLDivElement | null>(null);
  const scroll1Div4Value = useRef(0);

  useEffect(() => {
    const handleScroll1 = () => {
      if (
        !scroll1Div1.current ||
        !scroll1Div2.current ||
        !scroll1Div3.current ||
        !scroll1Div4.current
      )
        return;
      // const div = scroll1Div1.current;
      // const divHeight = div.clientHeight;
      // const scrollRelation = 1;
      // const scrollRelation = -(div.getBoundingClientRect().y - divHeight);

      // if (scrollRelation >= 0) {
      // let progress = scrollRelation / (2 * divHeight);
      // progress = Math.min(1, Math.max(0, progress));

      // let progress1 = window.scrollY;
      // const newScroll1TranslateY1 = 1 - progress1 * 0.01;

      function easeOutCubic(t: any) {
        return 1 - Math.pow(1 - t, 3);
      }

      const mark2 = 200;
      let progress1 = window.scrollY / window.innerHeight;
      let progress2 = (window.scrollY - mark2) / window.innerHeight;
      progress1 = Math.min(Math.max(progress1, 0), 1);

      const newScroll1Value1 = 1 - easeOutCubic(progress1) * 2;
      const newScroll1Value2 = 1 - easeOutCubic(progress2) * 1.2;

      if (scroll1AnimationFrame.current) {
        cancelAnimationFrame(scroll1AnimationFrame.current);
      }

      scroll1AnimationFrame.current = requestAnimationFrame(() => {
        scroll1Div1Value.current = newScroll1Value1;
        scroll1Div4Value.current = newScroll1Value2;
        if (scroll1Div1.current) {
          scroll1Div1.current.style.opacity = `${scroll1Div1Value.current}`;
        }

        if (scroll1Div2.current) {
          scroll1Div2.current.style.opacity = `${scroll1Div1Value.current}`;
        }

        if (scroll1Div3.current) {
          scroll1Div3.current.style.opacity = `${1 - scroll1Div1Value.current}`;
        }

        if (scroll1Div4.current) {
          if (window.scrollY > mark2) {
            scroll1Div4.current.style.opacity = `1`;
            scroll1Div4.current.style.transition = "opacity 0.8s ease-in-out";
          } else {
            scroll1Div4.current.style.opacity = `0`;
            scroll1Div4.current.style.transition = "opacity 0.2s ease-in-out";
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll1);

    // const observer = new IntersectionObserver(
    //   (entries) => {
    //     if (entries[0].isIntersecting) {
    //       window.addEventListener("scroll", handleScroll1);
    //     } else {
    //       window.removeEventListener("scroll", handleScroll1);
    //     }
    //   },
    //   { threshold: 0.01 }
    // );

    // if (scroll1TranslateDiv1.current) observer.observe(scroll1TranslateDiv1.current);

    return () => {
      // observer.disconnect();
      window.removeEventListener("scroll", handleScroll1);
      // if (scroll1AnimationFrame.current) cancelAnimationFrame(scroll1AnimationFrame.current);
    };
  }, []);

  return (
    <div className="w-[100vw] min-h-[100vh] select-none">
      <div className="w-[100vw] h-[100vh] min-h-[600px]">
        <div
          ref={scroll1Div1}
          className="z-[105] w-[100%] h-[100%] absolute top-0 left-0 min-h-[600px]"
        >
          <div
            style={{
              opacity: imagesOpacity ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
            className="lg:hidden absolute left-[10%] akitha text-[calc(4vw+20px)] bottom-[46%] md:bottom-[45%]"
          >
            Jess Shulman
          </div>
          <div
            style={{
              opacity: imagesOpacity ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
            className="sephir lg:hidden absolute left-[14%] sm:left-[17%] text-[calc(1vw+10px)] bottom-[37%] md:bottom-[35%]"
          >
            <span> Graphic Designer</span> & <br />{" "}
            <span className="ml-[44%]">Photographer</span>
          </div>

          <div
            ref={scroll1Div3}
            style={{ opacity: 0, transition: "opacity 0.8s ease-in-out" }}
            className="lg:hidden absolute top-[50%] left-[7vw] aspect-[1.1/1] lg:mr-[5vw] mr-[3vw] w-[35%] max-w-[550px]"
          >
            <img
              className="w-[100%] h-[100%] object-cover object-[50%_50%]"
              src={coversRef.current === null ? "" : coversRef.current[0].url}
              alt="about 1"
            />
          </div>
        </div>

        <div className=" h-[100vh] min-h-[600px] w-[100vw] p-[5%] pt-[60px] md:pt-[80px] flex flex-row">
          <div className="w-[46%] md:w-[40%] lg:mt-[40px] mt-[5px] lg:w-[48%] relative flex flex-col items-end">
            <div
              style={{
                opacity: imagesOpacity ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
              }}
              className="aspect-[1.1/1] lg:relative absolute lg:bottom-0 bottom-[64%] w-[85%] lg:w-[100%] max-w-[550px]"
            >
              <img
                className="w-[100%] h-[100%] lg:ml-0 ml-[20px] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 1"
              />
            </div>
            <div
              ref={scroll1Div2}
              className="z-[105] w-[100%] h-[100%] flex flex-col items-end"
            >
              <div
                style={{
                  opacity: imagesOpacity ? 1 : 0,
                  transition: "opacity 0.8s ease-in-out",
                }}
                className="lg:flex hidden akitha lg:text-[calc(50px+1vw)] mt-[48px] mr-[-5%] w-[110%] justify-end"
              >
                Jess Shulman
              </div>
              <div
                style={{
                  opacity: imagesOpacity ? 1 : 0,
                  transition: "opacity 0.8s ease-in-out",
                }}
                className="sephir hidden lg:flex lg:mr-[-1%] mr-[9%] mt-[calc(1vw+25px)] text-[calc(1vw+10px)] flex-col lg:flex-row"
              >
                <span>Graphic Designer</span>
                <span className="mx-2">&</span>
                <span className="lg:ml-0 ml-[61%]">Photographer</span>
              </div>
            </div>

            <div
              ref={scroll1Div4}
              style={{
                opacity: 0,
                transition: "opacity 0.8s ease-in-out",
              }}
              className="lg:flex hidden aspect-[1/1.1] lg:mr-[6vw] mr-[3vw] lg:mt-[-19%] w-[75%] max-w-[550px]"
            >
              <img
                className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[0].url}
                alt="about 1"
              />
            </div>
          </div>

          <div className="lg:mt-[-2px] relative w-[53%] lg:w-[45%] ml-[1%] md:ml-[7%] h-[100%] flex flex-col">
            <div
              style={{
                opacity: imagesOpacity ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
              }}
              className="absolute bottom-[60%] w-[80%] max-w-[420px] ml-[20%] aspect-[1.5/1]"
            >
              <img
                className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[1].url}
                alt="about 2"
              />
            </div>
            <div
              style={{
                opacity: imagesOpacity ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
              }}
              className="absolute top-[55%] lg:top-[45%] max-w-[330px] w-[55%] lg:w-[65%] aspect-[1/1.1]"
            >
              <img
                className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                src={coversRef.current === null ? "" : coversRef.current[2].url}
                alt="about 3"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-[100vw] bg-white h-[1000vh] "></div>

      {/* TEXT */}
      {/* <div className="w-[100vw] bg-white flex flex-col items-center px-[calc(20vw+20px)]">
        <p className="abygaer pb-[calc(2vw+20px)] text-[calc(20px+5vw)] font-[600]">
          About Me
        </p>
        <p className="sandemore flex text-center pb-[61px] text-[calc(10px+1vw)]">
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

      {/* Scroll images */}
      {/* <div
        ref={translateDiv1}
        className="h-[100vh] min-h-[600px] w-[100vw] overflow-hidden relative flex justify-center"
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
            src={coversRef.current === null ? "" : coversRef.current[3].url}
            alt=""
            style={{ borderRadius: 5 }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default About;
