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
// import Replicate from "replicate";
// import { RunpodRoutes } from "./routes/request.routes";
// import { FileRoutes } from "./routes/file.routes";
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
app.post("/api/generate", upload.single("file"), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const originalname = req.file?.filename;
    console.log("====================starting new job====================");
    console.log("generating combined file");
    const combinedFile = await combineImages(originalname!);
    console.log("making request");
    const output: any = await replicate.run(
      "zeke/loteria:03843f4992ae68b5721d7e36473f7b66872769567652777fd62ee16bd806db50",
      {
        input: {
          // mask: "https://5873-197-158-81-251.ngrok-free.app/api/download?filename=mask.jpg",
          // image: `https://5873-197-158-81-251.ngrok-free.app/api/download?filename=${combinedFile}`,
          mask: "https://backend-replicate.onrender.com/api/download?filename=mask.jpg",
          image: `https://backend-replicate.onrender.com/api/download?filename=${combinedFile}`,
          negative_prompt: "letter , words , number , text",
          width: 512,
          height: 512,
          prompt: prompt,
          prompt_strength: 0.6,
          num_inference_steps: 30,
          scheduler: "K_EULER",
        },
      }
    );
    console.log("fetching generated image ");
    const replicateImage = await fetchImage(output[0]);
    console.log("adding text");
    const imageWithText = (await finaliseProcess(
      replicateImage,
      req.body.name,
      req.body.num
    )) as string;
    const compressedFile = await cropAndCompress(imageWithText!);
    console.log("uploading file to firebase", compressedFile);
    const firebaseUrl = await uploadFileToFirebase(compressedFile!);
    await deleteImage(originalname!);
    await deleteImage(combinedFile!);
    await deleteImage(replicateImage);
    await deleteImage(imageWithText!);
    await deleteImage(compressedFile!);
    console.log("====================job done====================");
    return res.status(200).json({
      url: firebaseUrl,
    });
  } catch (error: any) {
    console.trace(error.message);
    if (error.status === 422) {
      return res.status(422).json({
        message: "Invalid model version or insufficient permissions.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
});
app.get("/api/download", async (req, res) => {
  const filename: string = req.query.filename as string;
  const file = await getFilePath(filename);
  res.download(file);
});
app.use("/api/images", express.static(path.join(__dirname, "images")));

export { app };
