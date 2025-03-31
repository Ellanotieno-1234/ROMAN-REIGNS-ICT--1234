'use client'
import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/GlassCard'
import ReportsTab from '@/components/ReportsTab'
import { Button } from '@/components/ui/button'

import { Bell, BarChart2, Users, Settings, LogOut, Menu, X, Search, ChevronDown, Zap, Database, Shield, Layout, Globe } from 'lucide-react'
import SecurityTab from '@/components/SecurityTab'
import { getData } from '@/lib/supabase'
import { Chart } from 'react-chartjs-2'
import { Chart as ChartJS, registerables } from 'chart.js'
ChartJS.register(...registerables)
import NavItem from '@/components/NavItem'
import EnhancedExcelUploader from '@/components/EnhancedExcelUploader'
import DataVisualization from '@/components/DataVisualization'
import { supabase } from '@/lib/supabase'

export default function AdminPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800/50 backdrop-blur-xl transition-all duration-300 flex flex-col border-r border-gray-700/50`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <Zap className="text-blue-400" size={24} />
              <span className="font-bold text-xl">ICTA 2067</span>
            </div>
          ) : (
            <Zap className="text-blue-400 mx-auto" size={24} />
          )}
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-full hover:bg-gray-7 00/50"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <NavItem icon={<Layout />} label="Dashboard" active={activeTab === 'dashboard'} expanded={sidebarOpen} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<Database />} label="Data Analysis" active={activeTab === 'analysis'} expanded={sidebarOpen} onClick={() => setActiveTab('analysis')} />
            <NavItem icon={<BarChart2 />} label="Reports" active={activeTab === 'reports'} expanded={sidebarOpen} onClick={() => setActiveTab('reports')} />
            <NavItem icon={<Users />} label="Users" active={activeTab === 'users'} expanded={sidebarOpen} onClick={() => setActiveTab('users')} />
            <NavItem icon={<Globe />} label="Network" active={activeTab === 'network'} expanded={sidebarOpen} onClick={() => setActiveTab('network')} />
            <NavItem icon={<Shield />} label="Security" active={activeTab === 'security'} expanded={sidebarOpen} onClick={() => setActiveTab('security')} />
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-700/50">
          <NavItem icon={<Settings />} label="Settings" expanded={sidebarOpen} onClick={() => setActiveTab('settings')} />
          <NavItem icon={<LogOut />} label="Logout" expanded={sidebarOpen} onClick={() => {}} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 shadow-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center rounded-lg bg-gray-700/50 px-2 py-1 flex-1 max-w-xl">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search analytics, reports, users..." 
                className="bg-transparent border-none focus:outline-none text-gray-200 px-2 py-1 w-full"
              />
            </div>
            
            <div className="flex items-center ml-4 space-x-4">
              <button 
                className="p-2 rounded-full hover:bg-gray-700/50 relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 hover:bg-gray-700/50 rounded-full py-1 px-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold">AS</span>
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="text-sm">Admin Systems</span>
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/50 backdrop-blur-xl rounded-md shadow-lg py-1 z-10 border border-gray-700/50">
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700/50">Your Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700/50">Account Settings</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700/50">Support</a>
                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut()
                        await supabase
                          .from('auth_logs')
                          .insert([{
                            event_type: 'logout',
                            ip_address: '127.0.0.1',
                            user_agent: navigator.userAgent
                          }])
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 text-red-400"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'analysis' && <AnalysisContent />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'users' && <UsersContent />}
          {activeTab === 'network' && <NetworkTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'settings' && <div className="text-center text-gray-400 mt-10">Settings Module Content</div>}
        </main>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [processedData, setProcessedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) throw error
        setProcessedData(data || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading dashboard...</div>
  }

  if (processedData.length === 0) {
    return <div className="text-center py-8 text-gray-400">No data available</div>
  }

  const currentData = processedData[0]
  const attendanceData = currentData.data || []
  const presentCount = attendanceData.filter((s: any) => s.Attendance === 1).length
  const totalStudents = attendanceData.length
  const attendanceRate = currentData.stats?.attendance_avg || (presentCount / totalStudents)
  const completionRate = currentData.stats?.completion_avg || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Export</button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover极速赛车开奖结果:bg-gray-600">Filter</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h3 className="text-gray-400 text-sm">Total Students</h3>
          <p className="text-3xl font-bold">{totalStudents}</p>
          <p className="text-green-400 text-sm mt-1">Current session</p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h3 className="text-gray-400 text-sm">Attendance Rate</h3>
          <p className="text-3xl font-bold">{Math.round(attendanceRate * 100)}%</p>
          <p className="text-green-400 text-sm mt-1">
            {presentCount} of {totalStudents} present
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h3 className="text-gray-400 text-sm">Completion Rate</h3>
          <p className="text-3xl font-bold">{Math.round(completionRate * 100)}%</p>
          <p className="text-yellow-400 text-sm mt-1">Current progress</p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h3 className="text-gray-400 text-sm">Avg. Score</h3>
          <p className="text-3xl font-bold">N/A</p>
          <p className="text-gray-400 text-sm mt-1">Not tracked</p>
        </div>
      </div>

      {/* Premium Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Attendance Overview</h2>
          <div className="h-64">
            <Chart
              type='pie'
              data={{
                labels: ['Present', 'Absent'],
                datasets: [{
                  data: [
                    Math.round(attendanceRate * 100),
                    100 - Math.round(attendanceRate * 100)
                  ],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderWidth: 0
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#ffffff'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
          <div className="h-64">
            <Chart
              type='line'
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                  label: 'Completion Rate',
                  data: [
                    Math.round(completionRate * 100),
                    Math.round(completionRate * 100) + 5,
                    Math.round(completionRate * 100) + 10,
                    Math.round(completionRate * 100) + 15
                  ],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                      color: '#ffffff'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                      color: '#ffffff'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Student Attendance</h2>
          <div className="h-64">
            <Chart
              type='bar'
              data={{
                labels: ['Present', 'Absent'],
                datasets: [{
                  label: 'Students',
                  data: [presentCount, totalStudents - presentCount],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderRadius: 4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                      color: '#ffffff'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                      color: '#ffffff'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalysisContent() {
  const [processedData, setProcessedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from Supabase...')
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .order('created_at', { ascending: false })
        
        console.log('Supabase response data structure:', JSON.stringify(data?.[0], null, 2))
        
        if (error) throw error
        
        // Verify and transform data if needed
        const verifiedData = data?.map(item => ({
          ...item,
          data: item.data || {},
          stats: item.data?.stats || {
            attendance_avg: 0.85,
            completion_avg: 0.65
          }
        })) || []
        
        console.log('Processed data structure:', JSON.stringify(verifiedData?.[0], null, 2))
        setProcessedData(verifiedData)
        setError(null)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setError(error.message || 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUploadSuccess = (data: any) => {
    if (data.error) {
      setError(data.message)
      return
    }
    setProcessedData(prev => [...prev, data.supabaseData])
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Analysis</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Run Analysis</button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Configure</button>
        </div>
      </div>
      <EnhancedExcelUploader onUploadSuccess={handleUploadSuccess} />

      {isLoading && (
        <div className="text-center py-8 text-gray-400">
          Loading data...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 text-red-300 rounded text-sm">
          {error}
        </div>
      )}

      {!isLoading && processedData.length === 0 && !error && (
        <div className="text-center py-8 text-gray-400">
          No data available. Upload an Excel file to get started.
        </div>
      )}

      {processedData.length > 0 && (() => {
        const currentData = processedData[0];
        const attendanceData = currentData.data || [];
        
        // Calculate attendance stats
        interface StudentRecord {
          Name: string;
          Email: string;
          Attendance: number;
          'Student ID': string;
          Organization: string;
          attendanceRate: number;
          completionRate: number;
        }
        
        const presentCount = attendanceData.filter((s: StudentRecord) => s.Attendance === 1).length;
        const absentCount = attendanceData.length - presentCount;
        const attendanceRate = currentData.stats?.attendance_avg || (presentCount / attendanceData.length);
        const completionRate = currentData.stats?.completion_avg || 0.65;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Attendance Rate</h2>
              <div className="h-64">
                <Chart
                  type='pie'
                  data={{
                    labels: ['Present', 'Absent'],
                    datasets: [{
                      data: [
                        Math.round(attendanceRate * 100),
                        100 - Math.round(attendanceRate * 100)
                      ],
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: '#ffffff'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
              <div className="h-64">
                <Chart
                  type='line'
                  data={{
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                      label: 'Completion Rate',
                      data: [
                        Math.round(completionRate * 100),
                        Math.round(completionRate * 100) + 7,
                        Math.round(completionRate * 100) + 15,
                        Math.round(completionRate * 100) + 13
                      ],
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          color: 'rgba(255,255,255,0.1)'
                        },
                        ticks: {
                          color: '#ffffff'
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(255,255,255,0.1)'
                        },
                        ticks: {
                          color: '#ffffff'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-lg border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Student Attendance</h2>
              <div className="h-64">
                <Chart
                  type='bar'
                  data={{
                    labels: ['Present', 'Absent'],
                    datasets: [{
                      label: 'Students',
                      data: [presentCount, absentCount],
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderRadius: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255,255,255,0.1)'
                        },
                        ticks: {
                          color: '#ffffff'
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(255,255,255,0.1)'
                        },
                        ticks: {
                          color: '#ffffff'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}


import UserManagementTab from '@/components/UserManagementTab';
import NetworkTab from '@/components/NetworkTab';

function UsersContent() {
  return <UserManagementTab />;
}
