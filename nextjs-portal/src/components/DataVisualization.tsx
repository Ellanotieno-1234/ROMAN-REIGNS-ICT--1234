'use client'
import { useState } from 'react'
import { Chart } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  registerables,
  ChartOptions,
  ChartData,
  ScaleOptionsByType
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import Annotation from 'chartjs-plugin-annotation'
import DataLabels from 'chartjs-plugin-datalabels'
import { useEffect } from 'react'

// Register ChartJS components
ChartJS.register(...registerables, zoomPlugin, Annotation, DataLabels)
import { useRealtime } from '@/lib/websocketService'
import type { Database } from '@/types/database.types'
import type { ApexOptions } from 'apexcharts'

interface AnalysisData {
  stats?: {
    record_count: number
    attendance_avg?: number
    completion_avg?: number
  }
  records?: Array<{
    [key: string]: any
  }>
}

interface DataVisualizationProps {
  initialData: Array<Database['public']['Tables']['analysis_results']['Row'] & {
    data: AnalysisData
  }>
}

export default function DataVisualization({ initialData }: DataVisualizationProps) {
  const [chartData, setChartData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)

  useRealtime<Database['public']['Tables']['analysis_results']['Row'] & { data: AnalysisData }>({
    table: 'analysis_results',
    onUpdate: (payload) => {
      if (payload.data) {
        setChartData(prev => [...prev, payload])
      }
    },
    onError: (error) => {
      console.error('Realtime error:', error)
    }
  })

  const chartDataConfig: ChartData<'bar', number[], string> = {
    labels: chartData.map(item => item.file_name),
    datasets: [
      {
        label: 'Records',
        data: chartData.map(item => item.data?.stats?.record_count || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 4
      }
    ]
  }

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#ffffff',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        padding: 16,
        bodyFont: {
          size: 14
        },
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw.toLocaleString()}%`
          }
        }
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'xy' as const
        },
        pan: {
          enabled: true,
          mode: 'xy' as const
        }
      },
      datalabels: {
        color: '#ffffff',
        formatter: (value: number) => value.toLocaleString(),
        align: 'top' as const,
        offset: 4
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: '#ffffff',
          callback: (value: string|number) => typeof value === 'number' ? `${value}%` : value
        }
      }
    }
  }

  return (
    <div className="w-full bg-white/5 p-6 rounded-lg h-[400px]">
      {isLoading ? (
        <div className="text-center py-10">Loading data...</div>
      ) : (
        <Chart
          type='bar'
          data={chartDataConfig as ChartData<'bar', number[], string>}
          options={chartOptions}
        />
      )}
    </div>
  )
}
