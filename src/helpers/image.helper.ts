import path from "path";
import fs from "fs";
import sharp from "sharp";
import { deleteImage, generateRandomString } from "./file.helper";
import { createCanvas, loadImage, registerFont } from "canvas";
const tempDirectory = path.resolve(__dirname, "../images/");
const assetsDirectory = path.resolve(__dirname, "../assets/");
export const combineImages = async (userImage: string) => {
  try {
    //
    const resizedFile = "r_" + generateRandomString(10) + ".jpg";
    await sharp(path.resolve(tempDirectory, userImage))
      .resize(550, 918, { fit: "cover" })
      .toFile(path.resolve(tempDirectory, resizedFile));
    //
    const filename = "c_" + generateRandomString(10) + ".jpg";
    await sharp(path.resolve(tempDirectory, "mask.jpg"))
      .composite([
        { input: path.resolve(tempDirectory, resizedFile), gravity: "centre" },
      ])
      .toFile(path.resolve(tempDirectory, filename));
    // await deleteImage(path.resolve(tempDirectory, userImage));
    await deleteImage(resizedFile);
    return filename;
  } catch (err) {
    console.error(err);
    // handle the error appropriately
  }
};
export const finaliseProcess = async (
  filename: string,
  text: string,
  number: string
) => {
  registerFont(path.resolve(assetsDirectory + "/futur.ttf"), {
    family: "Futura",
  });
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext("2d");
  const image = await loadImage(path.resolve(tempDirectory, filename));
  ctx.drawImage(image, 0, 0, 1024, 1024);
  ctx.font = "64px Futura";
  ctx.fillStyle = "#424242";
  //
  ctx.fillText(number, 80, 128);
  //
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height - 68);
  //
  const result = "fr_" + generateRandomString(10) + ".png";
  const out = fs.createWriteStream(path.resolve(tempDirectory, result));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  return result;
};
