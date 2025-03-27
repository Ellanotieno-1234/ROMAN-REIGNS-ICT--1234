'use client'
import { useState, useRef, useEffect } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { processExcelFile } from '@/lib/excelProcessor'
import { supabase } from '@/lib/supabase'
import styles from './EnhancedExcelUploader.module.css'

const fileTypes = ['XLSX', 'XLS', 'CSV']

interface EnhancedExcelUploaderProps {
  onUploadSuccess: (data: any) => void
  maxFileSize?: number
}

export default function EnhancedExcelUploader({ 
  onUploadSuccess,
  maxFileSize = 10 // Default to 10MB
}: EnhancedExcelUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress}%`
    }
  }, [progress])

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = async (file: File) => {
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSize}MB limit`)
      return
    }

    setIsLoading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      // Process file directly in frontend
      const result = await processExcelFile(file, {
        onProgress: (progress: number) => {
          setProgress(progress)
        }
      });

      // Store in Supabase
      let supabaseData;
      try {
        const { data, error } = await supabase
          .from('analysis_results')
          .insert([{
            file_name: file.name,
            data: result.processedData,
            record_count: result.recordCount || 0
          }])
          .select();

        if (error) throw error;
        supabaseData = data?.[0];
      } catch (error: any) {
        console.error('Supabase storage error:', error.message);
        throw new Error('Failed to store data in database');
      }

      clearInterval(interval);
      setProgress(100);
      setSuccess(true);
      
      // Pass processed data to parent component
      onUploadSuccess({
        rawData: result.rawData,
        processedData: result.processedData,
        recordCount: result.recordCount,
        supabaseData: supabaseData
      });
    } catch (error: any) {
      setError(error.message || 'Failed to process file')
      // Pass error info to parent component
      onUploadSuccess({
        error: true,
        message: error.message || 'Failed to process file'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 relative">
      <div className="w-full">
        <FileUploader
          handleChange={handleFileChange}
          name="file" 
          types={fileTypes}
          disabled={isLoading}
        >
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <p className="text-sm text-gray-300">
              Drag & drop Excel file or click to upload
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>
        </FileUploader>

        {isLoading && (
          <div className="mt-4">
            <div className={styles['progress-container']}>
              <div
                ref={progressBarRef}
                className={styles['progress-bar']}
              ></div>
            </div>
            <p className="text-xs text-center mt-1 text-gray-400">
              Processing... {progress}%
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 text-red-300 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-500/20 text-green-300 rounded text-sm">
            File processed successfully!
          </div>
        )}
      </div>
    </div>
  )
}
