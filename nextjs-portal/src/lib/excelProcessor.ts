import * as XLSX from 'xlsx'

interface ProcessExcelFileOptions {
  onProgress?: (progress: number) => void
}

export async function processExcelFile(
  file: File,
  options?: ProcessExcelFileOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        options?.onProgress?.(30)
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        options?.onProgress?.(60)
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        options?.onProgress?.(80)
        
        // Basic frontend processing if backend fails
        const processedData = json.map((row: any) => ({
          ...row,
          // Add basic calculations
          attendanceRate: row.present ? (row.present / row.total) * 100 : 0,
          completionRate: row.completed ? (row.completed / row.total) * 100 : 0
        }))
        
        options?.onProgress?.(100)
        
        resolve({
          rawData: json,
          processedData: processedData,
          recordCount: json.length
        })
      } catch (error) {
        console.error('Error processing Excel file')
        reject(error)
      }
    }

    reader.onerror = (error) => {
      console.error('Error reading file')
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}
