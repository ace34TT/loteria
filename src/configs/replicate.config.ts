import Replicate from "replicate";
require("dotenv").config();

const replicate = new Replicate({
  auth: "r8_a33APZbL33R230ZuC04YWG1YiXxX55O1obms6",
});

export { replicate };
