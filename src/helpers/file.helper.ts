import path from "path";
import fs from "fs";
import sharp from "sharp";
import axios from "axios";
const tempDirectory = path.resolve(__dirname, "../tmp/");
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
export const checkIfExists = (filename: string) => {
  if (fs.existsSync(path.resolve(tempDirectory, filename))) {
    console.log("The file exists.");
  } else {
    console.log("The file does not exist.");
  }
};
//
export const fetchImage = async (prefix: string, url: string) => {
  const response = await axios.get(url, { responseType: "stream" });
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
  }
  const fileName = prefix + "_" + generateRandomString(10) + ".png";
  const filePath = path.resolve(tempDirectory, fileName);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  }).then(() => fileName);
};
export const deleteImage = async (filename: string) => {
  console.log("deleting : " + path.resolve(tempDirectory, filename));
  fs.unlinkSync(path.resolve(tempDirectory, filename));
};
