"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

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

type Template = {
  id: string;
  name: string;
  emoji: string;
  borderColor: string;
  bgColor: string;
  decorations: boolean;
  description: string;
};

type Layout = {
  id: string;
  name: string;
  emoji: string;
  columns: number;
  rows: number;
  description: string;
  aspectRatio: number;
  showHeader: boolean;
  showFooter: boolean;
};

type PoseSuggestion = {
  title: string;
  emoji: string;
  description: string;
};

type Sticker = {
  id: string;
  emoji: string;
  name: string;
  category: "love" | "cute" | "text" | "effects";
  scale: number;
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

const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic Pink",
    emoji: "💝",
    borderColor: "#ff69b4",
    bgColor: "#ffffff",
    decorations: false,
    description: "Simple and sweet pink borders",
  },
  {
    id: "hearts",
    name: "Floating Hearts",
    emoji: "💕",
    borderColor: "#ff1493",
    bgColor: "#fff5f8",
    decorations: true,
    description: "Decorated with cute floating hearts",
  },
  {
    id: "flowers",
    name: "Flower Garden",
    emoji: "🌸",
    borderColor: "#ff85a2",
    bgColor: "#f8fff5",
    decorations: true,
    description: "Beautiful floral decorations",
  },
  {
    id: "stars",
    name: "Starry Night",
    emoji: "✨",
    borderColor: "#9370db",
    bgColor: "#f5f5ff",
    decorations: true,
    description: "Magical sparkles and stars",
  },
];

const LAYOUTS: Layout[] = [
  {
    id: "classic-strip",
    name: "Classic Strip",
    emoji: "📜",
    columns: 1,
    rows: 8,
    description: "Traditional single column strip",
    aspectRatio: 0.3, // Taller vertical strip
    showHeader: false,
    showFooter: false,
  },
  {
    id: "grid-2x4",
    name: "Grid 2x4",
    emoji: "🎞️",
    columns: 2,
    rows: 4,
    description: "Modern two column layout",
    aspectRatio: 0.7, // More vertical space for photos
    showHeader: true,
    showFooter: true,
  },
  {
    id: "grid-2x2",
    name: "Square Grid",
    emoji: "⬜",
    columns: 2,
    rows: 2,
    description: "Compact four photo grid",
    aspectRatio: 1.0, // Perfect square
    showHeader: true,
    showFooter: true,
  },
  {
    id: "strip-2x3",
    name: "Strip 2x3",
    emoji: "🎬",
    columns: 2,
    rows: 3,
    description: "Six photo arrangement",
    aspectRatio: 0.8, // Nearly square
    showHeader: true,
    showFooter: true,
  },
];

const POSE_SUGGESTIONS: PoseSuggestion[] = [
  {
    title: "Classic Love",
    emoji: "💑",
    description: "Face each other and smile naturally",
  },
  {
    title: "Heart Hands",
    emoji: "🫰",
    description: "Make half hearts with your hands and combine them",
  },
  {
    title: "Silly Faces",
    emoji: "🤪",
    description: "Make funny faces together - be creative!",
  },
  {
    title: "Back to Back",
    emoji: "🫂",
    description: "Stand back to back and look over your shoulders",
  },
  {
    title: "Forehead Touch",
    emoji: "🥰",
    description: "Touch foreheads and close your eyes",
  },
  {
    title: "Peace & Love",
    emoji: "✌️",
    description: "Peace signs and big smiles",
  },
  {
    title: "The Dip",
    emoji: "💃",
    description: "One partner dips the other - careful now!",
  },
  {
    title: "Pinky Promise",
    emoji: "🤙",
    description: "Link your pinkies and smile at the camera",
  },
];

const STICKERS: Sticker[] = [
  // Love Category
  { id: "heart", emoji: "❤️", name: "Red Heart", category: "love", scale: 1 },
  {
    id: "sparkling-heart",
    emoji: "💖",
    name: "Sparkling Heart",
    category: "love",
    scale: 1,
  },
  { id: "cupid", emoji: "💘", name: "Cupid Heart", category: "love", scale: 1 },
  { id: "kiss", emoji: "💋", name: "Kiss Mark", category: "love", scale: 0.8 },

  // Cute Category
  {
    id: "flower",
    emoji: "🌸",
    name: "Cherry Blossom",
    category: "cute",
    scale: 0.8,
  },
  { id: "sparkles", emoji: "✨", name: "Sparkles", category: "cute", scale: 1 },
  { id: "star", emoji: "⭐", name: "Star", category: "cute", scale: 0.9 },
  { id: "crown", emoji: "👑", name: "Crown", category: "cute", scale: 0.8 },

  // Text Category
  {
    id: "love-text",
    emoji: "LOVE",
    name: "Love Text",
    category: "text",
    scale: 1.2,
  },
  {
    id: "forever",
    emoji: "Forever",
    name: "Forever Text",
    category: "text",
    scale: 1.2,
  },
  { id: "xoxo", emoji: "XOXO", name: "XOXO", category: "text", scale: 1.1 },
  {
    id: "cute",
    emoji: "Cute",
    name: "Cute Text",
    category: "text",
    scale: 1.1,
  },

  // Effects Category
  {
    id: "glow",
    emoji: "🌟",
    name: "Glow Effect",
    category: "effects",
    scale: 1.5,
  },
  {
    id: "sparkle",
    emoji: "✨",
    name: "Sparkle Effect",
    category: "effects",
    scale: 1.3,
  },
  {
    id: "hearts",
    emoji: "💝",
    name: "Floating Hearts",
    category: "effects",
    scale: 1.4,
  },
  {
    id: "stars",
    emoji: "🌠",
    name: "Star Burst",
    category: "effects",
    scale: 1.4,
  },
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
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    TEMPLATES[0]
  );
  const [selectedLayout, setSelectedLayout] = useState<Layout>(LAYOUTS[1]); // Default to grid-2x4
  const [currentPose, setCurrentPose] = useState<PoseSuggestion>(
    POSE_SUGGESTIONS[0]
  );
  const [showPoseGuide, setShowPoseGuide] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<Sticker["category"]>("love");

  useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log("1. Starting camera...");

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser doesn't support camera access");
      }

      // Wait for video element to be available
      let retries = 0;
      while (!videoRef.current && retries < 5) {
        console.log(`Waiting for video element (attempt ${retries + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        retries++;
      }

      if (!videoRef.current) {
        throw new Error("Video element not found after multiple attempts");
      }

      // Stop any existing streams
      if (videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach((track) => track.stop());
      }

      console.log("2. Requesting camera access...");
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("3. Got camera stream:", stream.getVideoTracks()[0].label);

      // Set the stream
      videoRef.current.srcObject = stream;
      console.log("4. Set stream to video element");

      // Explicitly set video element properties
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
      videoRef.current.muted = true;

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        if (!videoRef.current) return reject(new Error("Video element lost"));

        const timeoutId = setTimeout(() => {
          reject(new Error("Video metadata load timeout"));
        }, 5000);

        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          clearTimeout(timeoutId);
          resolve(true);
        };
      });

      await videoRef.current.play().catch((e) => {
        console.error("Play failed:", e);
        throw new Error("Failed to play video: " + e.message);
      });

      console.log("5. Video playback started");
      setCameraActive(true);
      console.log("6. Camera is now active");
    } catch (err) {
      console.error("Detailed camera error:", err);
      let errorMessage = "Unable to access camera. ";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage +=
            "Please grant camera permissions in your browser settings.";
        } else if (err.name === "NotFoundError") {
          errorMessage += "No camera device found. Please connect a camera.";
        } else if (err.name === "NotReadableError") {
          errorMessage += "Camera is in use by another application.";
        } else {
          errorMessage += err.message;
        }
      }

      alert(errorMessage);
      setCameraActive(false);
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

        // Draw stickers
        selectedStickers.forEach((stickerId) => {
          const sticker = STICKERS.find((s) => s.id === stickerId);
          if (!sticker) return;

          // Calculate random position
          const x = canvas.width * (Math.random() * 0.8 + 0.1);
          const y = canvas.height * (Math.random() * 0.8 + 0.1);
          const rotation = Math.random() * 30 - 15;
          const fontSize =
            Math.min(canvas.width, canvas.height) * 0.1 * sticker.scale;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.font = `${fontSize}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sticker.emoji, 0, 0);
          ctx.restore();
        });

        const photoData = canvas.toDataURL("image/jpeg");
        setPhotos((prev) => [...prev, photoData]);
        setPhotosRemaining((prev) => prev - 1);

        // Clear stickers after taking photo
        setSelectedStickers([]);
      }
    }
  }, [selectedFilter, selectedStickers]);

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
    // Pick a random pose suggestion
    const randomPose =
      POSE_SUGGESTIONS[Math.floor(Math.random() * POSE_SUGGESTIONS.length)];
    setCurrentPose(randomPose);
    setShowPoseGuide(true);

    // Hide pose guide after 3 seconds
    setTimeout(() => {
      setShowPoseGuide(false);
      setIsCapturing(true);
      if (selectedTimer.seconds === 0) {
        takePhoto();
        if (photosRemaining > 1) {
          setIsCapturing(false);
        } else {
          setIsCapturing(false);
        }
      } else {
        setCountdown(selectedTimer.seconds);
      }
    }, 3000);
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

    const layout = selectedLayout;
    const totalWidth = 2400; // Base width for high quality
    const totalHeight = Math.round(totalWidth / layout.aspectRatio);

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Calculate photo dimensions based on layout
    const padding = Math.round(totalWidth * 0.02); // 2% of width for padding
    const headerHeight = layout.showHeader ? Math.round(totalHeight * 0.12) : 0; // 12% of height for header
    const footerHeight = layout.showFooter ? Math.round(totalHeight * 0.08) : 0; // 8% of height for footer

    const availableWidth = totalWidth - padding * (layout.columns + 1);
    const availableHeight =
      totalHeight - padding * (layout.rows + 1) - headerHeight - footerHeight;

    const photoWidth = availableWidth / layout.columns;
    const photoHeight = availableHeight / layout.rows;

    // Fill background with template color
    ctx.fillStyle = selectedTemplate.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements based on template
    if (selectedTemplate.decorations) {
      switch (selectedTemplate.id) {
        case "hearts":
          drawHearts(ctx, canvas.width, canvas.height);
          break;
        case "flowers":
          drawFlowers(ctx, canvas.width, canvas.height);
          break;
        case "stars":
          drawStars(ctx, canvas.width, canvas.height);
          break;
      }
    }

    // Add main border
    ctx.strokeStyle = selectedTemplate.borderColor;
    ctx.lineWidth = 20; // Thicker border for high resolution
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Load and draw each photo in the selected layout
    const loadPhoto = (photoData: string, index: number) => {
      return new Promise<void>((resolve) => {
        const img = document.createElement("img");
        img.onload = () => {
          // Calculate grid position
          const row = Math.floor(index / layout.columns);
          const col = index % layout.columns;

          const x = padding + col * (photoWidth + padding);
          const y = padding + headerHeight + row * (photoHeight + padding);

          // Calculate scaling to maintain aspect ratio
          const scale = Math.min(
            photoWidth / img.width,
            photoHeight / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (photoWidth - scaledWidth) / 2;
          const offsetY = (photoHeight - scaledHeight) / 2;

          // Draw photo with decorative elements
          ctx.save();

          // Add shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 6;
          ctx.shadowOffsetY = 6;

          // Draw white background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, photoWidth, photoHeight);

          // Draw the photo maintaining aspect ratio
          ctx.drawImage(
            img,
            x + offsetX,
            y + offsetY,
            scaledWidth,
            scaledHeight
          );

          // Add border around photo
          ctx.strokeStyle = selectedTemplate.borderColor;
          ctx.lineWidth = 6;
          ctx.strokeRect(x, y, photoWidth, photoHeight);

          // Add photo number
          const badgeSize = Math.min(60, photoWidth * 0.12);
          ctx.fillStyle = `${selectedTemplate.bgColor}dd`;
          ctx.beginPath();
          ctx.arc(
            x + photoWidth - badgeSize / 2,
            y + badgeSize / 2,
            badgeSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.strokeStyle = selectedTemplate.borderColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.fillStyle = selectedTemplate.borderColor;
          ctx.font = `bold ${badgeSize * 0.6}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            (index + 1).toString(),
            x + photoWidth - badgeSize / 2,
            y + badgeSize / 2
          );

          ctx.restore();
          resolve();
        };
        img.src = photoData;
      });
    };

    // Load all photos and then create download
    Promise.all(photos.map((photo, index) => loadPhoto(photo, index))).then(
      () => {
        if (layout.showHeader) {
          // Add decorative header
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
          ctx.font = "bold 96px Arial";
          ctx.fillStyle = selectedTemplate.borderColor;
          ctx.textAlign = "center";
          ctx.fillText(
            "✨ Our Sweet Moments ✨",
            canvas.width / 2,
            padding + 60
          );
          ctx.restore();
        }

        if (layout.showFooter) {
          // Add date at the bottom
          ctx.font = "48px Arial";
          ctx.fillStyle = selectedTemplate.borderColor;
          ctx.textAlign = "center";
          const date = new Date().toLocaleDateString();
          ctx.fillText(date, canvas.width / 2, canvas.height - padding - 20);
        }

        // Create the download with high quality
        const link = document.createElement("a");
        link.download = `photostrip-${new Date().toISOString()}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 1.0);
        link.click();
      }
    );
  };

  // Template decoration drawing functions
  const drawHearts = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 20;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.fillStyle = `rgba(255, 105, 180, ${0.1 + Math.random() * 0.2})`;

      // Draw heart shape
      ctx.beginPath();
      ctx.moveTo(0, size / 4);
      ctx.bezierCurveTo(size / 4, -size / 4, size, -size / 4, size, size / 4);
      ctx.bezierCurveTo(size, size / 2, 0, size, 0, size / 4);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawFlowers = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 15 + Math.random() * 25;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI * 2);

      // Draw flower petals
      for (let j = 0; j < 5; j++) {
        ctx.fillStyle = `rgba(255, 182, 193, ${0.1 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size / 3, (j * Math.PI) / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw center
      ctx.fillStyle = "rgba(255, 223, 196, 0.7)";
      ctx.beginPath();
      ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawStars = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 5 + Math.random() * 15;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillStyle = `rgba(147, 112, 219, ${0.1 + Math.random() * 0.2})`;

      // Draw star shape
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        ctx.lineTo(
          Math.cos((j * 4 * Math.PI) / 5) * size,
          Math.sin((j * 4 * Math.PI) / 5) * size
        );
        ctx.lineTo(
          (Math.cos(((j * 4 + 2) * Math.PI) / 5) * size) / 2,
          (Math.sin(((j * 4 + 2) * Math.PI) / 5) * size) / 2
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  const resetPhotos = () => {
    setPhotos([]);
    setPhotosRemaining(8);
    setSelectedFilter(FILTERS[0]);
    setSelectedTimer(TIMER_OPTIONS[0]);
    setSelectedTemplate(TEMPLATES[0]);
    setSelectedLayout(LAYOUTS[1]); // Default to grid-2x4
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-200 p-4 md:p-8">
        <Card className="w-full max-w-6xl mx-auto shadow-2xl border-2 border-pink-200/50 bg-white/90 backdrop-blur">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-3">
                <span>✨</span> Love Lens <span>✨</span>
              </h1>
              <p className="text-pink-400 text-lg">
                Capture your sweet moments together
              </p>
            </div>

            <div className="grid md:grid-cols-[2fr_1fr] gap-8">
              {/* Main Camera Section */}
              <div className="space-y-6">
                {/* Camera Preview */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-pink-200 shadow-lg bg-black">
                  {/* Always render the video element but hide it when inactive */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover rounded-xl ${selectedFilter.class}`}
                    style={{
                      transform: "scaleX(-1)",
                      display: "block",
                      minHeight: "400px",
                      backgroundColor: "black",
                      visibility: cameraActive ? "visible" : "hidden",
                    }}
                  />

                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-pink-50/90 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">📸</div>
                        <p className="text-pink-600 font-medium mb-6 text-xl">
                          Ready to capture some sweet moments?
                        </p>
                        <Button
                          onClick={startCamera}
                          className="bg-pink-500 hover:bg-pink-600 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-xl shadow-lg"
                        >
                          Start Camera ✨
                        </Button>
                      </div>
                    </div>
                  )}

                  {cameraActive && (
                    <>
                      {/* Sticker Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {selectedStickers.map((stickerId, index) => {
                          const sticker = STICKERS.find(
                            (s) => s.id === stickerId
                          );
                          if (!sticker) return null;
                          return (
                            <div
                              key={`${stickerId}-${index}`}
                              className="absolute"
                              style={{
                                left: `${Math.random() * 80 + 10}%`,
                                top: `${Math.random() * 80 + 10}%`,
                                transform: `scale(${sticker.scale}) rotate(${
                                  Math.random() * 30 - 15
                                }deg)`,
                                fontSize: "2rem",
                              }}
                            >
                              {sticker.emoji}
                            </div>
                          );
                        })}
                      </div>
                      {/* Pose Guide Overlay */}
                      {showPoseGuide && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                          <div className="bg-white/95 rounded-3xl p-8 shadow-2xl max-w-md text-center transform animate-bounce-slow">
                            <div className="text-6xl mb-4">
                              {currentPose.emoji}
                            </div>
                            <h3 className="text-2xl font-bold text-pink-600 mb-2">
                              {currentPose.title}
                            </h3>
                            <p className="text-pink-500">
                              {currentPose.description}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Countdown Overlay */}
                      {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-8xl font-bold text-white drop-shadow-lg animate-pulse">
                            {countdown}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  {cameraActive && !isCapturing && photosRemaining > 0 && (
                    <Button
                      onClick={startPhotoSequence}
                      className="bg-pink-500 hover:bg-pink-600 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-xl shadow-lg"
                    >
                      Take Photos 📸
                    </Button>
                  )}
                  {photos.length > 0 && (
                    <>
                      <Button
                        onClick={previewPhotoStrip}
                        className="bg-purple-500 hover:bg-purple-600 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-xl shadow-lg"
                      >
                        Preview Strip 🎞️
                      </Button>
                      <Button
                        onClick={resetPhotos}
                        className="bg-gray-500 hover:bg-gray-600 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-xl shadow-lg"
                      >
                        Start Over 🔄
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Controls Section */}
              <div className="bg-pink-50/50 backdrop-blur rounded-2xl p-6 border-2 border-pink-100 shadow-xl space-y-8">
                {/* Timer Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-pink-600 mb-3 flex items-center gap-2">
                    <span>⏱️</span> Timer
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {TIMER_OPTIONS.map((timer) => (
                      <Button
                        key={timer.value}
                        onClick={() => setSelectedTimer(timer)}
                        className={`${
                          selectedTimer.value === timer.value
                            ? "ring-4 ring-pink-300 scale-105"
                            : ""
                        } bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 transition-all shadow-md`}
                      >
                        {timer.emoji} {timer.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filter Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-pink-600 mb-3 flex items-center gap-2">
                    <span>✨</span> Filter
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
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

                {/* Sticker Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-pink-600 mb-3 flex items-center gap-2">
                    <span>🎨</span> Stickers
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(["love", "cute", "text", "effects"] as const).map(
                        (category) => (
                          <Button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`${
                              activeCategory === category
                                ? "ring-4 ring-pink-300 scale-105"
                                : ""
                            } bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 transition-all shadow-md capitalize`}
                          >
                            {category}
                          </Button>
                        )
                      )}
                    </div>
                    <div className="bg-white rounded-xl p-3 max-h-40 overflow-y-auto shadow-inner">
                      <div className="grid grid-cols-4 gap-2">
                        {STICKERS.filter(
                          (s) => s.category === activeCategory
                        ).map((sticker) => (
                          <button
                            key={sticker.id}
                            onClick={() =>
                              setSelectedStickers((prev) => [
                                ...prev,
                                sticker.id,
                              ])
                            }
                            className="aspect-square flex items-center justify-center bg-white rounded-lg border-2 border-pink-200 hover:border-pink-400 hover:scale-110 transition-all shadow-sm"
                          >
                            <span className="text-2xl">{sticker.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Counter */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-600 mb-1">
                    {photosRemaining}
                  </div>
                  <div className="text-pink-400">Photos Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] w-[1800px] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-4xl font-bold text-pink-600 text-center flex items-center justify-center gap-2">
              <span>✨</span> Design Your Photo Strip <span>✨</span>
            </DialogTitle>
            <DialogDescription className="text-center text-pink-400 text-lg mt-2">
              Choose a layout and template for your photos!
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[280px_1fr] gap-8">
            {/* Sidebar with options */}
            <div className="space-y-6 bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border-2 border-pink-100 sticky top-4 self-start">
              {/* Layout Selection */}
              <div>
                <h3 className="text-xl font-semibold text-pink-600 mb-3 flex items-center gap-2">
                  <span>📏</span> Choose Layout
                </h3>
                <div className="space-y-3">
                  {LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        selectedLayout.id === layout.id
                          ? "border-pink-500 bg-pink-50/80 scale-[1.02] shadow-lg"
                          : "border-pink-200 hover:border-pink-300 hover:bg-pink-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{layout.emoji}</span>
                        <span className="font-medium text-base text-pink-600">
                          {layout.name}
                        </span>
                      </div>
                      <p className="text-xs text-pink-400">
                        {layout.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h3 className="text-xl font-semibold text-pink-600 mb-3 flex items-center gap-2">
                  <span>🎨</span> Choose Style
                </h3>
                <div className="space-y-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate.id === template.id
                          ? "border-pink-500 bg-pink-50/80 scale-[1.02] shadow-lg"
                          : "border-pink-200 hover:border-pink-300 hover:bg-pink-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{template.emoji}</span>
                        <span className="font-medium text-base text-pink-600">
                          {template.name}
                        </span>
                      </div>
                      <p className="text-xs text-pink-400">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-pink-100 p-8">
              <div
                className="relative mb-6 mx-auto"
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  aspectRatio: selectedLayout.aspectRatio,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                  style={{ backgroundColor: selectedTemplate.bgColor }}
                >
                  {selectedTemplate.decorations && (
                    <div className="absolute inset-0 opacity-30">
                      {selectedTemplate.id === "hearts" && (
                        <canvas
                          ref={(canvas) => {
                            if (canvas) {
                              const ctx = canvas.getContext("2d");
                              if (ctx)
                                drawHearts(ctx, canvas.width, canvas.height);
                            }
                          }}
                          className="w-full h-full"
                        />
                      )}
                      {selectedTemplate.id === "flowers" && (
                        <canvas
                          ref={(canvas) => {
                            if (canvas) {
                              const ctx = canvas.getContext("2d");
                              if (ctx)
                                drawFlowers(ctx, canvas.width, canvas.height);
                            }
                          }}
                          className="w-full h-full"
                        />
                      )}
                      {selectedTemplate.id === "stars" && (
                        <canvas
                          ref={(canvas) => {
                            if (canvas) {
                              const ctx = canvas.getContext("2d");
                              if (ctx)
                                drawStars(ctx, canvas.width, canvas.height);
                            }
                          }}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  )}

                  <div className="absolute inset-6">
                    {selectedLayout.showHeader && (
                      <div className="text-center mb-6">
                        <h2
                          className="text-3xl font-bold"
                          style={{ color: selectedTemplate.borderColor }}
                        >
                          ✨ Our Sweet Moments ✨
                        </h2>
                      </div>
                    )}

                    <div className="h-[calc(100%-5rem)]">
                      <div
                        className="grid h-full gap-4"
                        style={{
                          gridTemplateColumns: `repeat(${selectedLayout.columns}, 1fr)`,
                          gridTemplateRows: `repeat(${selectedLayout.rows}, 1fr)`,
                        }}
                      >
                        {photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden shadow-xl transition-transform hover:scale-[1.02]"
                            style={{
                              border: `4px solid ${selectedTemplate.borderColor}`,
                            }}
                          >
                            <div className="absolute inset-0">
                              <Image
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1200px) 100vw, 600px"
                                priority
                              />
                            </div>
                            <div
                              className="absolute -top-2 -right-2 rounded-full w-8 h-8 flex items-center justify-center text-base font-bold border-2 shadow-lg z-10"
                              style={{
                                backgroundColor: `${selectedTemplate.bgColor}ee`,
                                borderColor: selectedTemplate.borderColor,
                                color: selectedTemplate.borderColor,
                              }}
                            >
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedLayout.showFooter && (
                      <div className="text-center mt-4">
                        <p
                          className="text-xl"
                          style={{ color: selectedTemplate.borderColor }}
                        >
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-500 hover:bg-gray-600 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-xl shadow-lg"
                >
                  Close Preview 🔍
                </Button>
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    downloadPhotos();
                  }}
                  className="bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-xl shadow-lg"
                >
                  Download Now 💝
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
