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

export const;

export const deleteImage = async (filename: string) => {
  console.log("deleting : " + path.resolve(tempDirectory, filename));
  fs.unlinkSync(path.resolve(tempDirectory, filename));
};
