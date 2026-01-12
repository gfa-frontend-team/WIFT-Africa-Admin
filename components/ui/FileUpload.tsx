'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { Button } from './Button'
import { toast } from './use-toast'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  error?: string
  accept?: string
  maxSize?: number // in MB
  width?: string
  height?: string
}

interface UploadResponse {
  url: string
  type: 'image' | 'document'
  originalName: string
}

export function FileUpload({
  value,
  onChange,
  label = 'Upload Image',
  error,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  width = 'w-full',
  height = 'h-64'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Please upload a file smaller than ${maxSize}MB`
      })
      return
    }

    // Validate type logic if strictly needed, but accept prop covers most
    if (!file.type.startsWith('image/')) {
       toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload an image file'
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'post') // Using 'post' as generic type for now

      // Explicitly let browser set content-type with boundary by passing undefined or relying on axios with FormData
      // However, our apiClient sets 'application/json' by default. 
      // We need to override headers.
      
      const response = await apiClient.post<UploadResponse>('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      if (response && response.url) {
        onChange(response.url)
        toast({
          title: 'Success',
          description: 'Image uploaded successfully'
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your image. Please try again.'
      })
    } finally {
      setIsUploading(false)
      // Reset input needed?
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onChange('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div
        onClick={() => !value && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center 
          border-2 border-dashed rounded-lg transition-colors
          ${width} ${height}
          ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
          ${error ? 'border-destructive' : ''}
          ${value ? 'cursor-default border-none p-0 overflow-hidden' : 'cursor-pointer hover:bg-muted/50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full group">
            {/* Optimized Next.js Image would be better but we don't have constraints here yet, sticking to img tag for generic URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={value} 
              alt="Uploaded content" 
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                onClick={handleRemove}
                className="gap-2"
               >
                 <X className="w-4 h-4" />
                 Remove
               </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <div className="bg-muted p-3 rounded-full mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-semibold mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or GIF (max {maxSize}MB)
            </p>
          </div>
        )}
      </div>
      
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
