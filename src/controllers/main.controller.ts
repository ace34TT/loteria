require("dotenv").config();
import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import { deleteImage, fetchImage, getFileName } from "../helpers/file.helper";
import {
  combineImages,
  combineResultWithModel,
  cropAndCompress,
  addText,
  finaliseProcess,
} from "../helpers/image.helper";
import { deleteFile, uploadFileToFirebase } from "../services/firebase.service";

export const defaultHandler = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    console.log(prompt);
    const originalname = req.file?.filename;
    console.log("====================starting new job====================");
    console.log("generating combined file");
    const combinedFile = await combineImages(originalname!);
    console.log("making request");
    const output: any = await replicate.run(
      "zeke/loteria:03843f4992ae68b5721d7e36473f7b66872769567652777fd62ee16bd806db50",
      {
        input: {
          mask: `${process.env.BASE_URL}/api/download?filename=mask.jpg`,
          image: `${process.env.BASE_URL}/api/download?filename=${combinedFile}`,
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
    const prompt = req.body.prompt;
    const model = req.body.model;
    const previousResult = req.body.result;
    const fullSize = req.body.fullSize;
    if (previousResult) deleteFile(getFileName(previousResult));
    console.log("first request :");
    const output_1: any = await replicate.run(
      "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82",
      {
        input: {
          negative_prompt: "letter , words , number , text",
          width: 512,
          height: 808,
          prompt:
            prompt +
            " inspired by Cyril Rolando, minimalist illustration, loteria style, dan mumford and alex grey style",
          prompt_strength: 0.6,
          num_inference_steps: 30,
          scheduler: "K_EULER",
        },
      }
    );
    console.log("===> " + output_1[0]);
    const sdxlImage = await fetchImage("sdxl", output_1[0]);
    console.log("second request : ");
    const output_2: any = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: `${process.env.BASE_URL}/api/download?filename=${sdxlImage}`,
        },
      }
    );
    console.log("===> " + output_2);
    const remBg = await fetchImage("rem_bg", output_2);
    const result = await combineResultWithModel(model, remBg);
    const url = await uploadFileToFirebase(result);
    deleteImage(sdxlImage);
    deleteImage(remBg);
    deleteImage(result);
    return res.status(200).json({ url });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({ message: error.res });
  }
};

export const image2imageHandler = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    const model = req.body.model;
    const filename = req.file?.filename;
    const previousResult = req.body.result;
    const fullSize = req.body.fullSize;
    if (previousResult) deleteFile(getFileName(previousResult));
    console.log("first request : ", filename);
    const output_1: any = await replicate.run(
      "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82",
      {
        input: {
          negative_prompt: "letter , words , number , text",
          width: 512,
          height: 808,
          prompt:
            prompt +
            " inspired by Cyril Rolando, minimalist illustration, loteria style, dan mumford and alex grey style",
          image: `${process.env.BASE_URL}/api/download?filename=${filename}`,
          prompt_strength: 0.6,
          num_inference_steps: 30,
          scheduler: "K_EULER",
        },
      }
    );
    console.log("===> " + output_1[0]);
    const sdxlImage = await fetchImage("sdxl", output_1[0]);
    console.log("second request : ");
    const output_2: any = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: `${process.env.BASE_URL}/api/download?filename=${sdxlImage}`,
        },
      }
    );
    console.log("===> " + output_2);
    const remBg = await fetchImage("rem_bg", output_2);
    const result = await combineResultWithModel(model, remBg);
    const url = await uploadFileToFirebase(result);
    deleteImage(filename!);
    deleteImage(sdxlImage);
    deleteImage(remBg);
    deleteImage(result);
    return res.status(200).json({ url });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.res });
  }
};
export const addDetailsHandler = async (req: Request, res: Response) => {
  try {
    const [image, name, num, color] = [
      req.body.image,
      req.body.name,
      req.body.num,
      req.body.color,
    ];
    console.log(image);
    const previousResult = req.body.result;
    if (previousResult) deleteFile(getFileName(previousResult));
    const fetchedImage = await fetchImage("firebase_", image);
    const finalResult = (await addText(
      fetchedImage,
      name,
      num,
      color
    )) as string;
    const url = await uploadFileToFirebase(finalResult);
    const filename = getFileName(image);
    // deleteFile(filename);
    deleteImage(fetchedImage);
    deleteImage(finalResult);
    return res.status(200).json({ url });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({ message: error.res });
  }
};
