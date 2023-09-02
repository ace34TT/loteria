import express, { Request, Response } from "express";
import bodyParser from "body-parser";
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
// app.use("/api/v1", FileRoutes);
// app.use("/api/v1/", RunpodRoutes);
export { app };
