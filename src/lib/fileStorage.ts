/**
 * Universal file storage helper.
 *
 * Priority:
 *  1. Vercel Blob  — when BLOB_READ_WRITE_TOKEN is set in env
 *  2. Local /public/uploads  — for local dev / self-hosted servers
 *
 * NOTE: upload routes must export  `export const runtime = "nodejs"`
 *       so that Node.js fs APIs are available.
 */

export async function storeFile(
  file: File,
  folder: string,   // e.g. "tutor-materials/userId" or "recordings/userId"
): Promise<{ url: string; size: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;

  const kb = file.size / 1024;
  const size =
    kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;

  // ── 1. Vercel Blob ──────────────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${fileName}`, file, { access: "public" });
    return { url: blob.url, size };
  }

  // ── 2. Local filesystem ─────────────────────────────────────────────────
  // Dynamic imports so the Node.js modules are only loaded in Node runtime
  const { writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");

  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true }); // no-op if already exists

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, fileName), buffer);

  return { url: `/uploads/${folder}/${fileName}`, size };
}

/**
 * Delete a previously stored file.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  try {
    if (fileUrl.includes("blob.vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(fileUrl);
    } else if (fileUrl.startsWith("/uploads/")) {
      const { unlink } = await import("fs/promises");
      const { join } = await import("path");
      await unlink(join(process.cwd(), "public", fileUrl)).catch(() => {});
    }
  } catch {
    // Ignore — file may already be gone
  }
}
