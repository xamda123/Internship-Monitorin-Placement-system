import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, Users, Hospital, CheckCircle, Layers, Activity, UserSquare2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  getDashboardSummary, 
  getStudentsPerHospital, 
  getInternshipStatusBreakdown, 
  getSupervisorSummary, 
  getHospitals,
  downloadDashboardReport 
} from '../../services/api';

const COLORS = ['#2563eb', '#22c55e', '#60a5fa', '#4ade80', '#1d4ed8'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [hospitalChartData, setHospitalChartData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [supervisorChartData, setSupervisorChartData] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, hospStats, statusStats, supStats, hospData] = await Promise.all([
        getDashboardSummary(),
        getStudentsPerHospital(),
        getInternshipStatusBreakdown(),
        getSupervisorSummary(),
        getHospitals()
      ]);
      
      setSummary(summaryData);
      setHospitals(hospData);
      
      setHospitalChartData(hospStats.map(item => ({
        name: item.hospital_name || 'Unknown',
        students: parseInt(item.student_count) || 0
      })));
      
      setStatusChartData(statusStats.map(item => ({
        name: (item.status || 'unknown').toUpperCase(),
        count: parseInt(item.count) || 0
      })));

      setSupervisorChartData(supStats.map(item => ({
        name: item.supervisor_name || 'Unknown',
        groups: parseInt(item.groups_assigned) || 0
      })));
      
      setError('');
    } catch (err) {
      setError('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const completedInternships = statusChartData.find(s => s.name === 'COMPLETED')?.count || 0;
  const activeInternships = summary.activeInternships || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into internship performance and placement data.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2"
            onClick={() => alert('Filter feature coming soon: This will allow you to filter reports by Date Range, Department, or Hospital.')}
          >
            <Filter size={18} />
            <span>Filter Data</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={async () => {
              try {
                await downloadDashboardReport();
              } catch (err) {
                setError('Failed to export report');
              }
            }}
          >
            <Download size={18} />
            <span>Export PDF Report</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading analytics data...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-500 font-medium">{error}</div>
      ) : (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1 - Gradient Cards */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg"><Users size={24} /></div>
            </div>
            <h3 className="text-sm font-medium text-blue-100">Total Students</h3>
            <p className="text-3xl font-bold mt-1">{summary.totalStudents || 0}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg"><Activity size={24} /></div>
            </div>
            <h3 className="text-sm font-medium text-green-100">Active Internships</h3>
            <p className="text-3xl font-bold mt-1">{activeInternships}</p>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg"><CheckCircle size={24} /></div>
            </div>
            <h3 className="text-sm font-medium text-gray-400">Completed Internships</h3>
            <p className="text-3xl font-bold mt-1 text-gray-100">{completedInternships}</p>
          </Card>

          {/* Row 2 - White Cards */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Hospital size={24} /></div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Hospitals</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{hospitals.length}</p>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><UserSquare2 size={24} /></div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Supervisors</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{summary.totalSupervisors || 0}</p>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={24} /></div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Groups</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{summary.totalGroups || 0}</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader title="Internship Status Breakdown" subtitle="Current status of all registered students" />
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Students" maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Students per Hospital" subtitle="Distribution of active student placements" />
            <div className="h-[300px] w-full flex items-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hospitalChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="students"
                  >
                    {hospitalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader 
            title="Supervisor Workload Overview" 
            subtitle="Number of groups assigned to each clinical supervisor"
          />
          <div className="h-[350px] w-full mt-6">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={supervisorChartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
                 <Tooltip 
                   cursor={{fill: '#f9fafb'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                 />
                 <Bar dataKey="groups" fill="#22c55e" radius={[4, 4, 0, 0]} name="Assigned Groups" maxBarSize={60} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </>
      )}
    </div>
  );
};

export default ReportsPage;
