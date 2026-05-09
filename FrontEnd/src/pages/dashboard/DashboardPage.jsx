import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserSquare2,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import {
  getDashboardSummary,
  getPlacementTrends,
  getRecentActivities,
  getPendingApprovals,
  getCompletionRate,
  getHospitals,
  getGroups,
  getSupervisors,
  createAssignment,
  downloadDashboardReport
} from '../../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    totalGroups: 0,
    activeInternships: 0
  });
  const [trends, setTrends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [completionStats, setCompletionStats] = useState({
    completed: 0,
    ongoing: 0,
    completion_percentage: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Placement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [groups, setGroups] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [placementData, setPlacementData] = useState({
    group_id: '',
    hospital_id: '',
    supervisor_id: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, trendsData, activitiesData, approvalsData, completionData] = await Promise.allSettled([
        getDashboardSummary(),
        getPlacementTrends(),
        getRecentActivities(),
        getPendingApprovals(),
        getCompletionRate()
      ]);

      if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
      if (trendsData.status === 'fulfilled') setTrends(trendsData.value);
      if (activitiesData.status === 'fulfilled') setActivities(activitiesData.value);
      if (approvalsData.status === 'fulfilled') setPendingApprovals(approvalsData.value);
      if (completionData.status === 'fulfilled') setCompletionStats(completionData.value);

      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
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
    fetchAllData();
  }, [navigate]);

  const handleOpenPlacementModal = async () => {
    try {
      const [hospData, groupData, supData] = await Promise.all([
        getHospitals(),
        getGroups(),
        getSupervisors()
      ]);
      setHospitals(hospData);
      setGroups(groupData);
      setSupervisors(supData);
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to load placement options');
    }
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAssignment(placementData);
      setIsModalOpen(false);
      fetchAllData();
      alert('New placement added successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Total Students', value: isLoading ? '...' : summary.totalStudents.toString(), icon: Users, color: 'bg-blue-600', trend: '+12.5%', isUp: true },
    { label: 'Total Supervisors', value: isLoading ? '...' : summary.totalSupervisors.toString(), icon: UserSquare2, color: 'bg-green-500', trend: '+3.2%', isUp: true },
    { label: 'Total Groups', value: isLoading ? '...' : summary.totalGroups.toString(), icon: Layers, color: 'bg-blue-600', trend: '+8.1%', isUp: true },
    { label: 'Active Internships', value: isLoading ? '...' : (summary.activeInternships || 0).toString(), icon: Activity, color: 'bg-green-500', trend: '-2.4%', isUp: false },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            onClick={async () => {
              try {
                await downloadDashboardReport();
              } catch (err) {
                setError('Failed to download report');
              }
            }}
            className="flex items-center space-x-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2.5 shadow-sm"
          >
            <span>Download Report</span>
          </Button>
          <Button onClick={handleOpenPlacementModal} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all">
            <Plus size={18} />
            <span className="font-semibold">Add New Placement</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-shake">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center space-x-1 text-sm font-bold",
                stat.isUp ? "text-green-500" : "text-red-500"
              )}>
                <span>{stat.trend}</span>
                {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Placement Trends"
            subtitle="Monthly student placements vs completed internships"
          />
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.length > 0 ? trends : [
                { month: 'Jan', students: 0, completed: 0 },
                { month: 'Feb', students: 0, completed: 0 },
                { month: 'Mar', students: 0, completed: 0 }
              ]}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activities" subtitle="Latest system updates" />
          <div className="space-y-6">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm italic">No recent activities found</div>
            ) : (
              activities.map((activity, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className={cn(
                    "p-2.5 rounded-xl shrink-0",
                    i % 2 === 0 ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  )}>
                    <Activity size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <button className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All Activities
            </button>
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Pending Approvals" subtitle="Requests requiring your attention" />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 font-semibold text-sm text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="pb-4 font-semibold text-sm text-gray-400 uppercase tracking-wider">Hospital</th>
                  <th className="pb-4 font-semibold text-sm text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-4 font-semibold text-sm text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingApprovals.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">No pending approvals</td>
                  </tr>
                ) : (
                  pendingApprovals.map((req, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <p className="text-sm font-bold text-gray-800">{req.student_name}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-500">{req.assigned_hospital || 'Unassigned'}</p>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 font-bold text-sm">Review</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Completion Rate" subtitle="Students finishing their internship" />
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="502.6"
                  strokeDashoffset={502.6 - (502.6 * completionStats.completion_percentage) / 100}
                  className="text-green-500 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-4xl font-bold text-gray-800">{completionStats.completion_percentage}%</p>
                <p className="text-xs font-medium text-gray-500">Overall Rate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8 w-full">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-xl font-bold text-gray-800">{completionStats.completed}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Ongoing</p>
                <p className="text-xl font-bold text-gray-800">{completionStats.ongoing}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Placement Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Quick Placement Assignment">
        <form onSubmit={handlePlacementSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Select Group</label>
              <select
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium shadow-sm"
                value={placementData.group_id}
                onChange={e => setPlacementData({ ...placementData, group_id: e.target.value })}
                required
              >
                <option value="">Choose a group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.group_name} ({g.department})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Hospital</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium shadow-sm"
                  value={placementData.hospital_id}
                  onChange={e => setPlacementData({ ...placementData, hospital_id: e.target.value })}
                  required
                >
                  <option value="">Select Hospital...</option>
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospital_name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Supervisor</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium shadow-sm"
                  value={placementData.supervisor_id}
                  onChange={e => setPlacementData({ ...placementData, supervisor_id: e.target.value })}
                  required
                >
                  <option value="">Select Supervisor...</option>
                  {supervisors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={placementData.start_date}
                onChange={e => setPlacementData({ ...placementData, start_date: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={placementData.end_date}
                onChange={e => setPlacementData({ ...placementData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-5 flex items-center justify-end space-x-3 border-t border-gray-100 mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Confirm Placement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
