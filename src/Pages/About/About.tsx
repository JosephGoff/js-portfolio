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
      console.log(project["about"]);
      let newAboutText = projectAssets as any;
      newAboutText = newAboutText["aboutText"];
      if (Object.keys(newAboutText).length > 0) {
        setAboutText(newAboutText);
      }
    }
  }, [projectAssets]);

  function setUpdatedProject(newProject: number) {
    const currentProj = selectedProject;
    setSelectedProject(newProject);
    setSelectedProjectName([null, newProject, null]);
    // navigate("projects/" + projects[newProject].link);

    // let projectColorsCopy = projectColors;
    // projectColorsCopy[0] = [
    //   projects[currentProj ? currentProj : 0].bg_color,
    //   projects[currentProj ? currentProj : 0].text_color,
    // ];
    // projectColorsCopy[2] = [
    //   projects[newProject].bg_color,
    //   projects[newProject].text_color,
    // ];

    // setProjectColors(projectColorsCopy);
    // setTimeout(() => {
    //   projectColorsCopy[1] = [
    //     projects[newProject].bg_color,
    //     projects[newProject].text_color,
    //   ];
    //   setProjectColors(projectColorsCopy);
    // }, 1000);

    //     onClick={() => {
    //   setUpdatedProject(2);
    //   navigate("projects/provence");
    // }}
  }

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [translateY, setTranslateY] = useState(0);
  // const [isInView, setIsInView] = useState(false);

  const [heroWidth, setHeroWidth] = useState("78%");
  const [heroMt, setHeroMt] = useState(window.innerWidth > 1024 ? "5vh" : "10vh");

  useEffect(() => {
    const handleScroll = () => {
      if (!topRef.current) return;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const startScroll = viewportHeight * 0;
      const endScroll = viewportHeight * 0.3;
      let progress = (scrollY - startScroll) / (endScroll - startScroll);
      progress = Math.min(1, Math.max(0, progress));
      const final = window.innerWidth > 1024 ? 60 : 90
      const newWidth = 78 + progress * (final - 78); // From 78% to 100%
      setHeroWidth(`${newWidth}%`);

      let progress2 = (scrollY - startScroll) / (endScroll - startScroll);
      progress2 = Math.min(1, Math.max(0, progress2));
      const final2 = window.innerWidth > 1024 ? 0 : 0
      const newHeroMt = 10 + progress2 * -10; 
      setHeroMt(`${newHeroMt}vh`);

      if (imgRef.current) {
        const imgTop = imgRef.current.getBoundingClientRect().top + scrollY;
        if (scrollY > 0) {
          const scrollFactor = (scrollY - (0 - window.innerHeight)) * 0.05;
          setTranslateY(scrollFactor);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  const topRef = useRef<HTMLDivElement | null>(null);
  const topRef2 = useRef<HTMLDivElement | null>(null);

  return (
    <>
      {Object.keys(aboutText).length > 0 && (
        <div className={`w-[100%]`}>
          <div className={`w-[100%] flex justify-center lg:px-[2.5vw]`}>
            <div
              ref={topRef}
              style={{ width: heroWidth }}
              className="fixed mt-[56px] md:mt-[75px] h-[calc(100vh-56px)] md:h-[calc(100vh-75px)]"
            >
              <div
                ref={topRef2}
                style={{ marginTop: heroMt }}
                className="select-none absolute min-h-[400px] w-[100%] lg:h-[80%] h-[70%] flex flex-col"
              >
                <img
                  alt=""
                  src={
                    coversRef.current === null ? "" : coversRef.current[1].url
                  }
                  className="overflow-hidden left-0 h-[100%] object-cover object-[50%_20%]"
                />
                <div
                  style={{ fontWeight: "bold" }}
                  className="text-[white] h-[100%] mt-[8vh] z-[110] w-[100%] abygaer absolute md:text-[calc(5vw+50px)] text-[calc(4vw+40px)] leading-[calc(4vw+45px)] md:leading-[calc(4.5vw+45px)] flex justify-center items-center flex-col"
                >
                  <p className="mr-[38vw]">JESS</p>
                  <p className="mr-[-10vw]">SHULMAN</p>
                </div>

                <p className="manrope text-[#323232] absolute bottom-[-12.5%] md:bottom-[-11.1%] text-[calc(10px+0.5vw)] tracking-[-0.05vw] leading-[calc(13px+0.8vw)] right-0 text-right">
                  {aboutText.section1.text4} {aboutText.section1.text5}
                  <br />
                  {aboutText.section1.text6}
                </p>
              </div>
            </div>

            {/* <div className="absolute top-0 left-0 w-[100%] h-[100%] flex flex-col items-center justify-center">
              <div className="w-[calc((12px+0.4vw)*25)] text-center flex bg-white">
                <p className="manrope-md text-[#323232] text-[calc(12px+0.4vw)] leading-[calc(16px+0.6vw)]">
                  {aboutText.section1.text1}
                </p>
              </div>
              <p className="baskara mt-[calc(-2px-1vw)] text-[#323232] text-[calc((12px+0.4vw)*5)] leading-[calc((12px+0.4vw)*5)]">
                {aboutText.section1.text2}
              </p>
              <div
                style={{ border: "0.1px solid #A9524F", color: "#A9524F" }}
                className="cursor-pointer manrope-md text-[calc((12px+0.4vw)*0.7)] py-[calc((12px+0.4vw)*0.3)] px-[calc((12px+0.4vw)*0.6)]"
                onClick={handleSendRequestClick}
              >
                {aboutText.section1.text3}
              </div>
            </div> */}
          </div>
          <div className="h-[100vh]"></div>
          <div className="w-[100%] flex flex-col items-center justify-center px-[calc(15px+2vw)]">
            <div
              className="w-[100%] flex relative justify-center"
              style={{ borderTop: "0.5px solid #bbbbbb" }}
            >
              <p className="manrope-md absolute left-0 top-[15px] text-[calc((12px+0.4vw)*0.64)]">
                {aboutText.section2.text1}
              </p>

              <img
                style={{}}
                alt=""
                src={coversRef.current === null ? "" : coversRef.current[1].url}
                className="h-[calc(30vw+90px)] lg:h-[calc(10vw+150px)] aspect-[1/1.34] object-cover mt-[17px]"
              />
            </div>

            <div
              style={{ borderBottom: "0.5px solid #bbbbbb" }}
              className="w-[100%] text-center mt-[calc(1.5vw+20px)] pb-[110px] flex flex-col relative justify-center"
            >
              <p className="baskara text-[#323232] text-[calc((12px+0.4vw)*4.2)] leading-[calc((12px+0.4vw)*3)] sm:text-[calc((12px+0.4vw)*4.8)] sm:leading-[calc((12px+0.4vw)*4)] lg:text-[calc((12px+0.4vw)*3.7)] lg:leading-[calc((12px+0.4vw)*2.8)] tracking-[-0.1vw]">
                {aboutText.section2.text2}
              </p>
              <p className="baskara text-[#A9524F] mt-[calc(-5px-1vw)] mr-[calc((12px+0.4vw)*10)] text-[calc((12px+0.4vw)*4.2)] leading-[calc((12px+0.4vw)*4.2)] sm:text-[calc((12px+0.4vw)*4.8)] sm:leading-[calc((12px+0.4vw)*4.8)] lg:text-[calc((12px+0.4vw)*3.7)] lg:leading-[calc((12px+0.4vw)*3.7)] tracking-[-0.1vw]">
                {aboutText.section2.text3}
              </p>

              <div className="manrope-md flex:1 lg:mt-[27px] mt-[35px] ml-[calc(50%-(((30vw+90px)/1.34))*0.5)] lg:ml-[calc(50%-(((10vw+150px)/1.34))*0.5)] flex flex-col lg:flex-row gap-[calc(1vw+18px)] lg:gap-0 text-[calc((12px+0.4vw)*0.1.2)] leading-[calc((12px+0.4vw)*1.55)] lg:text-[calc((12px+0.4vw)*0.81)] lg:leading-[calc((12px+0.4vw)*1.26)]">
                <div className="w-[80%] lg:w-[42%] mr-[5%] text-left">
                  {aboutText.section2.text4}
                </div>
                <div className="w-[80%] lg:w-[50%] text-left">
                  {aboutText.section2.text5}
                </div>
              </div>
            </div>
          </div>
          <div className="w-[100%] flex flex-col items-center justify-center px-[calc(15px+2vw)]">
            <div
              className="w-[100%] flex relative flex-col"
              style={{ borderBottom: "0.5px solid #bbbbbb" }}
            >
              <p className="manrope-md absolute right-0 top-[15px] text-[calc((12px+0.4vw)*0.64)]">
                {aboutText.section3.text1}
              </p>
              <div className="w-[100%] h-[auto] flex flex-col lg:flex-row gap-[1%] mt-[15px]">
                <div className="w-[66%] lg:w-[41%] aspect-[1/1.3]">
                  <img
                    style={{}}
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[2].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[16%] aspect-[1/1.3] hidden lg:block">
                  <img
                    style={{}}
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[3].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[16%] aspect-[1/1.3] hidden lg:block">
                  <img
                    style={{}}
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[4].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="flex-row flex lg:hidden mt-[55px] w-[100%]">
                  <div className="w-[32%] aspect-[1/1.3] ml-[34%]">
                    <img
                      style={{}}
                      alt=""
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[5].url
                      }
                      className="w-[100%] aspect-[1/1.3] object-cover"
                    />
                  </div>
                  <div className="w-[32%] aspect-[1/1.3] ml-[2%]">
                    <img
                      style={{}}
                      alt=""
                      src={
                        coversRef.current === null
                          ? ""
                          : coversRef.current[5].url
                      }
                      className="w-[100%] aspect-[1/1.3] object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="w-[100%] relative">
                <p className="w-[100%] text-left lg:text-right manrope text-[#C9C7C5] text-[calc((12px+0.4vw)*7)] leading-[calc((12px+0.4vw)*8)]">
                  {aboutText.section3.text2}
                </p>
                <p className="absolute left-[calc((12px+0.4vw)*11.5)] lg:right-[calc((12px+0.4vw)*5.5)] lg:top-[calc((12px+0.4vw)*1.8)] top-[calc((12px+0.4vw)*2.2)] text-left lg:text-right bestfriend text-[#323232] text-[calc((12px+0.4vw)*7)] leading-[calc((12px+0.4vw)*8)]">
                  {aboutText.section3.text3}
                </p>
              </div>
              <div className="w-[100%] h-[auto] flex flex-row gap-[1%] mt-[50px]">
                <div className="w-[16%] mr-[25%] aspect-[1/1.3] lg:block hidden">
                  <img
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[5].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[16%] aspect-[1/1.3] lg:block hidden">
                  <img
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[5].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="lg:w-[41%] w-[66%] aspect-[1/1.3]">
                  <img
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[5].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="lg:w-[41%] ml-[1%] w-[32%] aspect-[1/1.3] block lg:hidden">
                  <img
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[5].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
              </div>
              <div className="w-[100%] h-[auto] flex flex-row gap-[1%] mt-[100px] lg:mt-[28px]">
                <div className="w-[16%] aspect-[1/1.3] hidden lg:block">
                  <img
                    alt=""
                    src={
                      coversRef.current === null ? "" : coversRef.current[5].url
                    }
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className=" w-[24%] mr-[17%] lg:mr-0 aspect-[1/1.3] hidden lg:block">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[16%] lg:mr-[17%] aspect-[1/1.3] hidden lg:block">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className=" w-[32%] lg:w-[24%] aspect-[1/1.3]">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className=" w-[32%] lg:w-[24%] ml-[35%] aspect-[1/1.3] block lg:hidden">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
              </div>
              <div className="w-[100%] mt-[60px] lg:mt-[10px] mb-[70px] relative flex flex-col gap-[3px] justify-center items-center">
                <img
                  alt=""
                  className="w-[80px]"
                  src="assets/about/about-plant2.png"
                />
                <div className="w-[calc((12px+0.4vw)*24)] text-center flex">
                  <p className="manrope-md text-[#323232] text-[calc((12px+0.4vw)*0.8)] leading-[calc((16px+0.6vw)*0.75)]">
                    {aboutText.section4.text1}
                  </p>
                </div>
              </div>
              <div className="w-[100%] h-[auto] flex flex-row gap-[1%] mb-[70px] lg:mb-0">
                <div className="w-[50%] lg:w-[41%] mr-[17%] lg:mr-[25%] aspect-[1/1.3]">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[16%] aspect-[1/1.3] lg:block hidden">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[32%] lg:w-[16%] aspect-[1/1.3]">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
              </div>
              <div className="w-[100%] h-[auto] flex flex-col lg:flex-row gap-[1%] mt-[28px] mb-[120px]">
                <div className="w-[16%] mr-[25%] aspect-[1/1.3] hidden lg:block">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[41%] aspect-[1/1.3] hidden lg:block">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[16%] aspect-[1/1.3] hidden lg:block">
                  <img
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
                <div className="w-[100%] lg:hidden flex flex-row mb-[80px]">
                  <div className="w-[32%] ml-[34%] mr-[2%] aspect-[1/1.3]">
                    <img
                      alt=""
                      src="assets/about/about-img2.png"
                      className="w-[100%] aspect-[1/1.3] object-cover"
                    />
                  </div>
                  <div className="w-[32%] aspect-[1/1.3]">
                    <img
                      alt=""
                      src="assets/about/about-img2.png"
                      className="w-[100%] aspect-[1/1.3] object-cover"
                    />
                  </div>
                </div>
                <div className="w-[67%] mb-[60px] aspect-[1/1.3] lg:hidden block">
                  <img
                    style={{}}
                    alt=""
                    src="assets/about/about-img2.png"
                    className="w-[100%] aspect-[1/1.3] object-cover"
                  />
                </div>
              </div>
            </div>
            <div
              className="w-[100%] relative flex flex-row"
              style={{ borderBottom: "0.5px solid #bbbbbb" }}
            >
              <p className="manrope-md absolute right-0 top-[15px] text-[calc((12px+0.4vw)*0.64)]">
                {aboutText.section5.text1}
              </p>
              <div className="z-[200] absolute right-0 h-[100%] w-[15%] mr-[calc(-2vw-15px)] hidden lg:flex items-center">
                <img
                  style={{}}
                  alt=""
                  src="assets/about/about-plant2.png"
                  className="w-[100%] object-contain"
                />
              </div>

              <div className="z-[201] hidden sm:flex w-[33%] lg:w-[40%] py-[10%] h-[auto] bg-white lg:bg-[#F0EFED] items-center lg:justify-center">
                <img
                  style={{}}
                  className="hidden lg:block w-[40%]"
                  alt=""
                  src="assets/about/about-img1.png"
                />
                <img
                  style={{}}
                  className="lg:hidden block w-[90%] ml-[calc(-2vw-15px)]"
                  alt=""
                  src="assets/about/about-plant2.png"
                />
              </div>
              <div className="w-[100%] sm:w-[67%] lg:w-[60%] lg:pl-[8%] flex flex-col sm:text-left text-center justify-end">
                <div className="lg:pl-[30px] py-[30px] pt-[60px] lg-pt-[30px] baskara w-[100%]flex-1 flex-col flex justify-center text-[calc((12px+0.4vw)*6)] leading-[calc((12px+0.4vw)*5)] sm:text-[calc((12px+0.4vw)*7)] sm:leading-[calc((12px+0.4vw)*4.5)]">
                  <p className="text-[#323232]">{aboutText.section5.text2}</p>
                  <p className="ml-[calc((12px+0.4vw)*10)] sm:ml-[calc((12px+0.4vw)*5)] text-[#A9524F]">
                    {aboutText.section5.text3}
                  </p>
                </div>

                <div className="sm:text-left text-center sm:items-left items-center manrope-md flex mt-[calc(13px+1vw)]  pb-[calc(13px+5vw)] sm:flex-row flex-col gap-[40px] sm:gap-[calc(1vw+18px)] text-[calc((12px+0.4vw)*0.8)] leading-[calc((12px+0.4vw)*1.3)] sm:text-[calc((12px+0.4vw)*1)] sm:leading-[calc((12px+0.4vw)*1.55)] lg:text-[calc((12px+0.4vw)*0.81)] lg:leading-[calc((12px+0.4vw)*1.26)]">
                  <div className="text-[#323232] w-[50%]">
                    <span>{aboutText.section5.text4}</span>
                    <div className="h-[10px]"></div>
                    {aboutText.section5.text5}
                  </div>
                  <div className="text-[#323232] w-[50%]">
                    <span>{aboutText.section5.text6}</span>
                    <div className="h-[10px]"></div>
                    {aboutText.section5.text7}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[100%] mb-[30px] flex relative justify-center h-[auto] px-[calc(2vw+15px)]">
            <div className="z-[201] px-[calc(2vw+15px)] manrope absolute w-[100%] bottom-[25px] text-[#C9C7C5] text-[calc((12px+0.4vw)*6)] md:text-[calc((12px+0.4vw)*7)] leading-[calc((12px+0.4vw)*6.3)]">
              <p className="text-left">{aboutText.section6.text1}</p>
              <p className="text-right lg:text-center">
                {aboutText.section6.text2}
              </p>
            </div>
            <img
              ref={imgRef}
              style={{
                transform: `translateY(-${translateY}px)`,
                // transition: "transform 0.1s linear",
              }}
              alt=""
              src="assets/about/about-img2.png"
              className="z-[202] my-[calc(200px)] h-[calc(200px+2vw)] aspect-[1.5/1] object-cover"
            />
            <div className="absolute right-0 h-[100%] w-[30%] flex items-center">
              <img
                style={{}}
                alt=""
                src="assets/about/about-plant2.png"
                className="z-[200] h-[calc(200px+2vw)] aspect-[1.5/1] object-cover"
              />
            </div>
          </div>
          <ToastContainer position="bottom-center" />
          <div
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
          </div>
        </div>
      )}
    </>
  );
};

export default About;
