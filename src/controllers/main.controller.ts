require("dotenv").config();
import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import { deleteImage, fetchImage } from "../helpers/file.helper";
import {
  combineImages,
  cropAndCompress,
  finaliseProcess,
} from "../helpers/image.helper";
import { uploadFileToFirebase } from "../services/firebase.service";

export const defaultHandler = async (req: Request, res: Response) => {
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
    const replicateImage = await fetchImage("generated", output[0]);
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
};

export const promptOnlyHandler = async (req: Request, res: Response) => {
  try {
    console.log(req.body.prompt);
    console.log(req.body.model);
    const prompt = req.body.prompt;
    const model = req.body.model;
    const output_1: any = await replicate.run(
      "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82",
      {
        input: {
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
    const sdxlImage = await fetchImage("sdxl", output_1[0]);
    const output_2: any = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: `${process.env.BASE_URL}/api/download?filename=${sdxlImage}`,
        },
      }
    );
    const remBg = await fetchImage("rem_bg", output_2[0]);
    console.log(output_1[0]);
    return res.status(200).json({ message: "success !" });
  } catch (error: any) {
    return res.status(500).json({ message: error.res });
  }
};

export const image2imageHandler = (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json({ message: error.res });
  }
};
