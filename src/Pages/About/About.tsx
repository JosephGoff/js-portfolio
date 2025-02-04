import React, { useEffect, useRef, useState } from "react";
import { PageProps } from "../../App";
import useProjectColorsState from "../../store/useProjectColorsStore";
import useSelectedProjectState from "../../store/useSelectedProjectStore";
import useSelectedProjectNameState from "../../store/useSelectedProjectNameStore";
import usePreloadedImagesStore from "../../store/usePreloadedImagesStore";
import useProjectAssetsStore from "../../store/useProjectAssetsStore";
import { CoverEntry, CoverEntryImage } from "../Home/Home";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./About.css";

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

const About: React.FC<PageProps> = ({ navigate }) => {
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
      text2: "GIFT / NOVELTY",
      text3: "PRICE ¥200,000〜",
      text4:
        "We offer original floral arrangements, blizzard flower gift boxes, pressed flower panels, and other original floral arrangements suitable for your project as promotional tools for distribution at events, commemorative parties, and various campaigns.",
    },
  ];

  const item = items[0];

  return (
    <div className="w-[100vw] min-h-[100vh]">
      <div className="h-[100vh] min-h-[600px] w-[100vw] pt-[calc(40px+15px)] p-[40px] bg-green-100">
        <img
          className="w-[100%] h-[100%] object-cover object-[60%_20%]"
          // style={{borderRadius: "5px"}}
          src={coversRef.current === null ? "" : coversRef.current[1].url}
          alt=""
        />
      </div>

      <div className="w-[100vw] bg-white flex flex-col pt-[calc(50px+5vw)] items-center px-[calc(50vw-200px)]">
        <p className="pb-[calc(1vw+10px)] text-[calc(20px+5vw)] font-[600]">
          SERVICE
        </p>
        <p className="flex text-left pb-[70px]">
          We offer flower design services that cater to your budget, desired
          size, and various other requests. If you already have an idea of the
          floral arrangement you want, we can provide a design plan that matches
          your concept and vision.
        </p>
        <p className="text-[calc(6px+1vw)] pb-[50px]">
          *The listed price is an estimate; please consult with us separately
          for details.
        </p>
      </div>

      <div
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

        

          <div className="h-[5.5%] text-[calc(12px+0.22vw)] font-[500] text-center">{item.text1}</div>
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
            src={coversRef.current === null ? "" : coversRef.current[2].url}
            alt=""
            style={{ borderRadius: 5 }}
          />
        </div>
      </div>
      <div className="bg-white h-[100vh] min-h-[600px] w-[100vw]"></div>
    </div>
  );
};

export default About;
