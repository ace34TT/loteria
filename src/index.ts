import expressListRoutes from "express-list-routes";
import { app } from "./app";
import axios from "axios";
const port = process.env.PORT || 3000;
import cron from "node-cron";

// cron.schedule("*/10 * * * *", function () {
//   console.log("running a task every 10 ");
//   axios.get("https://imagine-ai-lrns.onrender.com");
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  expressListRoutes(app);
});
