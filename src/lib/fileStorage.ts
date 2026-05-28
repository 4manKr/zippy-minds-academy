/**
 * Universal file storage helper.
 *
 * Priority:
 *  1. Cloudinary  — when CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET are set
 *  2. Local /public/uploads  — fallback for local dev without Cloudinary creds
 *
 * NOTE: upload routes must export  `export const runtime = "nodejs"`
 *       so that Node.js APIs are available.
 */

export async function storeFile(
  file: File,
  folder: string, // e.g. "course-thumbnails" or "blog-thumbnails"
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

    // Convert File → Buffer → base64 data URI for the upload API
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const base64      = buffer.toString("base64");
    const dataUri     = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
      // Auto-generate a unique public_id based on timestamp
      use_filename:       false,
      unique_filename:    true,
      overwrite:          false,
      // Optional: auto-optimize quality
      quality:            "auto",
      fetch_format:       "auto",
    });

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
 * Supports Cloudinary URLs and local /uploads/ paths.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  try {
    if (fileUrl.includes("res.cloudinary.com")) {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<id>.<ext>
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
      if (match) {
        const { v2: cloudinary } = await import("cloudinary");
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key:    process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure:     true,
        });
        await cloudinary.uploader.destroy(match[1]);
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
