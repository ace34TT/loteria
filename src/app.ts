import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { replicate } from "./configs/replicate.config";
import { getFilePath } from "./helpers/file.helper";
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
    const image = req.body.image_url;
    console.log("processing with");
    // console.log(prompt);
    // console.log(image);
    // const filename = req.file?.filename;
    // const image = getFile(filename!);
    // const mask = getFile("loteria-mask.jpg");
    const output = await replicate.run(
      "zeke/loteria:03843f4992ae68b5721d7e36473f7b66872769567652777fd62ee16bd806db50",
      {
        input: {
          mask: "https://c44a-197-158-81-251.ngrok-free.app/api/download?filename=mask.jpg",
          image:
            "https://c44a-197-158-81-251.ngrok-free.app/api/download?filename=image.jpg",
          negative_prompt: "letter , words , number , text",
          width: 400,
          height: 300,
          prompt: prompt,
          num_inference_steps: 30,
          scheduler: "K_EULER",
        },
      }
    );
    console.log("Done");
    console.log(output);
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
app.get("/api/download", async (req, res) => {
  const filename: string = req.query.filename as string;
  const file = await getFilePath(filename);
  res.download(file);
});

export { app };
