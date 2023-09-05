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
    const resizedFile = "resized _" + generateRandomString(10) + ".jpg";
    await sharp(path.resolve(tempDirectory, userImage))
      .resize(560, 950, { fit: "cover" })
      .toFile(path.resolve(tempDirectory, resizedFile));
    //
    const filename = "composited_" + generateRandomString(10) + ".jpg";
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
  ctx.fillText(number, 250, 128);
  //
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height - 68);
  //
  const result = "watermarked_" + generateRandomString(10) + ".png";
  const out = fs.createWriteStream(path.resolve(tempDirectory, result));
  const stream = canvas.createPNGStream();
  return new Promise((resolve, reject) => {
    out.on("finish", () => {
      resolve(result);
    });
    out.on("error", reject);
    stream.pipe(out);
  });
};

export const cropAndCompress = async (filename: string) => {
  try {
    const name = "compressed_" + generateRandomString(10) + ".jpg";
    const outputFile = path.resolve(tempDirectory, name);
    await sharp(path.resolve(tempDirectory, filename))
      .extract({ left: 188, top: 0, width: 647, height: 1024 })
      .jpeg({ quality: 80 })
      .toFile(outputFile);
    console.log("Image processed successfully!");
    return name;
  } catch (err) {
    console.error(err);
  }
};
