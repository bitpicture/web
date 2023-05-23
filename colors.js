// Converts RGBA channels into ABGR channels
export const reverseChannels = (hex) => {
  return hex
    .match(/.{1,2}/g)
    .reverse()
    .join("");
};

// Converts hex color into int
export const hex2dec = (color) => {
  if (color.length < 6) {
    color = color.padStart(6, "0");
  }

  //   prepending the A-channel in the RGBA format
  if (color.length === 6) {
    color = `${color}ff`;
  }

  return parseInt(reverseChannels(color), 16);
};
