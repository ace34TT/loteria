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
  combineResultWithModelWithSmallSize,
  compress,
} from "../helpers/image.helper";
import { deleteFile, uploadFileToFirebase } from "../services/firebase.service";

export const defaultHandler = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    console.log(prompt);
    const originalname = req.file?.filename;
    console.log("====================starting new job====================");
    console.log("generating combined file");
    console.log("prompt strength : " + Number(req.body.promptStrength));

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
          prompt_strength: Number(req.body.promptStrength),
          num_inference_steps: 30,
          scheduler: "K_EULER",
        },
      }
    );
    console.log("fetching generated image ");
    const replicateImage = await fetchImage("generated", output[0]);
    const compressedFile = await cropAndCompress(replicateImage!);
    const firebaseUrl = await uploadFileToFirebase(compressedFile!);
    await deleteImage(originalname!);
    await deleteImage(combinedFile!);
    await deleteImage(replicateImage);
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
    const modelUrl = req.body.model;
    const previousResult = req.body.result;
    const fullSize = req.body.fullSize;
    const promptStrength = req.body.promptStrength;
    if (previousResult) deleteFile(getFileName(previousResult));
    console.log("first request :");
    console.log("prompt strength : " + Number(req.body.promptStrength));
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
          prompt_strength: Number(promptStrength),
          num_inference_steps: 30,
          scheduler: "K_EULER",
        },
      }
    );
    console.log("===> " + output_1[0]);
    const sdxlImage = await fetchImage("sdxl", output_1[0]);
    const model = await fetchImage("model", modelUrl);
    console.log("second request : " + sdxlImage);
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
    const result =
      fullSize === "full"
        ? await combineResultWithModel(model, remBg)
        : await combineResultWithModelWithSmallSize(model, remBg);
    const finalResult = await compress(result);
    const url = await uploadFileToFirebase(finalResult);
    console.log(url);
    deleteImage(model);
    deleteImage(sdxlImage);
    deleteImage(remBg);
    deleteImage(result);
    deleteImage(finalResult);
    return res.status(200).json({ url });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({ message: error.res });
  }
};
export const image2imageHandler = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    const modelUrl = req.body.model;
    const filename = req.file?.filename;
    const previousResult = req.body.result;
    const fullSize = req.body.fullSize;
    console.log(previousResult);
    if (previousResult) deleteFile(getFileName(previousResult));
    console.log("first request : ", filename);
    console.log("prompt strength : " + Number(req.body.promptStrength));
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
          prompt_strength: Number(req.body.promptStrength),
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
    const model = await fetchImage("model", modelUrl);
    const result =
      fullSize === "full"
        ? await combineResultWithModel(model, remBg)
        : await combineResultWithModelWithSmallSize(model, remBg);
    const finalResult = await compress(result);
    const url = await uploadFileToFirebase(finalResult);
    deleteImage(filename!);
    deleteImage(sdxlImage);
    deleteImage(model);
    deleteImage(remBg);
    deleteImage(result);
    deleteImage(finalResult);
    return res.status(200).json({ url });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.res });
  }
};
export const addDetailsHandler = async (req: Request, res: Response) => {
  try {
    const [image, name, num, color, font] = [
      req.body.image,
      req.body.name,
      req.body.num,
      req.body.color,
      req.body.font,
    ];

    console.log(image);
    const previousResult = req.body.result;
    if (previousResult) deleteFile(getFileName(previousResult));
    const fetchedImage = await fetchImage("firebase_", image);
    let finalResult;
    if (req.body.mode === "classic") {
      finalResult = (await finaliseProcess(
        fetchedImage,
        name,
        num,
        color,
        font
      )) as string;
    } else {
      finalResult = (await addText(
        fetchedImage,
        name,
        num,
        color,
        font
      )) as string;
    }
    const url = await uploadFileToFirebase(finalResult);
    deleteImage(fetchedImage);
    deleteImage(finalResult);
    return res.status(200).json({ url });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({ message: error.res });
  }
};
