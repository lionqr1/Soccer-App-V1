"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Crop, X } from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
  aspectRatio?: number
  playerName?: string
  playerSurname?: string
}

export function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  playerName = "",
  playerSurname = "",
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [livePreview, setLivePreview] = useState("")

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const size = 300
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Save context
    ctx.save()

    // Move to center
    ctx.translate(size / 2, size / 2)

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)

    // Apply scale and position
    ctx.scale(scale, scale)
    ctx.translate(position.x, position.y)

    // Draw image centered
    const imgWidth = image.naturalWidth
    const imgHeight = image.naturalHeight
    ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)

    // Restore context
    ctx.restore()

    // Draw crop overlay
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    const cropSize = size * 0.8
    const cropX = (size - cropSize) / 2
    const cropY = (size - cropSize) / 2

    ctx.strokeRect(cropX, cropY, cropSize, cropSize)

    // Generate live preview
    generateLivePreview()
  }, [scale, rotation, position])

  const generateLivePreview = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    // Create a smaller preview canvas
    const previewCanvas = document.createElement("canvas")
    const previewCtx = previewCanvas.getContext("2d")
    if (!previewCtx) return

    const previewSize = 100
    previewCanvas.width = previewSize
    previewCanvas.height = previewSize

    // Draw the cropped portion for preview
    previewCtx.save()
    previewCtx.translate(previewSize / 2, previewSize / 2)
    previewCtx.rotate((rotation * Math.PI) / 180)
    previewCtx.scale(scale, scale)
    previewCtx.translate(position.x * (previewSize / 300), position.y * (previewSize / 300))

    const imgWidth = image.naturalWidth * (previewSize / 300)
    const imgHeight = image.naturalHeight * (previewSize / 300)
    previewCtx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
    previewCtx.restore()

    // Convert to base64 for preview
    const previewImage = previewCanvas.toDataURL("image/jpeg", 0.8)
    setLivePreview(previewImage)
  }, [scale, rotation, position])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    // Create a new canvas for the cropped result
    const cropCanvas = document.createElement("canvas")
    const cropCtx = cropCanvas.getContext("2d")
    if (!cropCtx) return

    const cropSize = 300
    cropCanvas.width = cropSize
    cropCanvas.height = cropSize

    // Draw the cropped portion
    cropCtx.save()
    cropCtx.translate(cropSize / 2, cropSize / 2)
    cropCtx.rotate((rotation * Math.PI) / 180)
    cropCtx.scale(scale, scale)
    cropCtx.translate(position.x, position.y)

    const imgWidth = image.naturalWidth
    const imgHeight = image.naturalHeight
    cropCtx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
    cropCtx.restore()

    // Convert to base64
    const croppedImage = cropCanvas.toDataURL("image/jpeg", 0.9)
    onCropComplete(croppedImage)
  }

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(Number.parseFloat(e.target.value))
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/50 fixed inset-0 z-50 p-4">
      <div className="flex gap-6 max-w-4xl w-full">
        {/* Main Cropper */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Crop Image</span>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hidden image for loading */}
            <img
              ref={imageRef}
              src={imageUrl || "/placeholder.svg"}
              alt="Source"
              className="hidden"
              onLoad={drawCanvas}
              crossOrigin="anonymous"
            />

            {/* Canvas for preview */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 cursor-move rounded-lg"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <Label>Scale</Label>
                <div className="flex items-center space-x-2">
                  <ZoomOut className="w-4 h-4" />
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={handleScaleChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setRotation((prev) => prev - 90)}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Rotate Left
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation((prev) => prev + 90)}>
                  <RotateCw className="w-4 h-4 mr-1" />
                  Rotate Right
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCrop} className="flex-1">
                  <Crop className="w-4 h-4 mr-2" />
                  Crop Image
                </Button>
                <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={livePreview || "/placeholder.svg"} alt="Live preview" />
                  <AvatarFallback className="text-2xl font-bold">
                    {playerName[0] || "?"}
                    {playerSurname[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="font-semibold text-lg">
                {playerName} {playerSurname}
              </h3>
              <p className="text-sm text-gray-600">Profile Picture Preview</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">How it will appear:</h4>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={livePreview || "/placeholder.svg"} alt="Small preview" />
                    <AvatarFallback>
                      {playerName[0] || "?"}
                      {playerSurname[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {playerName} {playerSurname}
                    </div>
                    <div className="text-xs text-gray-600">In player lists</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Profile view:</h4>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={livePreview || "/placeholder.svg"} alt="Profile preview" />
                    <AvatarFallback className="text-lg">
                      {playerName[0] || "?"}
                      {playerSurname[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {playerName} {playerSurname}
                    </div>
                    <div className="text-sm text-gray-600">Player Profile</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
