"use client";

import React, { useRef } from "react";
import { Paperclip } from "lucide-react";

type Props = {
  onUploadAction: (base64: string, mime: string, filename: string) => void;
};

export default function AttachmentPicker({ onUploadAction }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const accept =
    "image/webp,image/png,image/jpeg,image/jpg,image/svg+xml,image/gif,image/heif,image/heic,image/avif";

  const allowedExts = new Set([
    "webp",
    "png",
    "jpeg",
    "jpg",
    "svg",
    "gif",
    "heif",
    "heic",
    "avif",
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tryAccept = () => {
      const fileType = (file.type || "").toLowerCase();
      if (fileType.startsWith("image/")) return true;
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      return allowedExts.has(ext);
    };

    if (!tryAccept()) {
      // silently ignore unsupported file
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string; // data:<mime>;base64,xxxxx
      const comma = result.indexOf(",");
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      const mimeMatch = result.match(/^data:(.*);base64,/);
      const mime = mimeMatch ? mimeMatch[1] : file.type || "image/png";
      onUploadAction(base64, mime, file.name);
      if (inputRef.current) inputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
        aria-hidden
      />
      <button
        onClick={() => inputRef.current?.click()}
        aria-label="Attach"
        className="p-1 rounded-full hover:bg-white/5"
        title="Attach image"
      >
        <Paperclip size={18} />
      </button>
    </>
  );
}
