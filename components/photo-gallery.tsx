"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, Download, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGalleryProps {
  photos: string[];
  columns?: number;
  useCompactLayout?: boolean;
}

export default function PhotoGallery({
  photos,
  columns = 2,
  useCompactLayout = false,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a grid template based on the number of columns
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: useCompactLayout ? "0.5rem" : "0.75rem",
  };

  const handleDownload = async (photoUrl: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `snap-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download photo");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (photoUrl: string) => {
    try {
      setIsLoading(true);
      if (navigator.share) {
        await navigator.share({
          title: "Shared Snap",
          text: "Check out this photo!",
          url: photoUrl,
        });
      } else {
        await navigator.clipboard.writeText(photoUrl);
        setError("Link copied to clipboard!");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError("Failed to share photo");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={useCompactLayout ? "mt-1" : "mt-2 sm:mt-4"}>
      <div className="flex items-center justify-between mb-1 sm:mb-4">
        <h2
          className={`${
            useCompactLayout ? "text-sm" : "text-base sm:text-xl"
          } font-bold text-blue-800 flex items-center`}
        >
          <Camera
            className={`${
              useCompactLayout
                ? "h-3 w-3 mr-1"
                : "h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
            } text-blue-600`}
          />
          Your Snaps
        </h2>
        <div
          className={`${
            useCompactLayout ? "text-xs" : "text-xs sm:text-sm"
          } text-blue-600`}
        >
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div style={gridStyle}>
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div
              className={`rounded-lg overflow-hidden shadow-md ${
                useCompactLayout
                  ? "border border-blue-200"
                  : "border-2 border-blue-200"
              }`}
            >
              <div className="aspect-square relative">
                <Image
                  src={photo || "/placeholder.svg"}
                  alt={`Captured photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes={`(max-width: 640px) ${
                    100 / columns
                  }vw, (max-width: 1024px) ${100 / columns}vw, ${
                    100 / columns
                  }vw`}
                  priority={index < 4}
                />
              </div>
            </div>
            <div
              className={`absolute bottom-2 left-2 bg-black/50 text-white rounded-full
              ${
                useCompactLayout
                  ? "text-[10px] px-1.5 py-0.5"
                  : "text-xs px-2 py-0.5 sm:py-1"
              }`}
            >
              Snap {index + 1}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      >
        <DialogContent
          className={`p-2 max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] bg-blue-50 border-blue-300
          ${useCompactLayout ? "sm:p-2" : ""}`}
        >
          {selectedPhoto && (
            <>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src={selectedPhoto || "/placeholder.svg"}
                  alt="Selected photo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 80vw"
                  priority
                />
              </div>
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  className={`flex items-center gap-1 ${
                    useCompactLayout ? "text-xs" : "text-xs sm:text-sm"
                  }`}
                  onClick={() => handleDownload(selectedPhoto)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2
                      className={`${
                        useCompactLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"
                      } animate-spin`}
                    />
                  ) : (
                    <Download
                      className={
                        useCompactLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"
                      }
                    />
                  )}
                  Save
                </Button>
                <Button
                  variant="outline"
                  className={`flex items-center gap-1 ${
                    useCompactLayout ? "text-xs" : "text-xs sm:text-sm"
                  }`}
                  onClick={() => handleShare(selectedPhoto)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2
                      className={`${
                        useCompactLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"
                      } animate-spin`}
                    />
                  ) : (
                    <Share2
                      className={
                        useCompactLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"
                      }
                    />
                  )}
                  Share
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
