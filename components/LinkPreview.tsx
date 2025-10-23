"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useGetLinkPreview } from "@/features/link/use-get-linkPreview";

interface LinkPreviewProps {
  url: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const { data, isLoading, isError } = useGetLinkPreview(url);

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 animate-pulse max-w-xl">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (isError || !data?.success || !data?.metadata) {
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

  const preview = data.metadata;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors my-3 max-w-md"
    >
      {/* Left side image */}
      {preview.image && (
        <div className="relative w-28 h-28 flex-shrink-0 bg-gray-100">
          <Image
            src={preview.image}
            alt={preview.title || "Preview image"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Right side content */}
      <div className="p-3 flex flex-col justify-between w-full">
        <div>
          {preview.siteName && (
            <p className="text-[10px] text-gray-500 mb-0.5">{preview.siteName}</p>
          )}
          {preview.title && (
            <h3 className="font-medium text-sm text-gray-900 mb-0.5 line-clamp-2">
              {preview.title}
            </h3>
          )}
          {preview.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {preview.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
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
