
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const extensionMap: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const imageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const videoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: Request) {
  try {
    // Make sure the current user is an admin.
    await requireAdmin();

    // Read the uploaded file from the request.
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select a file.",
        },
        { status: 400 }
      );
    }

    const fileType = file.type;
    const isImage = imageTypes.includes(fileType);
    const isVideo = videoTypes.includes(fileType);

    // Validate the file type.
    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supported formats: JPG, PNG, WEBP, AVIF, GIF, MP4, WEBM and MOV.",
        },
        { status: 400 }
      );
    }

    // Validate the file size.
    const maxSize = isVideo
      ? MAX_VIDEO_SIZE
      : MAX_IMAGE_SIZE;

    if (file.size === 0 || file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: isVideo
            ? "Video must be larger than 0 and no more than 50MB."
            : "Image must be larger than 0 and no more than 10MB.",
        },
        { status: 400 }
      );
    }

    const extension = extensionMap[fileType];

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file extension.",
        },
        { status: 400 }
      );
    }

    // Generate a unique storage path for every upload.
    const fileName = `products/${crypto.randomUUID()}.${extension}`;

    // Upload to persistent Vercel Blob storage.
    // BLOB_READ_WRITE_TOKEN must be configured in Vercel.
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: fileType,
    });

    // Return the public URL expected by the admin UI.
    return NextResponse.json({
      success: true,
      url: blob.url,
      type: isVideo
        ? "VIDEO"
        : fileType === "image/gif"
          ? "GIF"
          : "IMAGE",
    });
  } catch (error) {
    console.error("FILE UPLOAD ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file. Check server logs and Blob configuration.",
      },
      { status: 500 }
    );
  }
}
