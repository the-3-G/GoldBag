// src/services/depositService.js
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "./cloudinaryService";

/**
 * Submit a deposit request
 */
export const submitDeposit = async (uid, amount, asset, proofFile) => {
    try {
        let proofUrl = null;

        // Upload proof file to Cloudinary if provided
        if (proofFile) {
            proofUrl = await uploadImageToCloudinary(proofFile);
        }

        const depositData = {
            uid,
            amount: parseFloat(amount),
            asset: asset || "BTC",
            method: "Crypto Transfer",
            transactionId: proofFile ? proofFile.name : "No Proof", // Keep filename as reference
            proofUrl: proofUrl, // Save the Cloudinary URL
            status: "pending",
            createdAt: new Date(),
            processedAt: null
        };

        const docRef = await addDoc(collection(db, "deposits"), depositData);

        return {
            success: true,
            depositId: docRef.id
        };
    } catch (error) {
        console.error("Error submitting deposit:", error);
        throw error;
    }
};
