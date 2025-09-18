import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured" },
        { status: 500 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error(`Invalid file type: ${file.name}`);
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File too large: ${file.name}`);
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate signature for authentication
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHash("sha1")
        .update(`timestamp=${timestamp}${apiSecret}`)
        .digest("hex");

      // Create form data for Cloudinary upload
      const uploadFormData = new FormData();
      uploadFormData.append(
        "file",
        new Blob([buffer], { type: file.type }),
        file.name
      );
      uploadFormData.append("timestamp", timestamp.toString());
      uploadFormData.append("signature", signature);
      uploadFormData.append("api_key", apiKey);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Cloudinary upload failed:", errorData);
        throw new Error(`Upload failed for ${file.name}`);
      }

      const data = await response.json();
      return { url: data.secure_url, filename: file.name };
    });

    const results = await Promise.all(uploadPromises);
    return NextResponse.json({ urls: results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
