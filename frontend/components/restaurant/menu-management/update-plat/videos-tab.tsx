"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Trash2, Video, X } from "lucide-react";

interface VideosTabProps {
  existingVideos: string[];
  setExistingVideos: React.Dispatch<React.SetStateAction<string[]>>;
  videoFiles: File[];
  setVideoFiles: React.Dispatch<React.SetStateAction<File[]>>;
  videoPreviews: string[];
  setVideoPreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export function VideosTab({
  existingVideos,
  setExistingVideos,
  videoFiles,
  setVideoFiles,
  videoPreviews,
  setVideoPreviews,
}: VideosTabProps) {
  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      // Update state with new files and preview URLs
      setVideoFiles((prev) => [...prev, ...newFiles]);
      setVideoPreviews((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove new video from preview
  const removeNewVideo = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(videoPreviews[index]);

    // Remove the video and its preview URL from state
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing video
  const removeExistingVideo = (index: number) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Existing Videos */}
      {existingVideos.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Vidéos existantes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {existingVideos.map((video, index) => (
              <div key={`existing-video-${index}`} className="relative group">
                <div className="aspect-video relative rounded-md overflow-hidden border bg-gray-100">
                  <video
                    src={process.env.NEXT_PUBLIC_APP_URL + video}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingVideo(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Videos Upload */}
      <div>
        <h3 className="text-lg font-medium mb-2">
          Ajouter de nouvelles vidéos
        </h3>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Video className="h-12 w-12 text-muted-foreground mb-2" />
            <span className="text-sm font-medium mb-1">
              Cliquez pour télécharger des vidéos
            </span>
            <span className="text-xs text-muted-foreground">
              MP4, MOV, AVI jusqu&apos;à 50MB
            </span>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleVideoUpload}
            />
          </label>
        </div>
      </div>

      {/* New Video Previews */}
      {videoPreviews.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            Nouvelles vidéos à ajouter
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videoPreviews.map((url, index) => (
              <div key={`new-video-${index}`} className="relative group">
                <div className="aspect-video relative rounded-md overflow-hidden border bg-gray-100">
                  <video
                    src={url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge className="absolute top-1 left-1 bg-green-500">
                  Nouveau
                </Badge>
                <button
                  type="button"
                  onClick={() => removeNewVideo(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
