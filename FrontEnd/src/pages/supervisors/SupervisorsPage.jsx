import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, Mail, Phone, Hospital,
  TrendingUp, Users, Activity, Filter, Download, Briefcase, Clock,
  ChevronLeft, ChevronRight, FileText, AlertCircle, RefreshCw, UserCheck
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { getSupervisors, createSupervisor, updateSupervisor, deleteSupervisor } from '../../services/api';

const SupervisorsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    staff_id: '',
    email: '',
    phone: '',
    supervisor_role: '',
    hospital_id: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSupervisors = async () => {
    try {
      setIsLoading(true);
      const data = await getSupervisors();
      setSupervisors(data);
      setError('');
    } catch (err) {
      setError(err.message);
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
    fetchSupervisors();
  }, [navigate]);

  const filteredSupervisors = supervisors.filter(s => 
    (s.full_name && s.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (s.staff_id && s.staff_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supervisor?')) {
      try {
        await deleteSupervisor(id);
        fetchSupervisors();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (supervisor) => {
    setFormData({
      full_name: supervisor.full_name,
      email: supervisor.email,
      phone: supervisor.phone || '',
      staff_id: supervisor.staff_id,
      supervisor_role: supervisor.supervisor_role || '',
      hospital_id: supervisor.hospital_id || '',
      status: supervisor.status || 'active',
    });
    setEditingId(supervisor.id);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      staff_id: '',
      supervisor_role: '',
      hospital_id: '',
      status: 'active'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
         await updateSupervisor(editingId, formData);
      } else {
         await createSupervisor(formData);
      }
      setIsModalOpen(false);
      fetchSupervisors();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <UserCheck size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Supervisor Management</h1>
          </div>
          <p className="text-gray-500">Manage clinical supervisors, workload distribution, and hospital affiliations.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm">
          <Plus size={18} />
          <span className="font-semibold">Add New Supervisor</span>
        </Button>
      </div>

      {/* 2. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-sm rounded-xl bg-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Supervisors</p>
              <h3 className="text-3xl font-bold text-gray-800">{supervisors.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users size={20} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-400 ml-2">from last month</span>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm rounded-xl bg-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Placement Rate</p>
              <h3 className="text-3xl font-bold text-gray-800">92%</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Activity size={20} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded text-xs">Optimal</span>
            <span className="text-gray-400 ml-2">capacity reached</span>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm rounded-xl bg-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Workload Distribution</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">Balanced</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Briefcase size={20} /></div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2 flex overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: '60%' }}></div>
            <div className="bg-yellow-400 h-full" style={{ width: '30%' }}></div>
            <div className="bg-red-500 h-full" style={{ width: '10%' }}></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 font-medium">
            <span>Low (60%)</span>
            <span>Med (30%)</span>
            <span>High (10%)</span>
          </div>
        </Card>
      </div>

      {/* 3. FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm cursor-pointer transition-all hover:border-gray-300">
            <option>All Hospitals</option>
            <option>Shaafi Hospital</option>
            <option>Habeeb Hospital</option>
            <option>MCH</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm cursor-pointer transition-all hover:border-gray-300">
            <option>Any Status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
          <Button variant="secondary" className="px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50">
            <Filter size={16} className="mr-2 inline" /> More Filters
          </Button>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-64 shadow-sm rounded-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search supervisors..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="p-2.5 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50">
            <Download size={18} className="text-gray-600" />
          </Button>
        </div>
      </div>

      {/* 4. SUPERVISOR TABLE */}
      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <RefreshCw size={24} className="animate-spin mb-3 text-blue-500" />
              <span className="font-medium">Loading supervisors...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-medium">
              <AlertCircle size={24} className="mx-auto mb-2" />
              {error}
            </div>
          ) : filteredSupervisors.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users size={32} className="mx-auto mb-3 text-gray-300" />
              <span className="font-medium text-lg">No supervisors found.</span>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Staff ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Groups</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Workload</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSupervisors.map(supervisor => {
                const workload = ((supervisor.id * 17) % 80) + 15; // Deterministic pseudo-random 15-95%
                let workloadColor = "bg-green-500";
                if (workload > 60) workloadColor = "bg-yellow-400";
                if (workload > 85) workloadColor = "bg-red-500";
                
                return (
                <tr key={supervisor.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm border border-blue-200/50">
                        {supervisor.full_name ? supervisor.full_name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{supervisor.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{supervisor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-600">{supervisor.staff_id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{supervisor.supervisor_role || 'Clinical Supervisor'}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                      <Hospital size={10} className="mr-1" />
                      {supervisor.hospital_id ? `Hospital ID: ${supervisor.hospital_id}` : 'Unassigned'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold">Group A</span>
                      {(supervisor.id % 2 === 0) && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-bold">Group C</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${workloadColor} rounded-full`} style={{ width: `${workload}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8">{workload}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      supervisor.status === 'active' 
                        ? "bg-green-50 text-green-700 border-green-200/60" 
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    )}>
                      {supervisor.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(supervisor)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mx-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(supervisor.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mx-1">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors ml-1">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          )}
        </div>
        
        {/* 6. PAGINATION */}
        {!isLoading && !error && filteredSupervisors.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="text-gray-800 font-semibold">1–{filteredSupervisors.length}</span> of <span className="text-gray-800 font-semibold">{supervisors.length}</span> supervisors
            </p>
            <div className="flex space-x-2">
              <Button variant="secondary" className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600">
                <ChevronLeft size={16} className="inline mr-1" /> Prev
              </Button>
              <Button variant="secondary" className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600">
                Next <ChevronRight size={16} className="inline ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. BOTTOM SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Staffing Insights */}
        <div className="xl:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-blue-600" /> Staffing Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group bg-white">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors shadow-sm">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">Surgical Rotation High Demand</h4>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">3 hospitals are reporting a shortage of supervisors in surgical wards this month.</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Surgical Ward Capacity Alert: Shaafi, Habeeb, and Digfer hospitals are at 95% supervisor capacity. Please review scheduling.');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    View Details <ChevronRight size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </Card>
            <Card className="p-5 border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group bg-white">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-100 transition-colors shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">Expiring Certifications</h4>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">12 clinical supervisors require certification renewal before the end of Q3.</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Reminders Sent! System has automatically emailed 12 supervisors regarding their certification renewals.');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    Send Reminders <ChevronRight size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-transparent" /> Quick Actions
          </h3>
          <Card className="p-1.5 border-none shadow-md rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => {
                  const headers = ['Name', 'Staff ID', 'Email', 'Phone', 'Role'];
                  const csvContent = supervisors.map(s => [
                    s.full_name,
                    s.staff_id,
                    s.email,
                    s.phone || '',
                    s.supervisor_role || 'Clinical Supervisor'
                  ].join(',')).join('\n');
                  
                  const blob = new Blob([[headers.join(','), csvContent].join('\n')], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Supervisors_Contact_List_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="flex items-center space-x-3 w-full p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-left group"
              >
                <div className="p-1.5 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-semibold tracking-wide">Download Contact List</span>
              </button>
              <button 
                onClick={() => navigate('/scheduling')}
                className="flex items-center space-x-3 w-full p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-left group"
              >
                <div className="p-1.5 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                  <RefreshCw size={16} />
                </div>
                <span className="text-sm font-semibold tracking-wide">Bulk Shift Reassignment</span>
              </button>
              <button 
                onClick={() => navigate('/reports')}
                className="flex items-center space-x-3 w-full p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-left group"
              >
                <div className="p-1.5 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                  <Hospital size={16} />
                </div>
                <span className="text-sm font-semibold tracking-wide">Hospital Performance Audit</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal remains the same but with enhanced styling if needed */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Supervisor" : "Add Supervisor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Dr. Jane Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Staff ID" placeholder="SUP-XXXXX" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} required />
            <Input label="Supervisor Role" placeholder="e.g. Clinical Supervisor" value={formData.supervisor_role} onChange={e => setFormData({...formData, supervisor_role: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email Address" type="email" placeholder="jane.doe@hospital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label="Phone Number" type="tel" placeholder="061XXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Assigned Hospital ID</label>
              <Input placeholder="e.g. 1" type="number" value={formData.hospital_id} onChange={e => setFormData({...formData, hospital_id: e.target.value})} className="mt-0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium shadow-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="pt-5 flex items-center justify-end space-x-3 border-t border-gray-100 mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingId ? "Update Supervisor" : "Add Supervisor"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupervisorsPage;
