/**
 * Universal file storage helper.
 *
 * Priority:
 *  1. Cloudinary  — when CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET are set
 *  2. Local /public/uploads  — fallback for local dev without Cloudinary creds
 *
 * Supports both images (thumbnails) and raw files (PDFs, Word, PPT, etc.)
 *
 * NOTE: upload routes must export  `export const runtime = "nodejs"`
 *       so that Node.js APIs are available.
 */

/** MIME types treated as images by Cloudinary */
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

/**
 * Returns the Cloudinary resource_type for a given MIME type.
 * "image" for images, "raw" for all other files (PDF, Word, PPT…).
 * We avoid "auto" because it cannot be used with base64 data URIs.
 */
function cloudinaryResourceType(mimeType: string): "image" | "raw" {
  return IMAGE_TYPES.has(mimeType) ? "image" : "raw";
}

export async function storeFile(
  file: File,
  folder: string, // e.g. "course-thumbnails", "blog-thumbnails", "tutor-materials/userId"
): Promise<{ url: string; size: string }> {
  const kb   = file.size / 1024;
  const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;

  // ── 1. Cloudinary ───────────────────────────────────────────────────────
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY    &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const { v2: cloudinary } = await import("cloudinary");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure:     true,
    });

    const resourceType = cloudinaryResourceType(file.type);

    // Convert File → Buffer → base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const base64      = buffer.toString("base64");
    const dataUri     = `data:${file.type};base64,${base64}`;

    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type:   resourceType,
      use_filename:    false,
      unique_filename: true,
      overwrite:       false,
    };

    // Only apply image optimizations for actual images
    if (resourceType === "image") {
      uploadOptions.quality     = "auto";
      uploadOptions.fetch_format = "auto";
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
    return { url: result.secure_url, size };
  }

  // ── 2. Local filesystem ─────────────────────────────────────────────────
  const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName  = `${Date.now()}-${safeName}`;

  const { writeFile, mkdir } = await import("fs/promises");
  const { join }             = await import("path");

  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, fileName), buffer);

  return { url: `/uploads/${folder}/${fileName}`, size };
}

/**
 * Delete a previously stored file.
 * Supports Cloudinary URLs (both image and raw) and local /uploads/ paths.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  try {
    if (fileUrl.includes("res.cloudinary.com")) {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure:     true,
      });

      // Detect resource_type from URL:
      // image URL:  .../image/upload/v.../folder/id.ext
      // raw URL:    .../raw/upload/v.../folder/id.ext
      const isRaw = fileUrl.includes("/raw/upload/");
      const resourceType = isRaw ? "raw" : "image";

      // Extract public_id (path after /upload/v12345/ or /upload/)
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match) {
        await cloudinary.uploader.destroy(match[1], { resource_type: resourceType });
      }
    } else if (fileUrl.startsWith("/uploads/")) {
      const { unlink } = await import("fs/promises");
      const { join }   = await import("path");
      await unlink(join(process.cwd(), "public", fileUrl)).catch(() => {});
    }
  } catch {
    // Ignore — file may already be gone
  }
}
