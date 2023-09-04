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
      .resize(559, 927, { fit: "cover" })
      .toFile(path.resolve(tempDirectory, resizedFile));
    //
    const filename = "c_" + generateRandomString(10) + ".jpg";
    await sharp(path.resolve(tempDirectory, "frame.jpg"))
      .composite([
        { input: path.resolve(tempDirectory, resizedFile), gravity: "centre" },
      ])
      .toFile(path.resolve(tempDirectory, filename));
    await deleteImage(path.resolve(tempDirectory, userImage));
    await deleteImage(resizedFile);
    return filename;
  } catch (err) {
    console.error(err);
    // handle the error appropriately
  }
};
export const finaliseProcess = async () => {
  registerFont(path.resolve(assetsDirectory + "/futur.ttf"), {
    family: "Futura",
  });
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext("2d");
  loadImage(path.resolve(tempDirectory, "out.png")).then((image) => {
    ctx.drawImage(image, 0, 0, 1024, 1024);
    ctx.font = "30px Futura";
    ctx.fillText("Image caption", 50, 100);
    const out = fs.createWriteStream(
      path.resolve(tempDirectory, "f_" + generateRandomString(10) + ".png")
    );
    const stream = canvas.createPNGStream();
    stream.pipe(out);
  });
};
