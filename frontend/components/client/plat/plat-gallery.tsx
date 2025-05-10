"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PlatGalleryProps {
  images: string[];
  videos: string[];
}

export default function PlatGallery({ images, videos }: PlatGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allMedia = [...images, ...videos];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const isVideo = (path: string) => {
    return (
      path.endsWith(".mp4") || path.endsWith(".mov") || path.endsWith(".avi")
    );
  };

  return (
    <div className="space-y-4">
      {/* Main display */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[16/9]">
        {allMedia.length > 0 ? (
          <>
            {isVideo(allMedia[currentIndex]) ? (
              <div className="w-full h-full flex items-center justify-center">
                <video
                  src={process.env.NEXT_PUBLIC_APP_URL + allMedia[currentIndex]}
                  className="w-full h-full object-cover"
                  controls
                  poster="/placeholder.svg?height=500&width=800"
                />
              </div>
            ) : (
              <Image
                width={200}
                height={200}
                src={
                  process.env.NEXT_PUBLIC_APP_URL + allMedia[currentIndex] ||
                  "/placeholder.svg?height=500&width=800"
                }
                alt="Dish"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openLightbox(currentIndex)}
              />
            )}

            {allMedia.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white/90"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white/90"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Image
              width={100}
              height={100}
              src="/placeholder.svg?height=500&width=800"
              alt="No image available"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
          {allMedia.map((media, index) => (
            <div
              key={index}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2",
                currentIndex === index ? "border-primary" : "border-transparent"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              {isVideo(media) ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <video src={media} className="w-full h-full object-cover" />
                </div>
              ) : (
                <Image
                  width={100}
                  height={100}
                  src={
                    process.env.NEXT_PUBLIC_APP_URL + media ||
                    "/placeholder.svg"
                  }
                  alt={`Thumbnail ${index}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <Image
              width={100}
              height={100}
              src={
                process.env.NEXT_PUBLIC_APP_URL + allMedia[lightboxIndex] ||
                "/placeholder.svg"
              }
              alt="Enlarged view"
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
