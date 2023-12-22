import fs from "fs";
import path from "path";
import multer from "multer";

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 MB

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = "fgjk,bh";
    const projectRoot = path.resolve(__dirname, "../");
    const userDir = path.join(projectRoot, `uploads/${userId}`);

    // Create the user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Specify the filename for the uploaded files
    cb(null, file.originalname);
  },
});

export const uploadFileUsingMulter = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});
