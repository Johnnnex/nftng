/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

const _numeric = customAlphabet("0123456789", 9);
export const generateOrderRef = () => "ORD-" + _numeric();

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/** Convert a UTC ISO string to the `YYYY-MM-DDThh:mm` format that datetime-local inputs expect (local time). */
export function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

export function parseMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let listType = "";

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = "";
    }
  };

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineMarkdown(hMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      out.push("<hr />");
      continue;
    }

    const ulMatch = line.match(/^\s*[-*+]\s+(.*)/);
    if (ulMatch) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (olMatch) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      out.push("");
      continue;
    }

    closeList();
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return out.join("\n");
}
