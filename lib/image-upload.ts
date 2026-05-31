// Cloudflare Images upload utility
// - uploadImageToCloudflare: immediate upload, returns URL
// - createDebouncedUploader: returns a debounced uploader that auto-uploads after 60s of inactivity
//   If the file changes before the timer fires, the previous timer is cancelled.
//   Call .flush() to force-upload immediately (used when submitting the form before the timer fires).

type UploadResult = { url: string } | null;

export async function uploadImageToCloudflare(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/admin/products/image", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Image upload failed");
  }

  const data: { data: { url: string } } = await res.json();
  return data.data.url;
}

// Debounced uploader — waits 60 seconds before uploading.
// Typical flow: admin picks an image → timer starts → 60s later it uploads silently.
// If they click "Submit" before 60s, call flush() which uploads immediately and clears the timer.

export type DebouncedUploader = {
  queue: (file: File, onResolved: (url: string) => void, onError: (err: Error) => void) => void;
  flush: () => Promise<void>;
  cancel: () => void;
};

export function createDebouncedUploader(delayMs = 60_000): DebouncedUploader {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { file: File; onResolved: (url: string) => void; onError: (err: Error) => void } | null = null;

  const clearTimer = () => {
    if (timer !== null) { clearTimeout(timer); timer = null; }
  };

  const run = async () => {
    if (!pending) return;
    const { file, onResolved, onError } = pending;
    pending = null;
    try {
      const url = await uploadImageToCloudflare(file);
      onResolved(url);
    } catch (e) {
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  return {
    queue(file, onResolved, onError) {
      clearTimer();
      pending = { file, onResolved, onError };
      timer = setTimeout(() => { timer = null; run(); }, delayMs);
    },
    async flush() {
      clearTimer();
      await run();
    },
    cancel() {
      clearTimer();
      pending = null;
    },
  };
}
