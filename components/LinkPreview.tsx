"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url: string;
  siteName?: string | null;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return; // prevent unnecessary fetch calls if url is empty

    const fetchPreview = async () => {
      try {
        const response = await fetch("/api/link-preview/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (response.ok && data?.success && data?.metadata) {
          setPreview(data.metadata);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 animate-pulse max-w-xl">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
      >
        {url}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors my-4 max-w-xl"
    >
      {preview.image && (
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={preview.image}
            alt={preview.title || "Preview image"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-4">
        {preview.siteName && (
          <p className="text-xs text-gray-500 mb-1">{preview.siteName}</p>
        )}
        {preview.title && (
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {preview.title}
          </h3>
        )}
        {preview.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {preview.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <ExternalLink className="h-3 w-3" />
          <span className="truncate">
            {(() => {
              try {
                return new URL(preview.url).hostname;
              } catch {
                return preview.url;
              }
            })()}
          </span>
        </div>
      </div>
    </a>
  );
}
