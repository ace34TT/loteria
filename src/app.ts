import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { getFilePath } from "./helpers/file.helper";
import path from "path";
import { MainRoutes } from "./routes/main.routes";
import {
  addText,
  combineImages,
  combineResultWithModel,
} from "./helpers/image.helper";
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
app.get("/", async (req: Request, res: Response) => {
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
app.use("/api/tmp/images", express.static(path.join(__dirname, "tmp")));
export { app };
