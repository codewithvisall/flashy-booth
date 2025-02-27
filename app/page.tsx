"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Filter = {
  name: string;
  class: string;
  emoji: string;
};

type TimerOption = {
  value: string;
  label: string;
  emoji: string;
  seconds: number;
};

const FILTERS: Filter[] = [
  { name: "normal", class: "", emoji: "🌟" },
  { name: "grayscale", class: "filter grayscale", emoji: "🖤" },
  { name: "sepia", class: "filter sepia", emoji: "🤎" },
  { name: "pink-tint", class: "filter pink-tint", emoji: "💗" },
  { name: "dreamy", class: "filter dreamy", emoji: "✨" },
  { name: "vintage", class: "filter vintage", emoji: "📷" },
];

const TIMER_OPTIONS: TimerOption[] = [
  { value: "immediate", label: "Immediate", emoji: "⚡", seconds: 0 },
  { value: "5sec", label: "5 Seconds", emoji: "⏱️", seconds: 5 },
  { value: "10sec", label: "10 Seconds", emoji: "⏰", seconds: 10 },
  { value: "15sec", label: "15 Seconds", emoji: "⌛", seconds: 15 },
];

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<Filter>(FILTERS[0]);
  const [photosRemaining, setPhotosRemaining] = useState(8);
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(
    TIMER_OPTIONS[0]
  );
  const [showPreview, setShowPreview] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Unable to access camera. Please make sure you have granted camera permissions."
      );
    }
  };

  const takePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Save the context state
        ctx.save();

        // Scale horizontally to un-mirror the image
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        // Draw the video frame
        ctx.drawImage(videoRef.current, 0, 0);

        // Restore the context state
        ctx.restore();

        // Apply filters based on selection
        switch (selectedFilter.name) {
          case "grayscale":
            applyGrayscale(ctx, canvas.width, canvas.height);
            break;
          case "sepia":
            applySepia(ctx, canvas.width, canvas.height);
            break;
          case "pink-tint":
            applyPinkTint(ctx, canvas.width, canvas.height);
            break;
          case "dreamy":
            applyDreamy(ctx, canvas.width, canvas.height);
            break;
          case "vintage":
            applyVintage(ctx, canvas.width, canvas.height);
            break;
        }

        const photoData = canvas.toDataURL("image/jpeg");
        setPhotos((prev) => [...prev, photoData]);
        setPhotosRemaining((prev) => prev - 1);
      }
    }
  }, [selectedFilter]);

  // Filter application functions
  const applyGrayscale = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const applySepia = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // red
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // green
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const applyPinkTint = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.2); // Increase red
      data[i + 1] = data[i + 1] * 0.9; // Decrease green slightly
      data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Increase blue slightly
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const applyDreamy = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Create a temporary canvas for the blur effect
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Copy the original image to temp canvas
    tempCtx.drawImage(ctx.canvas, 0, 0);

    // Apply blur
    ctx.filter = "blur(2px)";
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = "none";

    // Then adjust brightness and contrast
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Increase brightness and add a soft glow effect
      data[i] = Math.min(255, data[i] * 1.1 + 10); // red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1 + 10); // green
      data[i + 2] = Math.min(255, data[i + 2] * 1.1 + 10); // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const applyVintage = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Apply a vintage look
      data[i] = Math.min(255, r * 0.9 + g * 0.2 + b * 0.1); // red
      data[i + 1] = Math.min(255, r * 0.2 + g * 0.9 + b * 0.1); // green
      data[i + 2] = Math.min(255, r * 0.1 + g * 0.1 + b * 0.9); // blue

      // Add a slight sepia tone
      data[i] = Math.min(255, data[i] * 1.07);
      data[i + 1] = Math.min(255, data[i + 1] * 0.98);
      data[i + 2] = Math.min(255, data[i + 2] * 0.9);
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const startPhotoSequence = () => {
    setIsCapturing(true);
    if (selectedTimer.seconds === 0) {
      // For immediate capture, take photo right away
      takePhoto();
      if (photosRemaining > 1) {
        // Reset for next photo
        setIsCapturing(false);
      } else {
        setIsCapturing(false);
      }
    } else {
      // For timed capture, start countdown
      setCountdown(selectedTimer.seconds);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCapturing && selectedTimer.seconds > 0) {
      if (countdown === null) {
        setCountdown(selectedTimer.seconds);
      } else if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        takePhoto();
        if (photosRemaining > 1) {
          // Reset for next photo
          setIsCapturing(false);
          setCountdown(null);
        } else {
          setIsCapturing(false);
          setCountdown(null);
        }
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    isCapturing,
    countdown,
    takePhoto,
    photosRemaining,
    selectedTimer.seconds,
  ]);

  // Add a cleanup effect when changing timer modes
  useEffect(() => {
    // Reset capturing state and countdown when changing timer modes
    setIsCapturing(false);
    setCountdown(null);
  }, [selectedTimer]);

  const previewPhotoStrip = () => {
    setShowPreview(true);
  };

  const downloadPhotos = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set the canvas size for the photo strip with 2 columns
    const photoWidth = 600;
    const photoHeight = 450;
    const padding = 20;
    const columns = 2;
    const rows = Math.ceil(photos.length / columns);

    // Calculate canvas dimensions for 2-column layout
    canvas.width = photoWidth * columns + padding * (columns + 1);
    canvas.height = photoHeight * rows + padding * (rows + 1);

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add cute border
    ctx.strokeStyle = "#ff69b4";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Load and draw each photo in a grid
    const loadPhoto = (photoData: string, index: number) => {
      return new Promise<void>((resolve) => {
        const img = document.createElement("img");
        img.onload = () => {
          // Calculate grid position
          const row = Math.floor(index / columns);
          const col = index % columns;
          const x = padding + col * (photoWidth + padding);
          const y = padding + row * (photoHeight + padding);

          // Draw photo with a cute border
          ctx.save();
          // Add a subtle shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          // Draw white background for each photo
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, photoWidth, photoHeight);
          // Draw the photo
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
          // Add a thin pink border around each photo
          ctx.strokeStyle = "#ff69b4";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, photoWidth, photoHeight);
          ctx.restore();
          resolve();
        };
        img.src = photoData;
      });
    };

    // Load all photos and then create download
    Promise.all(photos.map((photo, index) => loadPhoto(photo, index))).then(
      () => {
        // Add decorative header
        ctx.save();
        // Add shadow to text
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        // Draw text
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ff69b4";
        ctx.textAlign = "center";
        ctx.fillText("💕 Our Cute Photos 💕", canvas.width / 2, padding + 10);
        ctx.restore();

        // Add date at the bottom
        ctx.font = "20px Arial";
        ctx.fillStyle = "#ff69b4";
        ctx.textAlign = "center";
        const date = new Date().toLocaleDateString();
        ctx.fillText(date, canvas.width / 2, canvas.height - padding / 2);

        // Create the download
        const link = document.createElement("a");
        link.download = `photostrip-${new Date().toISOString()}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
      }
    );
  };

  const resetPhotos = () => {
    setPhotos([]);
    setPhotosRemaining(8);
    setSelectedFilter(FILTERS[0]);
    setSelectedTimer(TIMER_OPTIONS[0]);
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-pink-100 p-8">
        <Card className="w-full max-w-5xl mx-auto shadow-xl border-2 border-pink-200 bg-white/90 backdrop-blur">
          <div className="p-8 space-y-6">
            {/* Header with decorative elements */}
            <div className="relative text-center">
              <h1 className="text-4xl font-bold text-pink-600 mb-2">
                💝 Cute Couple Photobooth 💝
              </h1>
              <p className="text-pink-400 text-sm">
                Capture your sweet moments together ✨
              </p>
              <div className="absolute -top-4 -left-4 text-4xl animate-bounce">
                🌸
              </div>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-100">
                🌸
              </div>
            </div>

            <div className="flex gap-8">
              {/* Camera Preview */}
              <div className="flex-1 relative">
                <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-pink-200 shadow-lg bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover camera-preview ${selectedFilter.class}`}
                  />
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                          📸
                        </div>
                        <div className="bg-black/30 backdrop-blur-[2px] rounded-full w-32 h-32 flex items-center justify-center">
                          <span className="text-8xl font-bold text-white countdown-number drop-shadow-lg">
                            {countdown}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-pink-50/90">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📸</div>
                        <p className="text-pink-600 font-medium mb-4">
                          Ready to take some cute photos?
                        </p>
                        <Button
                          onClick={startCamera}
                          className="bg-pink-500 hover:bg-pink-600 transform hover:scale-105 transition-all"
                        >
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filters */}
                <div className="mt-6">
                  <h3 className="text-center font-medium text-pink-600 mb-3">
                    Choose your style ✨
                  </h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {FILTERS.map((filter) => (
                      <Button
                        key={filter.name}
                        onClick={() => setSelectedFilter(filter)}
                        className={`${
                          selectedFilter.name === filter.name
                            ? "ring-4 ring-pink-300 scale-105"
                            : ""
                        } bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 transition-all shadow-md`}
                      >
                        {filter.emoji} {filter.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Strip */}
              <div className="w-80 bg-white rounded-2xl shadow-lg border-2 border-pink-200 p-4 space-y-3">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-pink-600 text-lg">
                    Photo Strip
                  </h3>
                  <p className="text-pink-400 text-xs">
                    {8 - photosRemaining} / 8 photos
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-pink-50">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-pink-200 transition-transform transform group-hover:scale-105">
                        <Image
                          width={400}
                          height={300}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-pink-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-pink-600 border border-pink-300">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-4 bg-pink-50 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-pink-600 font-medium">Timer:</span>
                  <Select
                    value={selectedTimer.value}
                    onValueChange={(value) => {
                      const timer = TIMER_OPTIONS.find(
                        (t) => t.value === value
                      );
                      if (timer) setSelectedTimer(timer);
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMER_OPTIONS.map((timer) => (
                        <SelectItem
                          key={timer.value}
                          value={timer.value}
                          className="cursor-pointer"
                        >
                          {timer.emoji} {timer.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                {cameraActive && photosRemaining > 0 && !isCapturing && (
                  <Button
                    onClick={startPhotoSequence}
                    className="bg-pink-500 hover:bg-pink-600 transform hover:scale-105 transition-all text-lg px-8"
                  >
                    {selectedTimer.seconds > 0
                      ? `Take Photos with ${selectedTimer.label} Timer 📸`
                      : "Take Photos Now! 📸"}
                  </Button>
                )}

                {photos.length > 0 && (
                  <>
                    <Button
                      onClick={previewPhotoStrip}
                      className="bg-purple-500 hover:bg-purple-600 transform hover:scale-105 transition-all text-lg px-8"
                    >
                      Preview Photo Strip 👀
                    </Button>
                    <Button
                      onClick={downloadPhotos}
                      className="bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all text-lg px-8"
                    >
                      Download Photo Strip 💝
                    </Button>
                    <Button
                      onClick={resetPhotos}
                      className="bg-pink-500 hover:bg-pink-600 transform hover:scale-105 transition-all text-lg px-8"
                    >
                      Start Over 🔄
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-pink-600 text-center flex items-center justify-center gap-2">
              <span>✨</span> Preview Your Photo Strip <span>✨</span>
            </DialogTitle>
            <DialogDescription className="text-center text-pink-400">
              Here&apos;s how your photo strip will look when downloaded!
            </DialogDescription>
          </DialogHeader>
          <div className="relative bg-white rounded-xl p-6 shadow-inner">
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 border-pink-200 shadow-md group"
                >
                  <Image
                    width={600}
                    height={450}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute -top-2 -right-2 bg-pink-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-pink-600 border-2 border-pink-300 shadow-md">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 hover:bg-gray-600 transform hover:scale-105 transition-all"
              >
                Close Preview 🔍
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  downloadPhotos();
                }}
                className="bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all"
              >
                Download Now 💝
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
