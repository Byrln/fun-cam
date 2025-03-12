"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, ThumbsUp } from "lucide-react"

interface FeedbackFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  useCompactLayout?: boolean
}

export default function FeedbackForm({ open, onOpenChange, useCompactLayout = false }: FeedbackFormProps) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate form fields
    if (!name.trim()) {
      setError('Нэрээ оруулна уу!')
      setIsSubmitting(false)
      return
    }

    if (!message.trim()) {
      setError('Ямар нэгэн үг бичнэ үү!')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }
      
      setIsSubmitted(true)
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setName("")
        setMessage("")
        setIsSubmitted(false)
        onOpenChange(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-blue-50 border-blue-300 max-w-[95vw] sm:max-w-md
        ${useCompactLayout ? "p-3" : ""}`}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 text-blue-800 
            ${useCompactLayout ? "text-sm" : "text-base sm:text-lg"}`}
          >
            <MessageSquare className={`${useCompactLayout ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5"} text-blue-600`} />
            Ямар нэгэн үг хэлмээр байна уу? 😉
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div
            className={`${useCompactLayout ? "py-4" : "py-6 sm:py-8"} flex flex-col items-center justify-center text-center gap-3 sm:gap-4`}
          >
            <div
              className={`${useCompactLayout ? "h-10 w-10" : "h-12 w-12 sm:h-16 sm:w-16"} rounded-full bg-green-100 flex items-center justify-center`}
            >
              <ThumbsUp className={`${useCompactLayout ? "h-5 w-5" : "h-6 w-6 sm:h-8 sm:w-8"} text-green-600`} />
            </div>
            <p className={`${useCompactLayout ? "text-sm" : "text-base sm:text-lg"} font-medium text-green-800`}>
              Баярлалаа ёстой гоё үг байнө бро 👍
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`${useCompactLayout ? "space-y-2" : "space-y-3 sm:space-y-4"}`}>
            <div className={`${useCompactLayout ? "space-y-1" : "space-y-1 sm:space-y-2"}`}>
              <Label
                htmlFor="name"
                className={`text-blue-800 ${useCompactLayout ? "text-xs" : "text-sm sm:text-base"}`}
              >
                Нэр
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Нэрээ оруулна уу"
                className={`border-blue-200 focus:border-blue-400 ${useCompactLayout ? "text-xs h-8" : "text-sm sm:text-base"}`}
                required
              />
            </div>

            <div className={`${useCompactLayout ? "space-y-1" : "space-y-1 sm:space-y-2"}`}>
              <Label
                htmlFor="message"
                className={`text-blue-800 ${useCompactLayout ? "text-xs" : "text-sm sm:text-base"}`}
              >
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="гоё үг бичнэ үү!😉"
                className={`${useCompactLayout ? "min-h-[80px] text-xs" : "min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"} border-blue-200 focus:border-blue-400`}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className={`w-full bg-blue-600 hover:bg-blue-700 ${useCompactLayout ? "text-xs h-8" : "text-sm sm:text-base"}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div
                      className={`${useCompactLayout ? "h-2 w-2" : "h-3 w-3 sm:h-4 sm:w-4"} border-2 border-white border-t-transparent rounded-full animate-spin`}
                    ></div>
                    Илгээж байна...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className={`${useCompactLayout ? "h-2 w-2" : "h-3 w-3 sm:h-4 sm:w-4"}`} />
                    Илгээх
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
