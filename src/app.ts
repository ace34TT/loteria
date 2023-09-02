import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { replicate } from "./configs/replicate.config";
import upload from "./middlewares/multer.middleware";
import { getFile } from "./helpers/file.helper";

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
app.post("/api/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const image = req.body.imageUrl;
    console.log("processing with");
    console.log(prompt);
    console.log(image);
    // const filename = req.file?.filename;
    // const image = getFile(filename!);
    // const mask = getFile("loteria-mask.jpg");
    const output = await replicate.run(
      "zeke/loteria:03843f4992ae68b5721d7e36473f7b66872769567652777fd62ee16bd806db50",
      {
        input: {
          mask: "https://firebasestorage.googleapis.com/v0/b/file-server-f5b74.appspot.com/o/kY30e48ekf.jpg?alt=media&token=5f30797c-5326-479b-a994-79964ffac0c9",
          image: image,
          //   width: 512,
          //   height: 512,
          prompt: prompt,
        },
      }
    );
    console.log("Done");
    return res.status(200).json({ output });
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

export { app };
