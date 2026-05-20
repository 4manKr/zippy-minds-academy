import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Universal file storage helper.
 * - If BLOB_READ_WRITE_TOKEN is set  → use Vercel Blob (production)
 * - Otherwise                        → save to /public/uploads (local dev / self-hosted)
 */

export async function storeFile(
  file: File,
  folder: string,         // e.g. "tutor-materials/userId" or "recordings/userId"
): Promise<{ url: string; size: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;

  const kb = file.size / 1024;
  const size =
    kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;

  // ── Vercel Blob ────────────────────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${fileName}`, file, { access: "public" });
    return { url: blob.url, size };
  }

  // ── Local filesystem fallback ──────────────────────────────────────────────
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, fileName);
  const buffer   = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  const url = `/uploads/${folder}/${fileName}`;
  return { url, size };
}

/**
 * Delete a previously stored file (Vercel Blob or local).
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    if (fileUrl.includes("blob.vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(fileUrl);
    } else if (fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", fileUrl);
      await unlink(filePath).catch(() => {/* already gone */});
    }
  } catch {
    // Ignore deletion errors — file may already be removed
  }
}
