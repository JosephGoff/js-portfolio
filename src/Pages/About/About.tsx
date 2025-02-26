import React, { useEffect, useRef, useState } from "react";
import { GIT_KEYS, Page, PageProps } from "../../App";
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
  // const { preloadedImages, setPreloadedImages } = usePreloadedImagesStore();

  const coversRef = useRef<CoverEntryImage[] | null>(null);

  const [aboutText, setAboutText] = useState<any[]>([]);
  const tree1Url = `https://raw.githubusercontent.com/${GIT_KEYS.owner}/${GIT_KEYS.repo}/refs/heads/${GIT_KEYS.branch}/constants/contact-trees1.png`;
  const tree2Url = `https://raw.githubusercontent.com/${GIT_KEYS.owner}/${GIT_KEYS.repo}/refs/heads/${GIT_KEYS.branch}/constants/contact-trees2.png`;

  const [bgColors, setbgColors] = useState<string[]>([
    "white",
    "#83A273",
    "#4B6538",
  ]);

  useEffect(() => {
    const project = projectAssets as any;
    if (project !== null) {
      coversRef.current = project["About"].children as CoverEntryImage[];
      const newAboutText = project["About"].details.text;
      if (newAboutText.length > 0) {
        setAboutText(newAboutText);
      }
      const newAboutColors = project["About"].details.colors;
      if (newAboutColors.length > 0) {
        setbgColors(newAboutColors.map((item: any) => item.value));
      }
    }
  }, [projectAssets]);

  const imgRef1 = useRef<HTMLImageElement | null>(null);
  const translateDiv1 = useRef<HTMLDivElement | null>(null);
  const whiteCoverRef1 = useRef<HTMLDivElement | null>(null);

  const translateY1 = useRef(-20);
  const translateCover1 = useRef(-20);
  const animationFrame1 = useRef<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleParallax = () => {
      if (!translateDiv1.current || !imgRef1.current || !whiteCoverRef1.current)
        return;

      const div = translateDiv1.current;
      const divHeight = div.clientHeight;
      const scrollRelation = -(div.getBoundingClientRect().y - divHeight);

      if (scrollRelation >= 0) {
        let progress = scrollRelation / (2 * divHeight);
        progress = Math.min(1, Math.max(0, progress));
        const newTranslateY1 = -20 + progress * 40;
        const newTranslateCover1 = 72.5 - progress * 72.5;

        if (animationFrame1.current) {
          cancelAnimationFrame(animationFrame1.current);
        }

        animationFrame1.current = requestAnimationFrame(() => {
          translateY1.current = newTranslateY1;
          translateCover1.current = newTranslateCover1;
          if (imgRef1.current) {
            imgRef1.current.style.transform = `translate3d(0, ${translateY1.current}%, 0)`;
          }
          if (whiteCoverRef1.current) {
            whiteCoverRef1.current.style.transform = `translate3d(0, ${translateCover1.current}%, 0)`;
          }
        });
      }
    };

    window.addEventListener("scroll", handleParallax);

    return () => {
      window.removeEventListener("scroll", handleParallax);
      if (animationFrame1.current)
        cancelAnimationFrame(animationFrame1.current);
    };
  }, []);

  const imgRef7 = useRef<HTMLImageElement | null>(null);
  const translateDiv7 = useRef<HTMLDivElement | null>(null);
  const whiteCoverRef7 = useRef<HTMLDivElement | null>(null);

  const translateY7 = useRef(-20);
  const translateCover7 = useRef(-20);
  const animationFrame7 = useRef<number | null>(null);

  // const scrollProgressRef = useRef<number>(0);

  useEffect(() => {
    const handleParallax = () => {
      if (!translateDiv7.current || !imgRef7.current || !whiteCoverRef7.current)
        return;

      const div = translateDiv7.current;
      const divHeight = div.clientHeight;
      const scrollRelation = -(div.getBoundingClientRect().y - divHeight);

      if (scrollRelation >= 0) {
        let progress = scrollRelation / (2 * divHeight);
        progress = Math.min(1, Math.max(0, progress));
        const newTranslateY7 = -20 + progress * 40;
        const newTranslateCover7 = 72.5 - progress * 72.5;

        if (animationFrame7.current) {
          cancelAnimationFrame(animationFrame7.current);
        }

        animationFrame7.current = requestAnimationFrame(() => {
          translateY7.current = newTranslateY7;
          translateCover7.current = newTranslateCover7;
          if (imgRef7.current) {
            imgRef7.current.style.transform = `translate3d(0, ${translateY7.current}%, 0)`;
          }
          if (whiteCoverRef7.current) {
            whiteCoverRef7.current.style.transform = `translate3d(0, ${translateCover7.current}%, 0)`;
          }
        });
      }
    };

    window.addEventListener("scroll", handleParallax);

    return () => {
      window.removeEventListener("scroll", handleParallax);
      if (animationFrame7.current)
        cancelAnimationFrame(animationFrame7.current);
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

  const [imagesOpacity, setImagesOpacity] = useState(false);

  useEffect(() => {
    if (!slideUpComponent) {
      setImagesOpacity(true);
    }
  }, []);

  const animationFrame2 = useRef<number | null>(null);

  const section2Ref = useRef<HTMLDivElement | null>(null);
  const section2TranslateDiv1 = useRef<HTMLDivElement | null>(null);
  const section2img1Ref = useRef<HTMLImageElement | null>(null);
  const section2img2Ref = useRef<HTMLImageElement | null>(null);
  const section2img3Ref = useRef<HTMLImageElement | null>(null);
  const section2img4Ref = useRef<HTMLImageElement | null>(null);
  const section2Text1Ref = useRef<HTMLDivElement | null>(null);
  const section2Text2Ref = useRef<HTMLDivElement | null>(null);
  const section2Text3Ref = useRef<HTMLDivElement | null>(null);
  const section2TranslateY1 = useRef(-50);
  const section2Opacity1 = useRef(0);
  const section2Text1Opacity = useRef(0);
  const section2Text2Opacity = useRef(0);
  const section2Text3Opacity = useRef(0);

  const section3Ref = useRef<HTMLDivElement | null>(null);
  const section3RefLeft = useRef<HTMLDivElement | null>(null);
  const section3RefRight = useRef<HTMLDivElement | null>(null);
  const section3Img = useRef<HTMLImageElement | null>(null);
  const section3Opacity = useRef(0);
  const section3Widths = useRef(40);
  const section3Translate = useRef(-60);

  const section4Text1 = useRef<HTMLDivElement | null>(null);
  const section4Text2 = useRef<HTMLDivElement | null>(null);
  const section4Text1Opacity = useRef(0);
  const section4Text2Opacity = useRef(0);
  const section4TextTranslate = useRef(-23);

  const section5Ref = useRef<HTMLDivElement | null>(null);
  const section5img1 = useRef<HTMLImageElement | null>(null);
  const section5img2 = useRef<HTMLImageElement | null>(null);
  const section5Translate = useRef(-40);

  const contactTrees = useRef<HTMLDivElement | null>(null);
  const contactTreesEmail = useRef<HTMLDivElement | null>(null);
  const contactTreesOpacity = useRef(0);

  const contactTitle = useRef<HTMLDivElement | null>(null);
  const contactRow1 = useRef<HTMLDivElement | null>(null);
  const contactRow2 = useRef<HTMLDivElement | null>(null);
  const contactSendButton = useRef<HTMLButtonElement | null>(null);

  const contactTitleOpacity = useRef(0);
  const contactTitleTranslate = useRef(30);

  const contactRow1Opacity = useRef(0);
  const contactRow1Translate = useRef(30);

  const contactRow2Opacity = useRef(0);
  const contactRow2Translate = useRef(30);

  const contactSendButtonOpacity = useRef(0);
  const contactSendButtonTranslate = useRef(30);

  useEffect(() => {
    const handleParallax = () => {
      if (
        !section2TranslateDiv1.current ||
        !section2img1Ref.current ||
        !section2img2Ref.current ||
        !section2img3Ref.current ||
        !section2img4Ref.current ||
        !section2Text1Ref.current ||
        !section2Text2Ref.current ||
        !section2Text3Ref.current ||
        !section2Ref.current ||
        !section3Ref.current ||
        !section3RefLeft.current ||
        !section3RefRight.current ||
        !section3Img.current ||
        !section4Text1.current ||
        !section4Text2.current ||
        !section5Ref.current ||
        !section5img1.current ||
        !section5img2.current ||
        !translateDiv7.current ||
        !contactTrees.current ||
        !contactTreesEmail.current ||
        !contactTitle.current ||
        !contactRow1.current ||
        !contactRow2.current ||
        !contactSendButton.current
      )
        return;

      // SECTION 2
      const section2TextOffset = window.innerWidth > 1024 ? 300 : 180;
      const section2ImagesOffset = window.innerWidth > 1024 ? 300 : 550;
      const section2TopPosition =
        section2Ref.current.offsetTop - window.innerHeight;

      let fourImagesProgress =
        (window.scrollY - section2TopPosition - section2ImagesOffset + 180) /
        23;
      fourImagesProgress = Math.min(30, Math.max(0, fourImagesProgress));

      let fourImagesOpacityProgress =
        (window.scrollY - section2TopPosition - section2ImagesOffset) / 300;
      fourImagesOpacityProgress = Math.min(
        1,
        Math.max(0, fourImagesOpacityProgress)
      );

      let fourImagesOpacityText1Progress =
        (window.scrollY - section2TopPosition - section2TextOffset) / 300;
      fourImagesOpacityText1Progress = Math.min(
        1,
        Math.max(0, fourImagesOpacityText1Progress)
      );

      let fourImagesOpacityText2Progress =
        (window.scrollY - (section2TopPosition + 50) - section2TextOffset) /
        300;
      fourImagesOpacityText2Progress = Math.min(
        1,
        Math.max(0, fourImagesOpacityText2Progress)
      );

      let fourImagesOpacityText3Progress =
        (window.scrollY - (section2TopPosition + 100) - section2TextOffset) /
        300;
      fourImagesOpacityText3Progress = Math.min(
        1,
        Math.max(0, fourImagesOpacityText3Progress)
      );

      // SECTION 3
      const section3TopPosition =
        section3Ref.current.offsetTop - window.innerHeight;
      let section3OpacityProgress =
        (window.scrollY - (section3TopPosition + 80)) / 300;
      section3OpacityProgress = Math.min(
        1,
        Math.max(0, section3OpacityProgress)
      );
      let widthPace = window.innerWidth > 1024 ? 100 : 90;
      let section3WidthsProgress =
        (window.scrollY - (section3TopPosition + 200)) / widthPace;
      section3WidthsProgress = Math.min(
        4,
        Math.max(0, section3WidthsProgress)
      );
      const parallaxPace3 = window.innerWidth > 1024 ? 20 : 14;
      let section3TranslateProgress =
        (window.scrollY - (section3TopPosition + 30)) / parallaxPace3;
      section3TranslateProgress = Math.min(
        100,
        Math.max(0, section3TranslateProgress)
      );

      // SECTION 4
      const section4TopPosition =
        section4Text1.current.offsetTop - window.innerHeight;

      let section4Text1OpacityProgress =
        (window.scrollY - (section4TopPosition + 180)) / 300;
      section4Text1OpacityProgress = Math.min(
        1,
        Math.max(0, section4Text1OpacityProgress)
      );
      let text2Offset = window.innerWidth > 1024 ? 150 : 100;
      let section4Text2OpacityProgress =
        (window.scrollY - (section4TopPosition + 180 + text2Offset)) / 300;
      section4Text2OpacityProgress = Math.min(
        1,
        Math.max(0, section4Text2OpacityProgress)
      );
      let section4TextTranslateProgress =
        (window.scrollY - (section4TopPosition + 150)) / 12;
      section4TextTranslateProgress = Math.min(
        23,
        Math.max(0, section4TextTranslateProgress)
      );

      // SECTION 5
      const section5TopPosition =
        section5Ref.current.offsetTop - window.innerHeight;
      const parallaxPace5 = window.innerWidth > 1024 ? 21 : 15;
      let section5TranslateProgress =
        (window.scrollY - (section5TopPosition + 30)) / parallaxPace5;
      section5TranslateProgress = Math.min(
        80,
        Math.max(0, section5TranslateProgress)
      );

      // CONTACT
      const screenBottom = window.scrollY - window.innerHeight;
      const pageBottom =
        translateDiv7.current.offsetTop - translateDiv7.current.clientHeight;
      const contactHeight = window.innerHeight * 0.8;

      let contactOpacityProgress = Math.max(
        0,
        Math.min(1, (-280 + screenBottom - pageBottom) / 300)
      );

      let contactTitleOpacityProgress = Math.max(
        0,
        Math.min(1, (-(contactHeight * 0.4) + screenBottom - pageBottom) / 150)
      );
      let contactRow1OpacityProgress = Math.max(
        0,
        Math.min(1, (-(contactHeight * 0.5) + screenBottom - pageBottom) / 150)
      );
      let contactRow2OpacityProgress = Math.max(
        0,
        Math.min(1, (-(contactHeight * 0.6) + screenBottom - pageBottom) / 150)
      );
      let contactSendButtonOpacityProgress = Math.max(
        0,
        Math.min(1, (-(contactHeight * 0.7) + screenBottom - pageBottom) / 150)
      );

      if (screenBottom >= pageBottom) {
        setScrollProgress(1);
      } else {
        setScrollProgress(0);
      }

      if (animationFrame2.current) {
        cancelAnimationFrame(animationFrame2.current);
      }

      animationFrame2.current = requestAnimationFrame(() => {
        // SECTION 2
        section2TranslateY1.current = fourImagesProgress;
        section2Opacity1.current = fourImagesOpacityProgress;
        section2Text1Opacity.current = fourImagesOpacityText1Progress;
        section2Text2Opacity.current = fourImagesOpacityText2Progress;
        section2Text3Opacity.current = fourImagesOpacityText3Progress;

        if (section2TranslateDiv1.current) {
          section2TranslateDiv1.current.style.opacity = `${fourImagesOpacityProgress}`;
        }
        if (section2Text1Ref.current) {
          section2Text1Ref.current.style.opacity = `${section2Text1Opacity.current}`;
          section2Text1Ref.current.style.transform = `translate3d(0, ${
            section2Text2Opacity.current * -15
          }px, 0)`;
        }
        if (section2Text2Ref.current) {
          section2Text2Ref.current.style.opacity = `${section2Text2Opacity.current}`;
          section2Text2Ref.current.style.transform = `translate3d(0, ${
            section2Text2Opacity.current * -15
          }px, 0)`;
        }
        if (section2Text3Ref.current) {
          section2Text3Ref.current.style.opacity = `${section2Text3Opacity.current}`;
          section2Text3Ref.current.style.transform = `translate3d(0, ${
            section2Text2Opacity.current * -15
          }px, 0)`;
        }

        if (section2img1Ref.current) {
          section2img1Ref.current.style.transform = `translate3d(${section2TranslateY1.current}px, ${section2TranslateY1.current}px, 0)`;
        }

        if (section2img2Ref.current) {
          section2img2Ref.current.style.transform = `translate3d(${
            section2TranslateY1.current
          }px, ${-section2TranslateY1.current}px, 0)`;
        }

        if (section2img3Ref.current) {
          section2img3Ref.current.style.transform = `translate3d(${-section2TranslateY1.current}px, ${
            section2TranslateY1.current
          }px, 0)`;
        }

        if (section2img4Ref.current) {
          section2img4Ref.current.style.transform = `translate3d(${-section2TranslateY1.current}px, ${-section2TranslateY1.current}px, 0)`;
        }

        // SECTION 3
        section3Opacity.current = section3OpacityProgress;
        section3Widths.current = section3WidthsProgress;
        section3Translate.current = section3TranslateProgress;

        if (section3Ref.current) {
          section3Ref.current.style.opacity = `${section3Opacity.current}`;
        }
        if (section3Img.current) {
          section3Img.current.style.transform = `translate3d(0, ${
            -50 + section3Translate.current
          }px, 0)`;
        }
        if (section3RefLeft.current) {
          section3RefLeft.current.style.width = `${
            4 - section3Widths.current
          }vw`;
        }
        if (section3RefRight.current) {
          section3RefRight.current.style.width = `${
            4 - section3Widths.current
          }vw`;
        }

        // SECTION 4
        section4Text1Opacity.current = section4Text1OpacityProgress;
        section4Text2Opacity.current = section4Text2OpacityProgress;
        section4TextTranslate.current = section4TextTranslateProgress;

        if (section4Text1.current) {
          section4Text1.current.style.opacity = `${section4Text1Opacity.current}`;
          section4Text1.current.style.transform = `translate3d(0, ${
            23 - section4TextTranslate.current
          }px, 0)`;
        }
        if (section4Text2.current) {
          section4Text2.current.style.opacity = `${section4Text2Opacity.current}`;
          section4Text2.current.style.transform = `translate3d(0, ${
            23 - section4TextTranslate.current
          }px, 0)`;
        }

        // SECTION 5
        section5Translate.current = section5TranslateProgress;
        if (section5img1.current) {
          section5img1.current.style.transform = `translate3d(0, ${
            -40 + section5Translate.current
          }px, 0)`;
        }
        if (section5img2.current) {
          section5img2.current.style.transform = `translate3d(0, ${
            -40 + section5Translate.current
          }px, 0)`;
        }

        // CONTACT
        contactTreesOpacity.current = contactOpacityProgress;
        if (contactTrees.current) {
          contactTrees.current.style.opacity = `${contactTreesOpacity.current}`;
        }
        if (contactTreesEmail.current) {
          contactTreesEmail.current.style.opacity = `${contactTreesOpacity.current}`;
        }

        contactTitleOpacity.current = contactTitleOpacityProgress;
        contactRow1Opacity.current = contactRow1OpacityProgress;
        contactRow2Opacity.current = contactRow2OpacityProgress;
        contactSendButtonOpacity.current = contactSendButtonOpacityProgress;

        if (contactTitle.current) {
          contactTitle.current.style.transform = `translate3d(0, ${
            20 - contactTitleTranslate.current
          }px, 0)`;
          contactTitle.current.style.opacity = `${contactTitleOpacity.current}`;
        }
        if (contactRow1.current) {
          contactRow1.current.style.transform = `translate3d(0, ${
            20 - contactRow1Translate.current
          }px, 0)`;
          contactRow1.current.style.opacity = `${contactRow1Opacity.current}`;
        }
        if (contactRow2.current) {
          contactRow2.current.style.transform = `translate3d(0, ${
            20 - contactRow2Translate.current
          }px, 0)`;
          contactRow2.current.style.opacity = `${contactRow2Opacity.current}`;
        }
        if (contactSendButton.current) {
          contactSendButton.current.style.transform = `translate3d(0, ${
            20 - contactSendButtonTranslate.current
          }px, 0)`;
          contactSendButton.current.style.opacity = `${contactSendButtonOpacity.current}`;
        }
      });
    };

    window.addEventListener("scroll", handleParallax);
    return () => {
      window.removeEventListener("scroll", handleParallax);
      if (animationFrame2.current)
        cancelAnimationFrame(animationFrame2.current);
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = bgColors[0];
    }
  }, [bgColors]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        !containerRef.current ||
        !section3RefLeft.current ||
        !section3RefRight.current
      )
        return;

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
        Math.max(0, Math.min(1, progress))
      );

      // Apply the background color
      containerRef.current.style.backgroundColor = interpolatedColor;
      section3RefLeft.current.style.backgroundColor = interpolatedColor;
      section3RefRight.current.style.backgroundColor = interpolatedColor;
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

  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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

  const handleSendNewEmailClick = () => {
    const sendEmail = "jessshul27@gmail.com";
    window.location.href = `mailto:${sendEmail}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-[100vw] min-h-[100vh] select-none"
      style={{ backgroundColor: "white" }}
    >
      {aboutText.length >= 13 &&
        coversRef.current !== null &&
        coversRef.current.length >= 12 && (
          <>
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
              className="w-[100vw] h-[100vh] min-h-[620px] md:min-h-[680px] lg:min-h-[800px]"
              style={{
                opacity: 0,
                transform: "translateY(7px)",
                transition:
                  "opacity 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), transform 0.8s ease-in-out",
              }}
              ref={aboutCoverRef}
            >
              <div className="text-[black] bz-[105] w-[100%] h-[100%] absolute top-0 left-0 min-h-[620px] md:min-h-[680px] lg:min-h-[800px]">
                <div className="z-[200] lg:hidden absolute left-[10%] akitha text-[calc(4vw+20px)] bottom-[46%] md:bottom-[45%]">
                  {aboutText[0].value}
                </div>
                <div className="sephir lg:hidden absolute left-[18%] sm:left-[21%] text-[calc(1vw+10px)] bottom-[calc(35%+2vw)] md:bottom-[calc(32%+2vw)]">
                  {aboutText[1].value}
                  <br /> <span className="ml-[44%]">{aboutText[2].value}</span>
                </div>
              </div>

              <div className="h-[100vh] w-[100vw] p-[5%] pt-[60px] md:pt-[80px] flex flex-row">
                <div className="min-h-[500px] w-[46%] md:w-[40%] lg:mt-[40px] mt-[5px] lg:w-[48%] relative flex flex-col items-end">
                  <div className="aspect-[1.1/1] lg:relative absolute lg:bottom-0 bottom-[64%] w-[85%] max-h-[70%] lg:w-[100%] max-w-[550px]">
                    <img
                      className="w-[100%] h-[100%] lg:ml-0 ml-[20px] object-cover object-[50%_50%]"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[0].url
                      }
                      alt="about 1"
                    />
                  </div>
                  <div className="text-[black] z-[105] w-[100%] h-[100%] flex flex-col items-end">
                    <div className="lg:flex hidden akitha lg:text-[calc(50px+1vw)] mt-[48px] mr-[-5%] w-[110%] justify-end">
                      {aboutText[0].value}
                    </div>
                    <div className="sephir hidden lg:flex lg:mr-[-23%] mr-[9%] mt-[calc(1vw+25px)] text-[calc(1vw+10px)] flex-col lg:flex-row">
                      {aboutText[1].value}
                      <span className="lg:ml-[-22%] ml-[61%] mt-[30px]">
                        {aboutText[2].value}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:mt-[-2px] min-h-[500px] relative w-[53%] lg:w-[45%] ml-[1%] md:ml-[7%] h-[100%] flex flex-col">
                  <div className="absolute bottom-[60%] w-[80%] max-w-[420px] ml-[20%] aspect-[1.5/1]">
                    <img
                      className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[1].url
                      }
                      alt="about 2"
                    />
                  </div>
                  <div className="absolute top-[55%] lg:top-[45%] ml-[20px] max-w-[330px] w-[55%] lg:w-[65%] aspect-[1/1.1]">
                    <img
                      className="w-[100%] h-[100%] object-cover object-[50%_50%]"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[2].url
                      }
                      alt="about 3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-[100vw] lg:h-[80vh] h-[auto] min-h-[700px] flex flex-col-reverse lg:flex-row mt-[calc(-10vh)] sm:mt-[calc(-5vh)] md:mt-[calc(-3vh)] lg:mt-[-2vh] xl:mt-0 lg:mb-[90px]"
              ref={section2Ref}
            >
              <div
                className="w-[91vw] lg:w-[49vw] xl:w-[46vw] sm:px-[2vw] md:px-[9vw] lg:px-[2vw] xl:pl-[6vw] lg:h-[90%] h-[65vw] mb-[10vw] md:mb-0 flex flex-row mt-[90px] md:mt-[25px] lg:mt-0"
                ref={section2TranslateDiv1}
                style={{ opacity: 0 }}
              >
                <div className="w-[calc((100%-27px)*0.45)] mr-[27px] h-[100%] flex flex-col">
                  <div className="relative w-[100%] h-[calc((100%-27px)*0.54)] mb-[27px] ">
                    <img
                      ref={section2img1Ref}
                      style={{
                        marginBottom: "30px",
                        marginRight: "30px",
                        border: "3px solid white",
                      }}
                      className="absolute bottom-0 right-0 aspect-[1/1.38] w-[43%] object-cover"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[3].url
                      }
                      alt="about 1"
                    />
                  </div>
                  <div className="relative w-[100%] h-[calc((100%-27px)*0.46)] ">
                    <img
                      ref={section2img2Ref}
                      style={{
                        marginTop: "30px",
                        marginRight: "30px",
                        border: "3px solid white",
                      }}
                      className="absolute top-0 right-0 aspect-[1/1.35] w-[53%] object-cover"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[4].url
                      }
                      alt="about 2"
                    />
                  </div>
                </div>
                <div className="w-[calc((100%-27px)*0.55)] h-[100%] ">
                  <div className="relative w-[100%] h-[calc((100%-27px)*0.61)] mb-[27px] ">
                    <img
                      ref={section2img3Ref}
                      style={{
                        marginBottom: "30px",
                        marginLeft: "30px",
                        border: "3px solid white",
                      }}
                      className="absolute bottom-0 left-0 aspect-[1/1.35] w-[72%] object-cover"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[5].url
                      }
                      alt="about 3"
                    />
                  </div>
                  <div className="relative w-[100%] h-[calc((100%-27px)*0.39)] ">
                    <img
                      ref={section2img4Ref}
                      style={{
                        marginTop: "30px",
                        marginLeft: "30px",
                        border: "3px solid white",
                      }}
                      className="absolute top-0 left-0 aspect-[1/1.38] w-[52%] object-cover"
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[6].url
                      }
                      alt="about 4"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[white] g:text-left text-center lg:w-[51vw] w-[100vw] h-[auto] pb-[30px] lg:pb-0 lg:pt-[18px] lg:h-[100%] pl-[calc(5vw+40px)] lg:pl-[10px] pr-[calc(5vw+40px)] flex flex-col justify-center ">
                <div
                  ref={section2Text1Ref}
                  style={{ opacity: 0 }}
                  className="kayonest text-[calc(3vw+15px)] font-[300]"
                >
                  {aboutText[3].value}
                </div>
                <div
                  ref={section2Text2Ref}
                  style={{ opacity: 0 }}
                  className="mt-[20px] leading-[calc(1vw+18px)] font-[300] text-[calc(0.5vw+11px)]"
                >
                  {aboutText[4].value}
                </div>

                <div
                  ref={section2Text3Ref}
                  style={{ opacity: 0 }}
                  className="relative mt-[30px] cursor-pointer"
                >
                  <div
                    className="hover-dim7 cursor-pointer kayonest text-[calc(0.6vw+11px)]  inline-block font-[300]"
                    style={{ borderBottom: "1px solid white" }}
                    onClick={() => {
                      if (containerRef.current) {
                        smoothScrollTo(
                          containerRef.current.clientHeight - window.innerHeight
                        );
                      }
                    }}
                  >
                    {aboutText[5].value}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex lg:flex-col flex-col-reverse w-[100vw]">
              <div
                ref={section3Ref}
                className="overflow-hidden relative w-[100vw] aspect-[1.4/1] lg:mt-[30px] mt-[calc(3vw+80px)]  flex justify-center max-h-[calc(100vh-60px)]"
              >
                <div
                  ref={section3RefLeft}
                  className="h-[100%] bg-white  w-[4vw] absolute left-0 top-0 z-[500]"
                ></div>
                <img
                  ref={section3Img}
                  alt=""
                  className="w-[100vw] h-[calc(100%+100px)] object-cover"
                  src={
                    coversRef.current === null ? "" : coversRef.current[7].url
                  }
                />
                <div
                  ref={section3RefRight}
                  className="h-[100%] bg-white w-[4vw] absolute right-0 top-0 z-[500]"
                ></div>
              </div>

              <div className="text-[white] w-[100vw] px-[70px] mt-[calc(3vh+86px)] min-h-[350px] h-[auto] flex flex-col lg:flex-row">
                <div
                  ref={section4Text1}
                  className="flex flex-col lg:pl-[1vw] xl:pl-[5vw] kayonest text-[calc(2vw+45px)] leading-[calc(2vw+50px)] mb-[calc(2vw+30px)] md:w-[calc(45vw-35px)] xl:w-[calc(40vw-35px)] lg:mb-0 font-[500]"
                >
                  <p>{aboutText[6].value}</p>
                </div>
                <div
                  ref={section4Text2}
                  className="lg:mt-[7px] lg:mb-[70px] xl:mb-0 text-[calc(0.57vw+11px)] font-[300] leading-[calc(0.92vw+22px)] lg:w-[calc(55vw-35px)] lg:pr-[35px] xl:pr-[45px] lg:pl-[2vw]"
                >
                  {aboutText[7].value}
                </div>
              </div>
            </div>

            <div
              ref={section5Ref}
              className="xl:mt-[-50px] my-[79px] md:my-[100px] lg:mb-[80px] lg:mt-0 lg:w-[70vw] xl:w-[70vw] lg:ml-[14vw] w-[96vw] h-[calc(100vw*0.57)] min-h-[400px] md:min-h-[480px] flex flex-row gap-[12.5vw] xl:gap-[10vw] justify-center items-center"
            >
              <div className=" w-[37vw] xl:w-[32vw] h-[calc(37vw*1.33)] xl:h-[calc(32vw*1.33)] object-cover flex items-center overflow-hidden">
                <img
                  alt=""
                  ref={section5img1}
                  className="w-[100%]] h-[calc(100%+40px)] object-cover"
                  src={
                    coversRef.current === null ? "" : coversRef.current[8].url
                  }
                  style={{ transform: `translate3d(0, -40px, 0)` }}
                />
              </div>
              <div className="w-[25vw] xl:w-[22vw] h-[calc(25vw*1.39)] xl:h-[calc(22vw*1.39)] object-cover flex items-center overflow-hidden">
                <img
                  alt=""
                  ref={section5img2}
                  className="w-[100%] h-[calc(100%+40px)] object-cover"
                  src={
                    coversRef.current === null ? "" : coversRef.current[9].url
                  }
                  style={{ transform: `translate3d(0, -40px, 0)` }}
                />
              </div>
            </div>

            <div
              ref={translateDiv1}
              className="h-[100vh] min-h-[600px] w-[100vw] overflow-hidden relative flex justify-center"
            >
              <img
                className="w-[100%] h-[100%] object-cover"
                ref={imgRef1}
                src={
                  coversRef.current === null ? "" : coversRef.current[10].url
                }
                alt=""
                style={{ transform: `translate3d(0, -20%, 0)` }}
              />

              <div
                ref={whiteCoverRef1}
                className="bg-white absolute top-0 aspect-[1/1.15] h-[58%] flex justify-center items-center flex-col"
                style={{
                  borderRadius: "6px",
                  transform: `translate3d(0, 72.5%, 0)`,
                }}
              >
                {/* <div className="h-[5.5%] text-[calc(12px+0.22vw)] font-[500] text-center">
                  01
                </div> */}
                <div className="mollie mt-[1%] mb-[4.1%] text-[calc(27px+0.5vw)] leading-[calc(27px+0.5vw)] mx-[20%] font-[600] text-center">
                  {aboutText[8].value}
                </div>
          
                <div className="text-center mx-[20.5%] mb-[6%] leading-[calc(13px+0.28vw)] text-[calc(11px+0.2vw)]">
                  {aboutText[9].value}
                </div>

                <img
                  className="aspect-[1.5/1] mb-[2%] h-[31%] object-cover"
                  src={
                    coversRef.current === null ? "" : coversRef.current[11].url
                  }
                  alt=""
                  style={{ borderRadius: 5 }}
                />
              </div>
            </div>

            <div
              ref={translateDiv7}
              className="z-[105] h-[100vh] min-h-[600px] w-[100vw] overflow-hidden relative flex justify-center"
            >
              <img
                className="w-[100%] h-[100%] object-cover absolute"
                ref={imgRef7}
                src={
                  coversRef.current === null ? "" : coversRef.current[12].url
                }
                alt=""
                style={{ transform: `translate3d(0, -20%, 0)` }}
              />

              <div className="h-[100vh] w-full overflow-hidden relative flex justify-center">
                <div
                  ref={whiteCoverRef7}
                  className="bg-white absolute top-0 aspect-[1/1.15] h-[58%] flex justify-center items-center flex-col"
                  style={{
                    borderRadius: "6px",
                    transform: `translate3d(0, 72.5%, 0)`,
                  }}
                >
                  {/* <div className="h-[5.5%] text-[calc(12px+0.22vw)] font-[500] text-center">
                    02
                  </div> */}
                  <div className="mollie mt-[1%] mb-[4.1%] text-[calc(27px+0.5vw)] leading-[calc(27px+0.5vw)] mx-[20%] font-[600] text-center">
                    {aboutText[10].value}
                  </div>
                  <div className="text-center mx-[19%] mb-[6%] leading-[calc(13px+0.28vw)] text-[calc(11px+0.2vw)]">
                    {aboutText[11].value}
                  </div>

                  <img
                    className="aspect-[1.5/1] mb-[2%] h-[31%] object-cover"
                    src={
                      coversRef.current === null
                        ? ""
                        : coversRef.current[13].url
                    }
                    alt=""
                    style={{ borderRadius: 5 }}
                  />
                </div>
              </div>
            </div>

            <div className="pb-[1vh] h-[calc(82vh-58px)] md:h-[calc(82vh-76px)] lg:h-[calc(82vh-80px)] bg-white flex flex-col">
              <form
                onSubmit={handleSubmit}
                className="z-[11] w-full h-full flex flex-col items-center justify-center"
              >
                <div
                  style={{ transform: "translateY(30px)", opacity: 0 }}
                  ref={contactTitle}
                  onClick={() => {
                    if (containerRef.current) {
                      smoothScrollTo(
                        containerRef.current.clientHeight - window.innerHeight
                      );
                    }
                  }}
                  className="cursor-pointer bestfriend leading-[calc(3vw+50px)] text-[calc(3vw+50px)]"
                >
                  {aboutText[12].value}
                </div>

                <div
                  ref={contactRow1}
                  className="flex flex-row w-[67%] md:w-[50%] mt-[5px] mb-[15px] md:mb-[15px]"
                  style={{
                    transform: "translateY(30px)",
                    opacity: 0,
                    backgroundColor: "transparent",
                  }}
                >
                  <div className="w-[calc(50%-10px)]">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        borderBottom: "1px solid #999999",
                        color: "black",
                      }}
                      placeholder={"Name"}
                      required
                      className="pb-[3px] pl-[5px] w-[100%] caster text-[calc(0.6vw+11px)] border-none outline-none"
                    />
                  </div>
                  <div className="ml-[20px] pl-[5px] w-[calc(50%-10px)]">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        borderBottom: "1px solid #999999",
                        color: "black",
                      }}
                      placeholder={"Email"}
                      required
                      inputMode="text"
                      autoComplete="off"
                      className="pl-[1px] pb-[3px] w-[100%] caster border-none outline-none text-[calc(0.6vw+11px)]"
                    />
                  </div>
                </div>
                <div
                  ref={contactRow2}
                  style={{
                    transform: "translateY(30px)",
                    opacity: 0,
                    backgroundColor: "transparent",
                  }}
                  className="h-[150px] mb-[18px] abygaer w-[67%] md:w-[50%]"
                >
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="caster w-full h-full justify-end resize-none border-none outline-none"
                    style={{
                      color: "black",
                      borderBottom: "1px solid #999999",
                    }}
                  />
                </div>

                <button
                  ref={contactSendButton}
                  className="bg-white cursor-pointer baskara text-[35px] w-[120px] h-[40px] flex items-center justify-center pt-[8px] border border-[#BBBBBB] rounded-[25px] transition-all duration-200 hover:bg-[#BBBBBB] hover:text-white"
                  type="submit"
                  style={{
                    transform: "translateY(30px)",
                    opacity: 0,
                  }}
                >
                  Send
                </button>
              </form>
            </div>

            <div
              ref={contactTrees}
              style={{
                display: scrollProgress === 0 ? "none" : "flex",
              }}
              className="z-[10]  fixed bottom-0 left-0 flex-row w-full h-[calc(82vh-58px)] md:h-[calc(82vh-76px)] lg:h-[calc(82vh-80px)]"
            >
              <div className="lg:w-[28%] w-[33%] h-[100%] flex items-end justify-end">
                <img alt="" className="w-full object-contain" src={tree1Url} />
              </div>
              <div className="lg:w-[44%] w-[34%] h-[100%] flex flex-row gap-[10px]"></div>
              <div className="lg:w-[28%] w-[33%] h-[100%] flex items-end justify-end">
                <img alt="" className="w-full object-contain" src={tree2Url} />
              </div>
            </div>

            <div
              ref={contactTreesEmail}
              style={{
                display: scrollProgress === 0 ? "none" : "flex",
              }}
              className="z-[12] justify-center fixed bottom-0 left-0 w-full h-[32px]"
            >
              <p
                onClick={handleSendNewEmailClick}
                className="cursor-pointer hover-dim7 lg:hidden flex text-[calc(0.8vw+8px)] caster"
              >
                jessshul27@gmail.com
              </p>
            </div>
          </>
        )}
    </div>
  );
};

export default About;
