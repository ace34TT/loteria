import multer from "multer";
import path from "path";
import fs from "fs";
const directory = "src/images";

// Empty the directory first
// fs.readdir(directory, (err, files) => {
//   if (err) throw err;
//   for (const file of files) {
//     fs.unlink(path.join(directory, file), (err) => {
//       if (err) throw err;
//     });
//   }
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + originalExtension);
  },
});

const upload = multer({ storage: storage });

export default upload;
