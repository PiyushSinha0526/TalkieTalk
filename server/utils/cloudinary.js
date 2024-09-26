import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map(async (file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: uuidv4(),
          },
          (err, result) => {
            if (err) {
              console.error("Upload error:", err);

              return reject(err);
            }
            resolve(result);
          }
        )
        .end(file.buffer);
    });
  });
  try {
    const results = await Promise.all(uploadPromises);
    const formatedResults = results.map((result) => {
      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    });
    return formatedResults;
  } catch (error) {
    throw new Error(error);
  }
};

const deletFilesFromCloudinary = async (public_ids) => {
  // const cloudinary = require("cloudinary").v2;
  // cloudinary.config({
  //     cloud_name: process.env.CLOUDINARY_NAME,
  //     api_key: process.env.CLOUDINARY_API_KEY,
  //     api_secret: process.env.CLOUDINARY_API_SECRET,
  // });
  // await cloudinary.api.delete_resources(public_ids);
};
export { deletFilesFromCloudinary, uploadFilesToCloudinary };
