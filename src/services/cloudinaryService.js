// src/services/cloudinaryService.js

/**
 * Uploads a file to Cloudinary using the default preset.
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
export const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    // Keeping "goldbag" as the upload preset to avoid breaking existing Cloudinary bucket configurations
    formData.append("upload_preset", "goldbag");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/dhgqlxsgn/image/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.secure_url;
};
