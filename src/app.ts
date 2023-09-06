import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { replicate } from "./configs/replicate.config";
import {
  checkIfExists,
  deleteImage,
  fetchImage,
  getFilePath,
} from "./helpers/file.helper";
import upload from "./middlewares/multer.middleware";
import {
  combineImages,
  cropAndCompress,
  finaliseProcess,
} from "./helpers/image.helper";
import path from "path";
import { uploadFileToFirebase } from "./services/firebase.service";
import { MainRoutes } from "./routes/main.routes";
const app = express();
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(bodyParser.json());

// !
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Hello world",
  });
});
app.use("/api/generate", MainRoutes);

//
app.get("/api/download", async (req, res) => {
  const filename: string = req.query.filename as string;
  const file = await getFilePath(filename);
  res.download(file);
});
app.use("/api/images", express.static(path.join(__dirname, "assets")));

export { app };
