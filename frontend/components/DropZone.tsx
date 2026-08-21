"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  "image/jpeg":       [".jpg", ".jpeg"],
  "image/png":        [".png"],
  "image/heic":       [".heic"],
  "image/webp":       [".webp"],
  "application/pdf":  [".pdf"],
};

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { errors: readonly { message: string }[] }[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        const msg = rejectedFiles[0]?.errors[0]?.message ?? "Invalid file";
        setError(msg);
        return;
      }
      if (acceptedFiles.length > 0) {
        onFile(acceptedFiles[0]);
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-200",
          isDragActive && !isDragReject && "scale-[1.01]",
          disabled && "cursor-not-allowed opacity-50"
        )}
        style={{
          background: isDragActive && !isDragReject
            ? "rgba(232,168,56,0.06)"
            : isDragReject
            ? "rgba(201,100,66,0.06)"
            : "rgba(31,26,20,0.6)",
          borderColor: isDragActive && !isDragReject
            ? "rgba(232,168,56,0.5)"
            : isDragReject
            ? "rgba(201,100,66,0.5)"
            : "rgba(232,168,56,0.18)",
        }}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-200"
          style={{
            background: isDragActive && !isDragReject
              ? "rgba(232,168,56,0.15)"
              : "rgba(232,168,56,0.06)",
            border: "1px solid rgba(232,168,56,0.15)",
          }}
        >
          {isDragActive && !isDragReject ? (
            /* Upward arrow */
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 28V10M10 18l8-8 8 8" stroke="#e8a838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : isDragReject ? (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="14" stroke="#c96442" strokeWidth="1.5"/>
              <path d="M13 13l10 10M23 13L13 23" stroke="#c96442" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            /* Document + image icon */
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="6" y="4" width="18" height="24" rx="3" stroke="#e8a838" strokeWidth="1.5"/>
              <path d="M10 12h10M10 17h10M10 22h6" stroke="#e8a838" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="18" y="18" width="12" height="12" rx="2" fill="#1f1a14" stroke="#c96442" strokeWidth="1.5"/>
              <path d="M21 26l2-3 2 2 1.5-2" stroke="#c96442" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Text */}
        {isDragActive && !isDragReject ? (
          <p className="text-gold-400 text-xl font-semibold" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            Drop it here!
          </p>
        ) : isDragReject ? (
          <p className="text-clay-400 text-xl font-semibold" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            File type not supported
          </p>
        ) : (
          <>
            <p
              className="text-parchment-200 text-xl mb-2"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              Drop your homework here
            </p>
            <p className="text-parchment-500 text-sm font-light">
              or{" "}
              <span className="text-gold-400 hover:text-gold-300 underline underline-offset-2 cursor-pointer transition-colors">
                browse files
              </span>
            </p>
          </>
        )}

        {/* File type badges */}
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          {["PDF", "JPG", "PNG", "HEIC", "WEBP"].map((type) => (
            <span
              key={type}
              className="text-xs px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(232,168,56,0.07)",
                color: "#a89070",
                border: "1px solid rgba(232,168,56,0.12)",
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-clay-400 text-sm px-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
