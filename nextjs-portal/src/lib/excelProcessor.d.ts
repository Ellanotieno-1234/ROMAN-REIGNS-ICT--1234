declare module '@/lib/excelProcessor' {
  interface ProcessExcelFileOptions {
    onProgress?: (progress: number) => void
  }

  export function processExcelFile(
    file: File,
    options?: ProcessExcelFileOptions
  ): Promise<any[]>
}
