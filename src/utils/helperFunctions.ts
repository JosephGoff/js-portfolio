export function validateColor(input: string) {
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

export function isColor(input: string) {
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
  return null;
}

// export const unSanitizeTitle = (title: string, subTitle: boolean) => {
//   if (subTitle) {
//     title = title.toUpperCase();
//   } else {
//     title = title
//       .split("_")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join("_");
//   }
//   const newTitle = title.replaceAll("_", " ").trim();
//   return newTitle;
// };

// export const sanitizeTitle = (title: string) => {
//   return title.trim().replaceAll(" ", "_").toLowerCase();
// };

// export const extractAfterIndex = (str: string) => {
//   const regex = /^\d+--/;
//   return regex.test(str) ? str.replace(regex, "") : str;
// };

// export const extractBeforeIndex = (str: string) => {
//   const regex = /^(\d+)--/;
//   const match = str.match(regex);
//   return match ? match[1] : null;
// };

export const getCurrentTimestamp = () => {
  const now = new Date();
  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-` +
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds()
    )}-` +
    `${pad(now.getMilliseconds(), 3)}`
  );
};

export const random8Digits = () => {
  return Math.floor(10000000 + Math.random() * 90000000);
};
