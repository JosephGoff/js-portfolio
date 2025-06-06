import React from "react";

interface Section_VV2Props {
  image1: string;
  image2: string;
}

const Section_VV2: React.FC<Section_VV2Props> = ({ image1, image2 }) => {
  return (
    <div className="flex flex-row gap-[28px] project-slide-up-text w-[calc(100%-90px)] md:w-[calc(100%-12vw)] lg:w-[calc(100%-6vw)] md:ml-[6vw] ml-[45px] h-[calc((100vw-90px)*0.55)] md:h-[calc((100vw-12vw)*0.55)] lg:h-[calc((95vw-220px-12vw)*0.55)]">
      <div
        style={{
          height: "90%",
          backgroundColor: "blue",
          aspectRatio: "1/1.27",
        }}
      >
        <img
          src={image1}
          alt="project"
          style={{
            objectFit: "cover",
            height: "100%",
          }}
          width={1000}
          height={1000}
        />
      </div>
      <div
        style={{
          height: "100%",
          backgroundColor: "blue",
          aspectRatio: "1/1.27",
        }}
      >
        <img
          src={image2}
          alt="project"
          style={{
            objectFit: "cover",
            height: "100%",
          }}
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
};

export default Section_VV2;
