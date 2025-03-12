"use client"

import { useState, useEffect } from "react"
import { Camera, ImageIcon, MessageSquare, X } from "lucide-react"
import CameraView from "@/components/camera-view"
import PhotoGallery from "@/components/photo-gallery"
import FeedbackForm from "@/components/feedback-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function SnapPhotoApp() {
  const [photos, setPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(true)
  const [showPeekingCamera, setShowPeekingCamera] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // More precise breakpoints
  const isSmallMobile = useMediaQuery("(max-width: 360px)")
  // const isMobile = useMediaQuery("(min-width: 361px) and (max-width: 639px)")
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isLandscape = useMediaQuery("(orientation: landscape)")

  // Determine optimal layout
  const useCompactLayout = isSmallMobile || (isLandscape && !isDesktop)
  const galleryColumns = isSmallMobile ? 1 : isDesktop ? 4 : isTablet ? 3 : 2

  const handleCapture = async (photoData: string) => {
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: photoData })
      })
      if (!response.ok) throw new Error('Failed to save photo')
      setPhotos((prev) => [photoData, ...prev])
      setIsCapturing(false)
      setShowMessage(true)

      // Hide message after 5 seconds
      setTimeout(() => {
        setShowMessage(false)
      }, 5000)
    } catch (error) {
      console.error('Error saving photo:', error)
      // You might want to show an error message to the user here
    }
  }

  // Animation effect for peeking camera
  useEffect(() => {
    if (showPeekingCamera) {
      const timer = setTimeout(() => {
        setShowPeekingCamera(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [showPeekingCamera])

  return (
    <main className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen relative overflow-hidden">
      {/* Peeking camera animation - hide in landscape on small devices */}
      {showPeekingCamera && !useCompactLayout && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="bg-black rounded-b-xl p-2 sm:p-4 shadow-lg">
            <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
          </div>
        </div>
      )}

      <div
        className={`container mx-auto px-2 sm:px-4 py-4 ${isDesktop ? "max-w-6xl" : "max-w-md"} 
        ${useCompactLayout ? "pt-4" : "pt-12 sm:pt-16"} 
        flex flex-col ${isLandscape && !isDesktop ? "h-screen" : "min-h-screen"}`}
      >
        {/* Header - more compact in landscape */}
        <header className={`${useCompactLayout ? "py-1" : "py-2 sm:py-4"} text-center relative`}>
          <h1 className={`${useCompactLayout ? "text-lg" : "text-xl sm:text-2xl"} font-bold text-blue-800`}>
            Snap Photo
          </h1>

          {!useCompactLayout && <p className="text-xs sm:text-sm text-blue-600">Quick snap & collect memories</p>}

          {/* Feedback button - adjust size based on screen */}
          <Button
            variant="outline"
            size={useCompactLayout ? "xs" : "sm"}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white border-blue-300 
              text-blue-700 hover:bg-blue-50 text-xs sm:text-sm
              ${useCompactLayout ? "px-2 py-1" : ""}`}
            onClick={() => setFeedbackOpen(true)}
          >
            <MessageSquare className={`${useCompactLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"} mr-1`} />
            {useCompactLayout ? "Ямар нэгэн үг хэлмээр байна уу? 😉" : "Ямар нэгэн үг хэлмээр байна уу? 😉"}
          </Button>
        </header>

        {/* Fun message after photo is taken - adjust size based on screen */}
        {showMessage && (
          <Alert
            className={`bg-yellow-100 border-yellow-300 text-yellow-800 
            ${useCompactLayout ? "mb-2 py-1" : "mb-4"} animate-bounce flex items-center justify-between gap-2`}
          >
            <AlertDescription className={`${useCompactLayout ? "text-xs" : "text-xs sm:text-base"} font-medium flex-1`}>
              U're a snapped dude but don't worry it's just for fun SMILE😁
            </AlertDescription>
            <button
              onClick={() => setShowMessage(false)}
              className="flex-shrink-0 hover:bg-yellow-200 rounded-full p-1 transition-colors"
            >
              <X className={`${useCompactLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"}`} />
            </button>
          </Alert>
        )}

        {/* Main content - adjust layout based on orientation and screen size */}
        <div className={`flex-1 flex ${isLandscape && !isSmallMobile ? "flex-row" : "flex-col"} gap-2 sm:gap-4`}>
          {isCapturing ? (
            <div className={`relative ${isLandscape && !isSmallMobile ? "w-1/2" : "w-full"}`}>
              {!useCompactLayout && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-lg">
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
              )}
              <CameraView
                onCapture={handleCapture}
                autoCapture={true}
                captureDelay={1000}
                isLandscape={isLandscape}
                useCompactLayout={useCompactLayout}
              />
            </div>
          ) : (
            <div className={`${isLandscape && !isSmallMobile ? "w-full" : "w-full"}`}>
              {photos.length > 0 ? (
                <PhotoGallery photos={photos} columns={galleryColumns} useCompactLayout={useCompactLayout} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-blue-400">
                  <ImageIcon
                    className={`${useCompactLayout ? "h-8 w-8 mb-2" : "h-12 w-12 sm:h-16 sm:w-16 mb-4"} opacity-50`}
                  />
                  <p className={`${useCompactLayout ? "text-xs" : "text-sm sm:text-base"}`}>No photos captured yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback form */}
      <FeedbackForm open={feedbackOpen} onOpenChange={setFeedbackOpen} useCompactLayout={useCompactLayout} />
    </main>
  )
}
