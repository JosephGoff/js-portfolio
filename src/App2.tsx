

// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useNavigate, useLocation } from "react-router-dom";
// import Home from "./Pages/Home/Home";
// import About from "./Pages/About/About";
// import Projects from "./Pages/Projects/Projects";
// import Navbar from "./Components/Navbar/Navbar";
// import Archives from "./Pages/Archives/Archives";
// import "./App.css";
// import ProjectsPage from "./Pages/Projects/ProjectsPage/ProjectsPage";
// import appData from "./app-details.json";
// import useProjectColorsState from "./store/useProjectColorsStore";
// import useCurrentPageState from "./store/useCurrentPageStore";
// import useCurrentNavColorState from "./store/useCurrentNavColorStore";
// import useSelectedProjectNameState from "./store/useSelectedProjectNameStore";
// import useSelectedProjectState from "./store/useSelectedProjectStore";
// import useIncomingImageDimensionsState from "./store/useIncomingImageDimensionsState";
// import useIncomingImageStylesStore from "./store/useIncomingImageStylesStore";
// import useIncomingImageSpeedState from "./store/useIncomingImageSpeedState";
// import axios from "axios";
// import useCloudinaryDataStore from "./store/useCloudinaryDataStore";

// export interface SlideUpPageProps {
//   children: React.ReactNode;
//   isVisible: boolean;
//   full: boolean;
//   zIdx: number;
//   nextColor: string;
// }

// interface ImageDimension {
//   width: number;
//   height: number;
//   src: string;
// }

// export interface SlideUpProjectPageProps {
//   isVisible: boolean;
//   zIdx: number;
// }

// export interface TreeNode {
//   children: { [key: string]: TreeNode }; // Nested folders
//   images: ImageResource[]; // Images within a folder
// }

// interface ImageResource {
//   public_id: string;
//   url: string;
//   type: string;
// }

// // export type Page = "home" | "about" | "projects" | "archives";
// // export type IncomingPage = "home" | "about" | "projects" | "archives" | "projects" | null;
// export type Page = string;
// export type IncomingPage = string | null;
// export interface PageProps {
//   navigate: (page: Page) => void;
// }

// // Preload images function
// const preloadImages = (imagePaths: string[]) => {
//   imagePaths.forEach((path) => {
//     const img = new Image();
//     img.src = path;
//   });
// };

// const SlideUpPage: React.FC<SlideUpPageProps> = ({
//   children,
//   isVisible,
//   full,
//   zIdx,
//   nextColor,
// }) => {
//   return (
//     <motion.div
//       initial={{ y: "100%" }}
//       animate={isVisible ? { y: "0%" } : {}}
//       exit={{}}
//       transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         background: full ? nextColor : "transparent",
//         zIndex: isVisible ? zIdx : 0,
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// };

// const SlideUpProjectPage: React.FC<SlideUpProjectPageProps> = ({
//   isVisible,
//   zIdx,
// }) => {
//   const { projectColors, setProjectColors } = useProjectColorsState();

//   return (
//     <motion.div
//       initial={{ y: "100%" }}
//       animate={isVisible ? { y: "0%" } : {}}
//       exit={{}}
//       transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         background: projectColors[2][0],
//         // background: full ? "white" : "transparent",
//         // zIndex: isVisible ? zIdx : 0, // Ensure the incoming page overlays the current one
//         zIndex: 100,
//       }}
//     ></motion.div>
//   );
// };

// const App = () => {
//   const { cloudinaryData, setCloudinaryData } = useCloudinaryDataStore();
//   const [loading, setLoading] = useState(true);

//    useEffect(() => {
//     const fetchImages = async () => {
//       try {
//         // Fetch Cloudinary images
//         const response = await axios.get("/api/sign-search", {
//           params: { expression: "resource_type:image" },
//         });

//         const assetsList = response.data.resources;

//         // Function to build the tree structure
//         const buildTree = (resources: any[]): TreeNode => {
//           const root: TreeNode = { children: {}, images: [] }; // Initialize root node

//           resources.forEach((resource) => {
//             const { asset_folder, public_id, secure_url } = resource;
//             const folders = asset_folder.split("/");

//             let current: TreeNode = root; // Start from root node

//             folders.forEach((folder: any) => {
//               // If the folder doesn't exist, initialize it
//               if (!current.children[folder]) {
//                 current.children[folder] = { children: {}, images: [] };
//               }
//               // Traverse to the next level
//               current = current.children[folder];
//             });

//             // Add the image to the images array of the current folder
//             current.images.push({
//               public_id,
//               url: secure_url,
//               type: "image",
//             });
//           });

//           return root;
//         };

//         // Build the tree and set it in state
//         const tree = buildTree(assetsList);
//         if (Object.keys(tree.children).length > 0 && tree.children["js-portfolio"]) { 
//           const pagesObject = tree.children["js-portfolio"]
//           // console.log(pagesObject)
//           // console.log("Cloudinary Tree Structure:", JSON.stringify(pagesObject, null, 2));
           
//           setCloudinaryData(pagesObject);
//           console.log(pagesObject)
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching images:", error);
//         setLoading(false);
//       }
//     };

//     fetchImages();
//   }, []);

//   const [incomingPage, setIncomingPage] = useState<IncomingPage>(null);
//   const [incomingPageDecision, setIncomingPageDecision] =
//     useState<IncomingPage>(null);
//   const navigateTo = useNavigate();
//   const location = useLocation();

//   const { projectColors, setProjectColors } = useProjectColorsState();
//   const { currentPage, setCurrentPage } = useCurrentPageState();
//   const { selectedProjectName, setSelectedProjectName } =
//     useSelectedProjectNameState();
//   const { selectedProject, setSelectedProject } = useSelectedProjectState();
//   const { incomingImageDimensions, setIncomingImageDimensions } =
//     useIncomingImageDimensionsState();
//   const { incomingImageStyles, setIncomingImageStyles } =
//     useIncomingImageStylesStore();
//   const { incomingSpeed, setIncomingSpeed } = useIncomingImageSpeedState();

//   const projects = appData.pages.projects;
//   const projectsList = projects.map((item) => item.link);

//   useEffect(() => {
//     const path = location.pathname.replace("/", "") || "home";
//     // console.log(path)
//     if (
//       path !== currentPage && // Prevent redundant updates
//       (["home", "about", "projects", "archives"].includes(path) ||
//         (path.startsWith("projects/") &&
//           projectsList.includes(path.split("/")[1]) &&
//           path.split("/").length === 2))
//     ) {
//       setCurrentPage(path as Page);
//     }
//   }, [location, projectsList]);

//   // useEffect(() => {
//   //   const path = location.pathname.replace("/", "") || "home";
//   //   if (
//   //     ["home", "about", "projects", "archives"].includes(path) ||
//   //     (path.startsWith("projects/") &&
//   //       projectsList.includes(path.split("/")[1]) &&
//   //       path.split("/").length === 2)
//   //   ) {
//   //     setCurrentPage(path as Page);
//   //   }
//   // }, [currentPage, location, projectsList]);

//   const [disableTransition, setDisableTransition] = useState(false);
//   const [cachedCurrent, setCachedCurrent] = useState<Page>("home");
//   const [sittingProject, setSittingProject] = useState(false);
//   const { currentNavColor, setCurrentNavColor } = useCurrentNavColorState();

//   const navigate = (page: Page) => {
//     if (page === currentPage) return;

//     if (page.startsWith("archives")) {
//       setTimeout(() => {
//         setCurrentNavColor("white");
//       }, 2000);
//     } else {
//       setCurrentNavColor("black");
//     }
//     const newVal = currentPage;
//     if (
//       page.startsWith("projects/") &&
//       projectsList.includes(page.split("/")[1]) &&
//       page.split("/").length === 2
//     ) {
//       setSittingProject(false);
//     }
//     setIncomingPage(page); // Set the incoming page to trigger animation
//     setIncomingPageDecision(page);
//     setTimeout(() => {
//       setCurrentPage(page); // Once animation is done, switch to the new page
//       setIncomingPage(null); // Reset incoming page
//       navigateTo(`/${page}`);
//       window.scrollTo(0, 0);
//       setDisableTransition(true);
//       setTimeout(() => {
//         setDisableTransition(false);
//       }, 50);
//       setTimeout(() => {
//         setIncomingPageDecision(null);
//       }, 100);
//       if (
//         page.startsWith("projects/") &&
//         projectsList.includes(page.split("/")[1]) &&
//         page.split("/").length === 2
//       ) {
//         setSittingProject(true);
//       } else {
//         setSittingProject(false);
//       }
//       setCachedCurrent(newVal);
//     }, 1000); // Match this timeout to the animation duration
//   };

//   // HOME PAGE COVER LAYOUT ORDER (num covers, 2 layouts available so far)
//   const numberOfLayoutsCreated = 7;
//   // Generate an array where each number is unique to the two next to it
//   const [layoutOrder, setLayoutOrder] = useState(() => {
//     let previous = -1; // Start with a value that can't match the first random number
//     const array = Array.from(
//       { length: appData.pages.home.covers.length },
//       (_, index) => {
//         let next;
//         do {
//           next = Math.floor(Math.random() * numberOfLayoutsCreated);
//         } while (next === previous);
//         previous = next;
//         return next;
//       }
//     );

//     // Ensure the first and last elements are different
//     if (array.length > 1 && array[0] === array[array.length - 1]) {
//       let replacement;
//       do {
//         replacement = Math.floor(Math.random() * numberOfLayoutsCreated);
//       } while (
//         replacement === array[array.length - 2] ||
//         replacement === array[0]
//       );
//       array[array.length - 1] = replacement;
//     }

//     return array;
//   });

//   useEffect(() => {
//     const path = location.pathname;
//     if (
//       selectedProjectName[1] === null &&
//       path.startsWith("/projects/") &&
//       projectsList.includes(path.split("/")[2]) &&
//       path.split("/").length === 3
//     ) {
//       const insertProject = projectsList.findIndex(
//         (link) => link === path.split("/")[2]
//       );
//       setSelectedProject(insertProject);
//       setSelectedProjectName([null, insertProject, null]);
//       let projectColorsCopy = projectColors;
//       projectColorsCopy[1] = [
//         projects[insertProject].background_color,
//         projects[insertProject].text_color,
//       ];
//       setProjectColors(projectColorsCopy);

//       const loadImageDimensions = async () => {
//         const dimensions = await Promise.all(
//           appData.pages.projects[insertProject].images.project_images.map(
//             (item) => {
//               const imgSrc = `${appData.baseURL}${item[0]}`;
//               return new Promise<ImageDimension>((resolve) => {
//                 const img = new Image();
//                 img.onload = () =>
//                   resolve({
//                     width: img.naturalWidth,
//                     height: img.naturalHeight,
//                     src: imgSrc,
//                   });
//                 img.src = imgSrc;
//               });
//             }
//           )
//         );
//         setIncomingImageDimensions(dimensions);

//         const newSpeeds = [0];
//         if (dimensions.length > 0) {
//           const styles = dimensions.map((img, index) => {
//             const isHorizontal = img.width > img.height;
//             const dynamicBaseWidth = isHorizontal ? 70 : 45;
//             const dynamicWidth = dynamicBaseWidth + Math.random() * 25;
//             const dynamicMarginLeft = Math.random() * (100 - dynamicWidth);
//             const currentSeparation =
//               index === 2
//                 ? -25 + Math.random() * 50
//                 : -25 + Math.random() * 100;
//             if (index !== 0) {
//               if (index < 4) {
//                 newSpeeds.push(Math.random() * 0.13 + 0.05);
//               } else {
//                 newSpeeds.push(Math.random() * 0.19 + 0.05);
//               }
//             }

//             return {
//               width: `${dynamicWidth}%`,
//               marginLeft: `${dynamicMarginLeft}%`,
//               marginTop: index === 1 ? "0" : `${currentSeparation}px`,
//             };
//           });
//           setIncomingImageStyles(styles);
//           setIncomingSpeed(newSpeeds);
//         }
//       };
//       loadImageDimensions();
//     }
//   }, [location]);

//   useEffect(() => {
//     if (location.pathname === "/home") {
//       setTimeout(() => {
//         document.body.style.overflow = "hidden";
//       }, 1000);
//     } else {
//       document.body.style.overflow = "auto";
//     }

//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [location]);

//   useEffect(() => {
//     if (
//       location.pathname.startsWith("/projects/") &&
//       projectsList.includes(location.pathname.split("/")[2]) &&
//       location.pathname.split("/").length === 3
//     ) {
//       setSittingProject(true);
//     } else {
//       setSittingProject(false);
//     }
//   }, []);

//   return (
//     <>
//       <div style={{ position: "relative", width: "100%", height: "100vh" }}>
//         <Navbar navigate={navigate} />
//         <motion.div
//           initial={{ y: 0 }}
//           animate={
//             incomingPage &&
//             !(
//               incomingPage.startsWith("projects/") &&
//               projectsList.includes(incomingPage.split("/")[1]) &&
//               incomingPage.split("/").length === 2 &&
//               (currentPage === "projects" ||
//                 (currentPage.startsWith("projects/") &&
//                   projectsList.includes(currentPage.split("/")[1]) &&
//                   currentPage.split("/").length === 2))
//             )
//               ? { y: "-15%" }
//               : { y: 0 }
//           }
//           transition={
//             disableTransition
//               ? { duration: 0 } // Disable transition
//               : { duration: 1, ease: [0.95, 0, 0.4, 1] } // Enable animation
//           }
//           // transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             zIndex: 102,
//           }}
//         >
//           {currentPage === "home" && (
//             <Home
//               layoutOrder={layoutOrder}
//               navigate={navigate}
//               slideUpComponent={false}
//             />
//           )}
//           {currentPage === "projects" && (
//             <Projects
//               navigate={navigate}
//               page={null}
//               currentPage={true}
//               animate={true}
//             />
//           )}
//           {currentPage === "about" && <About navigate={navigate} />}
//           {currentPage === "archives" && (
//             <Archives navigate={navigate} slideUpComponent={false} />
//           )}
//           {currentPage?.startsWith("projects/") &&
//             projectsList.includes(currentPage.split("/")[1]) &&
//             currentPage.split("/").length === 2 && (
//               <motion.div
//                 initial={{ y: 0 }}
//                 animate={
//                   incomingPage &&
//                   incomingPage.startsWith("projects/") &&
//                   projectsList.includes(incomingPage.split("/")[1]) &&
//                   incomingPage.split("/").length === 2 &&
//                   currentPage.startsWith("projects/") &&
//                   projectsList.includes(currentPage.split("/")[1]) &&
//                   currentPage.split("/").length === 2
//                     ? { y: "-15%" }
//                     : { y: 0 }
//                 }
//                 transition={
//                   disableTransition
//                     ? { duration: 0 }
//                     : { duration: 1, ease: [0.95, 0, 0.4, 1] }
//                 }
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   width: "100%",
//                   height: "100%",
//                   zIndex: 105,
//                   pointerEvents: "none",
//                 }}
//               >
//                 <ProjectsPage
//                   navigate={navigate}
//                   page={currentPage}
//                   slideUpComponent={false}
//                 />
//               </motion.div>
//             )}
//         </motion.div>

//         <motion.div
//           initial={{ y: 0 }}
//           animate={
//             incomingPage &&
//             !(
//               incomingPage.startsWith("projects/") &&
//               projectsList.includes(incomingPage.split("/")[1]) &&
//               incomingPage.split("/").length === 2 &&
//               (currentPage === "projects" ||
//                 (currentPage.startsWith("projects/") &&
//                   projectsList.includes(currentPage.split("/")[1]) &&
//                   currentPage.split("/").length === 2))
//             )
//               ? { y: "-15%" }
//               : { y: 0 }
//           }
//           transition={
//             disableTransition
//               ? { duration: 0 } // Disable transition
//               : { duration: 1, ease: [0.95, 0, 0.4, 1] } // Enable animation
//           }
//           // transition={{ duration: 1, ease: [0.95, 0, 0.4, 1] }}
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             zIndex: selectedProjectName[1] !== null ? 102 : 101,
//           }}
//         >
//           {currentPage?.startsWith("projects/") &&
//             projectsList.includes(currentPage.split("/")[1]) &&
//             currentPage.split("/").length === 2 && (
//               <div>
//                 {sittingProject && (
//                   <div
//                     className="w-[0] sm:w-[calc(2vw+225px)] md:w-[calc(2vw+255px)]
//                     h-[100vh] fixed left-0 top-0 "
//                     style={{
//                       backgroundColor: projectColors[1][0],
//                     }}
//                   ></div>
//                 )}

//                 <Projects
//                   navigate={navigate}
//                   page={currentPage}
//                   currentPage={true}
//                   animate={
//                     incomingPage
//                       ? incomingPage.startsWith("projects/") &&
//                         projectsList.includes(incomingPage.split("/")[1]) &&
//                         incomingPage.split("/").length === 2 &&
//                         currentPage !== "projects" &&
//                         !(
//                           currentPage.startsWith("projects/") &&
//                           projectsList.includes(currentPage.split("/")[1]) &&
//                           currentPage.split("/").length === 2
//                         )
//                       : !(
//                           cachedCurrent.startsWith("projects/") &&
//                           projectsList.includes(cachedCurrent.split("/")[1]) &&
//                           cachedCurrent.split("/").length === 2
//                         ) && cachedCurrent !== "projects"
//                   }
//                 />
//               </div>
//             )}
//         </motion.div>

//         {/* Animate the incoming page */}
//         {incomingPageDecision === "home" && (
//           <SlideUpPage zIdx={702} isVisible full={true} nextColor={"white"}>
//             <Home
//               layoutOrder={layoutOrder}
//               navigate={navigate}
//               slideUpComponent={true}
//             />
//           </SlideUpPage>
//         )}
//         {incomingPageDecision === "projects" && (
//           <SlideUpPage zIdx={702} isVisible full={true} nextColor={"white"}>
//             <Projects
//               navigate={navigate}
//               page={null}
//               currentPage={false}
//               animate={false}
//             />
//           </SlideUpPage>
//         )}
//         {incomingPageDecision?.startsWith("projects/") &&
//           projectsList.includes(incomingPageDecision.split("/")[1]) &&
//           incomingPageDecision.split("/").length === 2 && (
//             <>
//               <div
//                 className="w-[calc(310px+2vw)] sm:w-[calc(360px+2vw)] md:w-[calc(410px+2vw)] h-[100vh] fixed left-0 top-0 "
//                 style={{ backgroundColor: projectColors[0][0] }}
//               ></div>

//               <Projects
//                 navigate={navigate}
//                 page={incomingPageDecision}
//                 currentPage={false}
//                 animate={false}
//               />
//               <SlideUpProjectPage zIdx={100} isVisible></SlideUpProjectPage>

//               <SlideUpPage
//                 zIdx={702}
//                 isVisible
//                 full={
//                   (currentPage.startsWith("projects/") &&
//                     projectsList.includes(currentPage.split("/")[1]) &&
//                     currentPage.split("/").length === 2) ||
//                   currentPage === "projects"
//                     ? false
//                     : true
//                 }
//                 nextColor={
//                   (currentPage.startsWith("projects/") &&
//                     projectsList.includes(currentPage.split("/")[1]) &&
//                     currentPage.split("/").length === 2) ||
//                   currentPage === "projects"
//                     ? "white"
//                     : projectColors[2][0]
//                 }
//               >
//                 <ProjectsPage
//                   navigate={navigate}
//                   page={incomingPageDecision}
//                   slideUpComponent={true}
//                 />
//               </SlideUpPage>
//             </>
//           )}
//         {incomingPageDecision === "about" && (
//           <SlideUpPage isVisible zIdx={702} full={true} nextColor={"white"}>
//             <About navigate={navigate} />
//           </SlideUpPage>
//         )}
//         {incomingPageDecision === "archives" && (
//           <SlideUpPage isVisible zIdx={702} full={true} nextColor={"white"}>
//             <Archives navigate={navigate} slideUpComponent={true} />
//           </SlideUpPage>
//         )}
//       </div>
//     </>
//   );
// };

// const Root = () => (
//   <>
//     <Router>
//       <App />
//     </Router>
//   </>
// );

// export default Root;


import React from 'react'

const App2 = () => {
  return (
    <div>App2</div>
  )
}

export default App2
