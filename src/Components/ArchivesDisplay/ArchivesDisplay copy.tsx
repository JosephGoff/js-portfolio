// import React, { useState } from "react";
// import appData from "../../app-details.json";

// const ArchivesDisplay = () => {
//   let initialImages = appData.pages.home.covers[0].images;
//   const [images, setImages] = useState([
//     initialImages[0],
//     initialImages[1],
//     initialImages[2],
//     initialImages[3],
//     initialImages[4],
//   ]);
//   const [displayImage, setDisplayImage] = useState(initialImages[1]);
//   const [displayImage1, setDisplayImage1] = useState(1);

//   const handleMouseEnter = (item: number) => {
//     setDisplayImage(images[item]);
//     setDisplayImage1(item);
//     if (imageShown && displayImage1 !== item) {
//       setImageShown(false);
//     }
//   };

//   const handleMouseLeave = (item: number) => {
//     if (!imageShown) {
//       setDisplayImage(images[0]);
//       if (displayImage1 !== item) {
//         setImageShown(false);
//       }
//     }
//   };

//   const [imageShown, setImageShown] = useState(false);
//   const [scrollBGUp, setScrollBGUp] = useState(false);

//   return (
//     <>
//       <div
//         className="z-[101] w-[100vw] h-[100vh] absolute top-0 left-0"
//         style={{ backgroundColor: "#B8BD98" }}
//       ></div>

//       {/* <div
//         className="z-[101] absolute flex justify-center items-center w-[100vw] h-[100vh] pt-[60px]"
//         style={{
//           backgroundColor: "transparent",
//         }}
//       >
//         <div
//           className="aspect-[1/1] flex flex-row gap-[28px] justify-center p-[40px]"
//           style={{
//             width: "100%",
//             maxWidth: "calc(100vh - 70px)",
//           }}
//         >
//           <div
//             className="h-[calc(100%-80px)] aspect-[0.74/1] flex justify-center items-center p-[30px] sm:p-[40px] md:p-[50px]"
//             style={{ backgroundColor: "#FAF7F5", position: "relative" }}
//           >
//             <div
//               className="w-[100%] aspect-[0.74/1] flex justify-center items-center"
//               style={{ position: "relative" }}
//             >
//               <img
//                 style={{ position: "absolute", zIndex: 202 }}
//                 src={"/assets/home/image-frame1.png"}
//                 alt="cover"
//                 width={1000}
//                 height={1000}
//               />
//               <img
//                 src={appData.baseURL + displayImage}
//                 alt="cover 2"
//                 style={{
//                   position: "absolute",
//                   zIndex: 201,
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                 }}
//               />
//             </div>
//           </div>

//           <div className="h-[calc(100%-80px)] aspect-[0.17/1] flex items-center pt-[3%] pb-[3%]">
//             <div
//               className="h-[100%] w-[100%] flex flex-col gap-[10px] justify-center items-center p-[12px]"
//               style={{ backgroundColor: "#FAF7F5" }}
//             >
//               <div
//                 onMouseEnter={() => handleMouseEnter(1)}
//                 onMouseLeave={() => handleMouseLeave(1)}
//                 onClick={() => {
//                   handleMouseEnter(1);
//                   if (displayImage1 === 1) {
//                     setImageShown((prev) => !prev);
//                   }
//                 }}
//                 className="dim-dark h-[calc((100%-30px)*0.25)] w-[100%] relative"
//               >
//                 <img
//                   src={appData.baseURL + images[1]}
//                   alt="side 1"
//                   style={{
//                     cursor: "pointer",
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                   }}
//                   // priority
//                 />
//               </div>
//               <div
//                 onMouseEnter={() => handleMouseEnter(2)}
//                 onMouseLeave={() => handleMouseLeave(2)}
//                 onClick={() => {
//                   handleMouseEnter(2);
//                   if (displayImage1 === 2) {
//                     setImageShown((prev) => !prev);
//                   }
//                 }}
//                 className="dim-dark h-[calc((100%-30px)*0.25)] w-[100%] relative"
//               >
//                 <img
//                   style={{
//                     cursor: "pointer",
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                   }}
//                   src={appData.baseURL + images[2]}
//                   alt="side 2"
//                   // priority
//                 />
//               </div>
//               <div
//                 onMouseEnter={() => handleMouseEnter(3)}
//                 onMouseLeave={() => handleMouseLeave(3)}
//                 onClick={() => {
//                   handleMouseEnter(3);
//                   if (displayImage1 === 3) {
//                     setImageShown((prev) => !prev);
//                   }
//                 }}
//                 className="dim-dark h-[calc((100%-30px)*0.25)] w-[100%] relative"
//               >
//                 <img
//                   style={{
//                     cursor: "pointer",
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                   }}
//                   src={appData.baseURL + images[3]}
//                   alt="side  3"
//                 />
//               </div>
//               <div
//                 onMouseEnter={() => handleMouseEnter(4)}
//                 onMouseLeave={() => handleMouseLeave(4)}
//                 onClick={() => {
//                   handleMouseEnter(4);
//                   if (displayImage1 === 4) {
//                     setImageShown((prev) => !prev);
//                   }
//                 }}
//                 className="dim-dark h-[calc((100%-30px)*0.25)] w-[100%] relative"
//               >
//                 <img
//                   style={{
//                     cursor: "pointer",
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                   }}
//                   src={appData.baseURL + images[4]}
//                   alt="side 4"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div> */}
//     </>
//   );
// };

// export default ArchivesDisplay;

import React from 'react'

const ArchivesDisplay = () => {
  return (
    <div>ArchivesDisplay copy</div>
  )
}

export default ArchivesDisplay
