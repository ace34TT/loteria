import path from "path";
import fs from "fs";
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
