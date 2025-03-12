"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera, Trash2, Loader2, MessageSquare, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"

interface Photo {
  id: string
  imageUrl: string
  createdAt: string
}

interface Feedback {
  id: string
  content: string
  status: string
  createdAt: string
}

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotos()
    fetchFeedbacks()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos')
      if (!response.ok) throw new Error('Failed to fetch photos')
      const data = await response.json()
      setPhotos(data)
    } catch (err) {
      setError('Failed to load photos')
      setTimeout(() => setError(null), 3000)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedbacks')
      if (!response.ok) throw new Error('Failed to fetch feedbacks')
      const data = await response.json()
      setFeedbacks(data)
    } catch (err) {
      setError('Failed to load feedbacks')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleMarkAsReviewed = async (feedback: Feedback) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/feedbacks/${feedback.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reviewed' })
      })
      if (!response.ok) throw new Error('Failed to update feedback')
      setFeedbacks(feedbacks.map(f => 
        f.id === feedback.id ? { ...f, status: 'reviewed' } : f
      ))
    } catch (err) {
      setError('Failed to update feedback')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (photo: Photo) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete photo')
      setPhotos(photos.filter(p => p.id !== photo.id))
      setSelectedPhoto(null)
    } catch (err) {
      setError('Failed to delete photo')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-800 flex items-center">
          <Camera className="h-6 w-6 mr-2 text-blue-600" />
          Admin Dashboard
        </h1>
        <div className="text-sm text-blue-600">
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="rounded-lg overflow-hidden shadow-md border-2 border-blue-200">
              <div className="aspect-square relative">
                <Image
                  src={photo.imageUrl || "/placeholder.svg"}
                  alt={`Photo ${photo.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              ID: {photo.id.slice(0, 8)}
            </div>
            <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-full">
              {new Date(photo.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Section */}
      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-800 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            User Feedbacks
          </h2>
          <div className="text-sm text-blue-600">
            {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600">{feedback.content}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${feedback.status === 'reviewed' ? 'bg-green-50 text-green-600' : ''}`}
                  onClick={() => handleMarkAsReviewed(feedback)}
                  disabled={isLoading || feedback.status === 'reviewed'}
                >
                  {feedback.status === 'reviewed' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Reviewed
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reviewing...
                    </>
                  ) : (
                    <>Mark as Reviewed</>
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(feedback.createdAt).toLocaleString()}
              </div>
            </div>
          ))}

          {feedbacks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No feedbacks yet</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="p-4 max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] bg-blue-50 border-blue-300">
          {selectedPhoto && (
            <>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src={selectedPhoto.imageUrl || "/placeholder.svg"}
                  alt={`Photo ${selectedPhoto.id}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 80vw"
                  priority
                />
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-blue-800">
                  <strong>ID:</strong> {selectedPhoto.id}
                </div>
                <div className="text-sm text-blue-800">
                  <strong>Created:</strong> {new Date(selectedPhoto.createdAt).toLocaleString()}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleDelete(selectedPhoto)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Photo
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}