// Video files are large (trailer.mp4 alone is 126MB — over GitHub's 100MB
// per-file limit), so they're excluded from the repo and served from
// external storage (e.g. Vercel Blob, R2, S3) in production. Set
// NEXT_PUBLIC_VIDEO_BASE_URL to that storage's base URL; falls back to the
// local /public/video folder for development.
const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? "/video";

export function videoSrc(filename: string): string {
  return `${VIDEO_BASE_URL}/${filename}`;
}
