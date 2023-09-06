import path from "path";
import fs from "fs";
import sharp from "sharp";
import { deleteImage, generateRandomString } from "./file.helper";
import { createCanvas, loadImage, registerFont } from "canvas";
const tempDirectory = path.resolve(__dirname, "../tmp/");
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
export const combineResultWithModel = async (model: any, subject: string) => {
  const resizedFile = "resized _" + generateRandomString(10) + ".png";
  await sharp(path.resolve(tempDirectory, subject))
    .resize(1136, 1710, { fit: "cover" })
    .toFile(path.resolve(tempDirectory, resizedFile));
  const filename = "composited_" + generateRandomString(10) + ".jpg";
  await sharp(path.resolve(assetsDirectory, `models/loteria-bg00${model}.jpg`))
    .composite([
      { input: path.resolve(tempDirectory, resizedFile), gravity: "centre" },
    ])
    .toFile(path.resolve(tempDirectory, filename));
  await deleteImage(path.resolve(tempDirectory, resizedFile));
  return filename;
};
export const addText = async (
  filename: string,
  text: string,
  number: string,
  color: string
) => {
  registerFont(
    path.resolve(assetsDirectory + "/futura/futura medium condensed bt.ttf"),
    {
      family: "Futura",
    }
  );
  const canvas = createCanvas(1500, 2100);
  const ctx = canvas.getContext("2d");
  const image = await loadImage(path.resolve(tempDirectory, filename));
  ctx.drawImage(image, 0, 0, 1500, 2100);
  ctx.font = "98px Futura";
  ctx.fillStyle = color;
  //
  ctx.fillText(number, 350, 350);
  //
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height - 310);
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
