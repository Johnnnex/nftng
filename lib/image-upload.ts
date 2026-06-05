// R2 image upload utility — all images stored in product-images/ folder
// - uploadProductImage: immediate upload, returns URL
// - createDebouncedUploader: debounced uploader that auto-uploads after inactivity
//   Call .flush() to force-upload immediately before form submit.

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadProductImage(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE)
    throw new Error("Image must be under 5 MB");

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

// Debounced uploader — waits delayMs before uploading.
// Typical flow: admin picks an image → timer starts → uploads silently after delay.
// Call flush() to force-upload immediately before form submit.

export type DebouncedUploader = {
  queue: (file: File, onResolved: (url: string) => void, onError: (err: Error) => void) => void;
  flush: () => Promise<void>;
  cancel: () => void;
};

export function createDebouncedUploader(delayMs = 8_000): DebouncedUploader {
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
      const url = await uploadProductImage(file);
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
