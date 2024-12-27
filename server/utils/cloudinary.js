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
  try {
    const result = await cloudinary.api.delete_resources(public_ids);
    return;
  } catch (error) {
    console.error("Error deleting files from Cloudinary:", error.message);
    throw error;
  }
};
export { deletFilesFromCloudinary, uploadFilesToCloudinary };
