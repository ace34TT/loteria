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
    .resize(1124, 1704, {
      fit: "cover",
    })
    .toFile(path.resolve(tempDirectory, resizedFile));
  const filename = "composited_" + generateRandomString(10) + ".jpg";
  await sharp(path.resolve(tempDirectory, model))
    .composite([
      {
        input: path.resolve(tempDirectory, resizedFile),
        top: 203,
        left: 197,
      },
    ])
    .toFile(path.resolve(tempDirectory, filename));
  await deleteImage(path.resolve(tempDirectory, resizedFile));
  return filename;
};
export const combineResultWithModelWithSmallSize = async (
  model: any,
  subject: string
) => {
  const resizedFile = "resized _" + generateRandomString(10) + ".png";
  await sharp(path.resolve(tempDirectory, subject))
    .resize(654, 1248, {
      fit: "inside",
    })
    .toFile(path.resolve(tempDirectory, resizedFile));
  const filename = "composited_" + generateRandomString(10) + ".jpg";
  await sharp(path.resolve(tempDirectory, model))
    .composite([
      {
        input: path.resolve(tempDirectory, resizedFile),
        gravity: "center",
      },
    ])
    .toFile(path.resolve(tempDirectory, filename));
  await deleteImage(path.resolve(tempDirectory, resizedFile));
  return filename;
};
export const addText = async (
  filename: string,
  text: string,
  number: string,
  color: string,
  font: string
) => {
  registerFont(path.resolve(assetsDirectory, "futura/Futura_Light_font.ttf"), {
    family: "Futura_Light",
  });
  registerFont(path.resolve(assetsDirectory, "futura/futur.ttf"), {
    family: "Futura_Bold",
  });
  const canvas = createCanvas(1500, 2100);
  const ctx = canvas.getContext("2d");
  const image = await loadImage(path.resolve(tempDirectory, filename));
  ctx.drawImage(image, 0, 0, 1500, 2100);
  ctx.font = "98px " + (font === "bold" ? "Futura_Bold" : "Futura_Light");
  ctx.fillStyle = color;
  //
  ctx.fillText(number, 225, 310);
  //
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height - 225);
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
export const finaliseProcess = async (
  filename: string,
  text: string,
  number: string,
  color: string,
  font: string
) => {
  registerFont(path.resolve(assetsDirectory, "futura/Futura_Light_font.ttf"), {
    family: "Futura_Light",
  });
  registerFont(path.resolve(assetsDirectory, "futura/futur.ttf"), {
    family: "Futura_Bold",
  });
  console.log(font);
  const canvas = createCanvas(647, 1024);
  const ctx = canvas.getContext("2d");
  const image = await loadImage(path.resolve(tempDirectory, filename));
  ctx.drawImage(image, 0, 0, 647, 1024);
  ctx.font = "64px " + (font === "bold" ? "Futura_Bold" : "Futura_Light");
  ctx.fillStyle = color;
  //
  ctx.fillText(number, 70, 120);
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

export const compress = async (filename: string) => {
  const name = "convert_compressed_" + generateRandomString(10) + ".jpg";
  const outputFile = path.resolve(tempDirectory, name);
  await sharp(path.resolve(tempDirectory, filename))
    .jpeg({ quality: 80 })
    .toFile(outputFile);
  console.log("Image processed successfully!");
  return name;
};
