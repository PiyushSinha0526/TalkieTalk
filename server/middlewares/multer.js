import multer from "multer";

export const multerUplaod = multer({ limits: { fileSize: 1024 * 1024 * 30 } });

const singleUpload = multerUplaod.single("file");
const attachments = multerUplaod.array("files", 5);

export { singleUpload, attachments };
