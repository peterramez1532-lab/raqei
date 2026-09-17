import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

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
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please select a file.",
        },
        { status: 400 }
      );
    }

    const fileType = file.type;

    const isImage = imageTypes.includes(fileType);
    const isVideo = videoTypes.includes(fileType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Supported formats: JPG, PNG, WEBP, AVIF, GIF, MP4, WEBM and MOV.",
        },
        { status: 400 }
      );
    }

    const maxSize = isVideo
      ? MAX_VIDEO_SIZE
      : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video size must be less than 50MB."
            : "Image size must be less than 10MB.",
        },
        { status: 400 }
      );
    }

    const extension = extensionMap[fileType];

    if (!extension) {
      return NextResponse.json(
        {
          error: "Unsupported file type.",
        },
        { status: 400 }
      );
    }

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const url = `/uploads/products/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      type: isVideo ? "VIDEO" : fileType === "image/gif" ? "GIF" : "IMAGE",
    });
  } catch (error) {
    console.error("FILE UPLOAD ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to upload file.",
      },
      { status: 500 }
    );
  }
}