import path from "path";
import fs from "fs";
import sharp from "sharp";
const tempDirectory = path.resolve(__dirname, "../images/");
export const getFileAsBase64 = (filename: string) => {
  const filePath = path.resolve(tempDirectory, filename);
  console.log(filePath);
  const image = fs.readFileSync(filePath, { encoding: "base64" });
  return image;
};
export const getFilePath = async (fileName: string) => {
  return path.resolve(tempDirectory, fileName);
};

export const generateRandomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const deleteImage = async (filename: string) => {
  console.log("deleting : " + path.resolve(tempDirectory, filename));
  fs.unlinkSync(path.resolve(tempDirectory, filename));
};
