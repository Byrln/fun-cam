"use client"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface CameraViewProps {
  onCapture: (photoData: string) => void
  autoCapture?: boolean
  captureDelay?: number
  isLandscape?: boolean
  useCompactLayout?: boolean
}

export default function CameraView({
  onCapture,
  autoCapture = false,
  captureDelay = 1000,
  isLandscape = false,
  useCompactLayout = false,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        // Try to use the environment camera first (back camera on phones)
        // Fall back to any available camera if that fails
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          })
        } catch (err) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          // Wait for video to be ready before starting countdown
          videoRef.current.onloadedmetadata = () => {
            if (autoCapture) {
              const seconds = Math.ceil(captureDelay / 1000)
              setCountdown(seconds)
            }
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setCameraError("Could not access camera. Please make sure you've granted permission.")
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [autoCapture, captureDelay])

  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Flash effect when taking photo
      setFlash(true)
      setTimeout(() => {
        takePhoto()
        setFlash(false)
      }, 200)
    }
  }, [countdown])

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      const context = canvas.getContext("2d")

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to the canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URL and pass to parent
      const photoData = canvas.toDataURL("image/jpeg")
      onCapture(photoData)
    }
  }

  // Flash animation style
  const flashStyle = {
    opacity: flash ? 1 : 0,
    transition: "opacity 300ms ease-out",
  }

  // Determine aspect ratio based on orientation and layout
  const aspectRatio = isLandscape
    ? useCompactLayout
      ? "aspect-[16/9]"
      : "aspect-video"
    : useCompactLayout
      ? "aspect-square"
      : "aspect-[3/4]"

  return (
    <Card
      className={`relative overflow-hidden rounded-xl shadow-lg 
      ${useCompactLayout ? "border-2" : "border-4"} border-blue-300`}
    >
      {cameraError ? (
        <div
          className={`${useCompactLayout ? "p-2 text-xs" : "p-4 sm:p-8 text-sm sm:text-base"} text-center text-muted-foreground`}
        >
          <p>{cameraError}</p>
        </div>
      ) : (
        <>
          <div className={`relative ${aspectRatio} bg-black`}>
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

            {/* Camera lens overlay - hide in compact layout */}
            {!useCompactLayout && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 w-10 h-10 sm:w-16 sm:h-16 border-4 border-blue-400 rounded-full opacity-50"></div>
              </div>
            )}

            {/* Countdown indicator - smaller in compact layout */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`bg-blue-500/70 text-white font-bold rounded-full flex items-center justify-center animate-pulse
                  ${useCompactLayout ? "text-2xl h-12 w-12" : "text-4xl sm:text-7xl h-20 w-20 sm:h-32 sm:w-32"}`}
                >
                  {countdown}
                </div>
              </div>
            )}

            {/* Flash effect using inline style */}
            <div className="absolute inset-0 bg-white pointer-events-none" style={flashStyle}></div>
          </div>

          {/* Hidden canvas for capturing photos */}
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </Card>
  )
}

