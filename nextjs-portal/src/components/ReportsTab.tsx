'use client'
import { useState, useEffect } from 'react'
import { GlassCard } from './GlassCard'
import { Button } from './ui/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// Assuming Chart.js is globally available or properly imported elsewhere
// import { Chart } from 'chart.js'; // Uncomment if needed and Chart.js is installed/configured

interface ReportTemplate {
  id: string
  name: string
  description?: string
  query: string
  columns: string[]
  created_at: string
}

interface ReportData {
  columns: string[]
  rows: Record<string, any>[]
  analysis?: { // Add optional analysis field
    status_counts?: Record<string, number>
    generated_at?: string
    total_records?: number
  }
}

export default function ReportsTab() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  // Fetch report templates with retry and timeout
  useEffect(() => {
    const API_TIMEOUT = 5000; // 5 seconds
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    const fetchTemplates = async (retryCount = 0) => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), API_TIMEOUT);

      try {
        const res = await fetch('http://localhost:8001/api/reports/templates', {
          signal: abortController.signal
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
        
      } catch (err) {
        clearTimeout(timeoutId);
        const error = err as Error;
        
        if (retryCount < MAX_RETRIES && error.name !== 'AbortError') {
          console.warn(`Attempt ${retryCount + 1} failed, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return fetchTemplates(retryCount + 1);
        }
        
        console.error('Failed to fetch templates after retries', error);
        setTemplates([]); // Set empty array to prevent UI errors
        
        // Display user-friendly error message
        if (error.name === 'AbortError') {
          alert('Report service is taking too long to respond. Please check if the backend is running.');
        } else {
          alert(`Failed to connect to report service: ${error.message}`);
        }
      }
    };

    fetchTemplates();
  }, []);

  // Generate report - Fetch data including analysis
  const generateReport = async (templateId: string) => {
    setIsLoading(true);
    setSelectedFileId(null);
    try {
      const res = await fetch(`http://localhost:8001/api/reports/generate/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Failed to generate report: ${res.statusText}`);
      const data = await res.json();
      console.log("[generateReport] Received data from backend:", JSON.stringify(data, null, 2)); // Deeper log
      if (!data?.columns || !data?.rows || !data?.analysis) {
         console.error("[generateReport] Data format issue: Missing columns, rows, or analysis.", data);
         if (data?.columns && data?.rows) {
            setReportData({ columns: data.columns, rows: data.rows, analysis: {} });
         } else {
            throw new Error('Invalid report data format received from backend.');
         }
      } else {
        setReportData(data);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Failed to generate report', error);
      setReportData(null);
      alert(`Error generating report: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  // Export report
  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!activeTemplate || !reportData) {
      alert('Please generate a report first.')
      return
    }

    console.log("[exportReport] Starting export. Current reportData:", JSON.stringify(reportData, null, 2)); // Deeper log

    const rowsToExport = selectedFileId
      ? reportData.rows.filter(row => String(row.id) === selectedFileId)
      : reportData.rows;

    if (selectedFileId && rowsToExport.length === 0) {
        alert('No data available for the selected file to export.');
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const pdfSuffix = selectedFileId ? `file_${selectedFileId}` : 'summary';
    const filenameBase = `report_${activeTemplate}_${format === 'pdf' ? pdfSuffix : (selectedFileId || 'all')}`
    const filename = `${filenameBase}_${timestamp}`;


    if (format === 'pdf') {
      // --- PDF Generation (Summary + Chart ONLY using autoTable for layout) ---
      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const title = selectedFileId ? `Analysis Report - File ID: ${selectedFileId}` : "Analysis Report";
        const totalRecords = reportData.analysis?.total_records ?? reportData.rows.length;
        const generatedAt = reportData.analysis?.generated_at ?? new Date().toISOString();

        console.log(`[exportReport PDF] Title: ${title}, Total Records: ${totalRecords}, Generated At: ${generatedAt}`);

        // --- Title (drawn directly) ---
        doc.setFontSize(16);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
        let startY = 60; // Y position after title

        // --- Prepare Summary Content ---
        const summaryLines: string[] = [
          `Generated at: ${generatedAt}`,
          `Total records analyzed: ${totalRecords}`
        ];
         if (selectedFileId) {
             summaryLines.push(`(Previewing details for File ID: ${selectedFileId})`);
         }
        const statusCounts = reportData.analysis?.status_counts;
        console.log("[exportReport PDF] Status Counts object:", statusCounts);
        if (statusCounts && typeof statusCounts === 'object' && Object.keys(statusCounts).length > 0) {
          summaryLines.push(" ");
          summaryLines.push("Overall Status Breakdown:");
          for (const [status, count] of Object.entries(statusCounts)) {
            const statusLabel = status === 'unknown' || status === 'null' || !status ? 'Pending/Unknown' : status;
            summaryLines.push(`- ${statusLabel}: ${count}`);
          }
        } else {
          summaryLines.push(" ");
          summaryLines.push("Status breakdown not available.");
        }
        const summaryContent = summaryLines.join('\n'); // Join lines for single cell

        // --- Prepare Chart Image ---
        let chartImageBase64: string | null = null;
        let chartImgWidth = 0;
        let chartImgHeight = 0;
        const chartPlaceholderText = "Chart could not be generated or no status data.";

        if (statusCounts && Object.keys(statusCounts).length > 0) {
          console.log("[exportReport PDF] Attempting to generate chart.");
          try {
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = 500; // Adjusted for potentially better scaling
            offscreenCanvas.height = 220;
            const ctx = offscreenCanvas.getContext('2d');
            if (ctx) {
              // @ts-ignore
              const { Chart, registerables } = await import('chart.js');
              Chart.register(...registerables);
              new Chart(ctx, { /* ... chart config ... */
                 type: 'bar',
                 data: {
                   labels: Object.keys(statusCounts).map(status => status === 'unknown' || status === 'null' || !status ? 'Pending/Unknown' : status),
                   datasets: [{ label: 'Status Count', data: Object.values(statusCounts), backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }]
                 },
                 options: { responsive: false, animation: { duration: 0 }, plugins: { title: { display: true, text: 'Overall Status Distribution' }, legend: { display: false } }, scales: { y: { beginAtZero: true } } }
              });
              await new Promise(resolve => setTimeout(resolve, 100));
              chartImageBase64 = offscreenCanvas.toDataURL('image/png');
              console.log("[exportReport PDF] Chart generated successfully.");

              // Calculate image dimensions for layout table
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageMargin = 40 * 2;
              const availableWidth = pageWidth - pageMargin;
              const imgProps = doc.getImageProperties(chartImageBase64);
              chartImgWidth = availableWidth * 0.9; // Use 90% width
              chartImgHeight = (imgProps.height * chartImgWidth) / imgProps.width;

            } else { console.error("[exportReport PDF] Failed to get 2D context."); }
          } catch (chartError) { console.error("[exportReport PDF] Client-side chart generation failed:", chartError); }
        } else { console.log("[exportReport PDF] Skipping chart generation (no status counts)."); }

        // --- Use autoTable for Layout ---
        autoTable(doc, {
            startY: startY,
            body: [ // Each inner array is a row, each element in inner array is a cell
                [summaryContent], // Row 1: Summary text
                // Row 2: Placeholder for image (content drawn in didDrawCell) or error text
                [chartImageBase64 ? '' : chartPlaceholderText]
            ],
            theme: 'plain', // No borders for layout table
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 'auto' } // Let the single column take available width
            },
            didDrawCell: (data) => {
                // Draw the image in the second row's cell if it exists
                if (data.section === 'body' && data.row.index === 1 && chartImageBase64) {
                    const cell = data.cell;
                    // Center image within the cell bounds
                    const x = cell.x + (cell.width - chartImgWidth) / 2;
                    const y = cell.y + 2; // Add small top padding
                    doc.addImage(chartImageBase64, 'PNG', x, y, chartImgWidth, chartImgHeight);
                    console.log(`[exportReport PDF] Drew chart image in autoTable cell at Y=${y}`);
                }
            },
            // Set row heights explicitly if needed, especially for the image row
             rowPageBreak: 'avoid', // Try to keep rows together
             bodyStyles: { // Set min height for rows
                 minCellHeight: 20 // Ensure minimum space for text
             }
        });


        // --- Table Removed ---

        console.log("[exportReport PDF] Saving PDF document.");
        doc.save(`${filename}.pdf`);

      } catch (error) {
        console.error('PDF Export failed', error);
        alert('Failed to export PDF report. Please try again.');
      }

    } else { // Handle CSV and Excel via backend
      try {
        const exportUrl = new URL(`http://localhost:8001/api/reports/export/${format}`)
        exportUrl.searchParams.append('template_id', activeTemplate)
        if (selectedFileId) {
          exportUrl.searchParams.append('file_id', selectedFileId)
        }
        const res = await fetch(exportUrl.toString())
        if (!res.ok) throw new Error(`Export failed: ${res.statusText}`)
        const blob = await res.blob()
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        if (format === 'csv') { a.download = `${filename}.csv` }
        else if (format === 'excel') { a.download = `${filename}.xlsx` }
        a.click()
        URL.revokeObjectURL(downloadUrl)
      } catch (error) {
        console.error(`${format.toUpperCase()} Export failed`, error)
        alert(`Failed to export ${format.toUpperCase()} report. Please try again.`)
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <GlassCard className="p-6 backdrop-blur-xl bg-gray-800/40 border border-gray-700/50">
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Reports Dashboard
        </h1>

        {/* Template Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Report Templates</h2>
          {templates.length === 0 ? (
             <p className="text-gray-400">No templates loaded.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(template => (
                <GlassCard
                  key={template.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                    activeTemplate === template.id
                      ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-900/30 to-purple-900/30'
                      : 'bg-gray-800/20 hover:bg-gray-700/30'
                  }`}
                  onClick={() => setActiveTemplate(template.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activeTemplate === template.id ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                    <h3 className="font-medium text-gray-100">{template.name}</h3>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-400 mt-2">{template.description}</p>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Report Actions */}
        {activeTemplate && (
          <div className="space-y-4">
            <Button
              onClick={() => generateReport(activeTemplate)}
              disabled={isLoading}
              className="w-full md:w-auto transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Report'}
            </Button>

            {reportData && reportData.rows.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportReport('csv')}
                  className="flex-1 md:flex-none bg-gray-800/50 hover:bg-gray-700/60 border-gray-700"
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportReport('excel')}
                  className="flex-1 md:flex-none bg-gray-800/50 hover:bg-gray-700/60 border-gray-700"
                >
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportReport('pdf')}
                  className="flex-1 md:flex-none bg-gray-800/50 hover:bg-gray-700/60 border-gray-700"
                >
                  Export PDF (Summary + Chart)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Report Preview Table */}
        {reportData && reportData.rows.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-300">
                {selectedFileId ? `Previewing File ID: ${selectedFileId}` : 'Report Preview'}
              </h2>
              {selectedFileId && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedFileId(null)}
                  className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1"
                >
                  Show All Files
                </Button>
              )}
            </div>
            <GlassCard className="p-4 overflow-x-auto bg-gray-800/30 backdrop-blur-lg">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {reportData.columns.map((col) => (
                      <th
                        key={col}
                        className="p-3 border-b border-gray-700/50 text-sm font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selectedFileId ? reportData.rows.filter(row => String(row.id) === selectedFileId) : reportData.rows)
                   .map((row, i) => (
                    <tr key={row.id || i} className="hover:bg-gray-800/40 transition-colors">
                      {reportData.columns.map((col) => (
                        <td
                          key={`${row.id || i}-${col}`}
                          className={`p-3 border-b border-gray-800/50 text-sm ${
                            col === 'id' ? 'cursor-pointer hover:text-blue-400 font-medium' : 'text-gray-300'
                          }`}
                          onClick={col === 'id' ? () => setSelectedFileId(row.id) : undefined}
                          title={col === 'id' ? `Click to preview only file ${row.id}` : undefined}
                        >
                          {/* Truncate long file names in preview only */}
                          {col === 'file_name' && typeof row[col] === 'string' && row[col].length > 50
                            ? `${row[col].substring(0, 47)}...`
                            : row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}
         {reportData && reportData.rows.length === 0 && !isLoading && (
             <p className="text-center text-gray-400 mt-6">No data found for this report.</p>
         )}
      </GlassCard>
    </div>
  )
}
