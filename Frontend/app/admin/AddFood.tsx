"use client";

import { useState } from "react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import { createMenuItem } from '../services/api';

export default function AddFood() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [partner, setPartner] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Handle Uploadcare changes
  const handleUpload = (fileInfo: any) => {
    const url =
      fileInfo?.successEntries?.[0]?.cdnUrl ||
      fileInfo?.allEntries?.[0]?.cdnUrl ||
      fileInfo?.cdnUrl;

    if (url) {
      setImgUrl(url);
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!name || !price || !type || !partner) {
      alert("Please fill all fields.");
      return;
    }

    if (!imgUrl) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    try {
      await createMenuItem({
        name: name,
        price: price,
        category: type,  // Maps to your category field
        description: partner,  // Or you can add a separate description field
        image_url: imgUrl,
        available: true
      });

      alert("Food added successfully!");
      console.log({
        name,
        price,
        type,
        partner,
        img: imgUrl,
      });

      // Reset form
      setName("");
      setPrice("");
      setType("");
      setPartner("");
      setImgUrl("");
      setUploading(false);
    } catch (error) {
      console.error('Error adding food:', error);
      alert("Failed to add food. Please try again.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
      <h1 className="text-2xl font-bold mb-4 ">Add Food</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Food name"
        className="border p-2 rounded w-full mb-2"
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="border p-2 rounded w-full mb-2"
      />

      <input
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Type (food / drink)"
        className="border p-2 rounded w-full mb-2"
      />

      <input
        value={partner}
        onChange={(e) => setPartner(e.target.value)}
        placeholder="Partner / Stall Name"
        className="border p-2 rounded w-full mb-4"
      />

      {/* Show loading / preview */} 
      {uploading && <p className="text-gray-500 mb-2">Uploading image...</p>}
      {imgUrl && (
        <img
          src={imgUrl}
          alt="Uploaded food"
          width={150}
          style={{ marginTop: 10, borderRadius: 8 }}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`mt-4 w-full py-2 rounded text-white ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Save
      </button>
    </div>
  );
}