"use client";

import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  open: boolean;
  title: string;
  instructions: string;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const MAX_DIMENSION = 960;
const JPEG_QUALITY = 0.72;

function renderToDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
): string {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));

  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const dataUrl = renderToDataUrl(
          image,
          image.naturalWidth,
          image.naturalHeight,
        );
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected image could not be read."));
    };

    image.src = objectUrl;
  });
}

export function CameraCapture({
  open,
  title,
  instructions,
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      stopStream();
      return;
    }

    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Live preview is not supported here. Use the phone camera button instead.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
        }
      } catch {
        setError(
          "Camera permission was blocked or unavailable. Use the phone camera button instead.",
        );
        setIsReady(false);
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open]);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
  }

  async function handleCapture() {
    if (!videoRef.current || !isReady) {
      return;
    }

    try {
      const dataUrl = renderToDataUrl(
        videoRef.current,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight,
      );
      onCapture(dataUrl);
      stopStream();
      onClose();
    } catch {
      setError("Capture failed. Try again or use the phone camera button.");
    }
  }

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onCapture(dataUrl);
      onClose();
    } catch {
      setError("That image could not be processed. Try another shot.");
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100svh] items-end bg-slate-950/88 px-4 pb-4 pt-6 backdrop-blur-md">
      <input
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelection}
        type="file"
      />

      <div className="mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] shadow-panel">
        <div className="space-y-2 border-b border-white/10 px-5 py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-emerald-300/80">
            Camera capture
          </p>
          <h3 className="font-display text-2xl font-semibold leading-tight text-white">
            {title}
          </h3>
          <p className="text-sm leading-6 text-slate-300">{instructions}</p>
        </div>

        <div className="relative aspect-[3/4] bg-slate-900">
          <video
            ref={videoRef}
            autoPlay
            className="h-full w-full object-cover"
            muted
            playsInline
          />
          <div className="camera-mask pointer-events-none absolute inset-0" />

          {!isReady && !error ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-300">
              Opening the rear camera...
            </div>
          ) : null}

          {error ? (
            <div className="absolute inset-x-4 top-4 rounded-2xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 px-4 py-4">
          <button
            className="min-h-[3.5rem] rounded-2xl bg-emerald-500 px-5 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReady}
            onClick={handleCapture}
            type="button"
          >
            Capture photo
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="min-h-[3.25rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Use phone camera
            </button>
            <button
              className="min-h-[3.25rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => {
                stopStream();
                onClose();
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
