import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, MapPin, Users, UserSquare2, Plus, Activity, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { 
  getHospitals, createHospital, updateHospital, deleteHospital,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getGroups, getSupervisors
} from '../../services/api';

const HospitalAssignmentsPage = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Hospital Form State
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [isHospitalSubmitting, setIsHospitalSubmitting] = useState(false);
  const [hospitalFormData, setHospitalFormData] = useState({
    hospital_name: '', location: '', contact_person: '', phone: '', capacity: 0, available_slots: 0, status: 'active'
  });

  // Assignment Form State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [isAssignmentSubmitting, setIsAssignmentSubmitting] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    group_id: '', hospital_id: '', supervisor_id: '', start_date: '', end_date: '', status: 'active', notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [hospitalsData, assignmentsData, groupsData, supervisorsData] = await Promise.all([
        getHospitals(), getAssignments(), getGroups(), getSupervisors()
      ]);
      setHospitals(hospitalsData);
      setAssignments(assignmentsData);
      setGroups(groupsData);
      setSupervisors(supervisorsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  // --- Hospital Handlers ---
  const handleOpenAddHospital = () => {
    setHospitalFormData({ hospital_name: '', location: '', contact_person: '', phone: '', capacity: 0, available_slots: 0, status: 'active' });
    setEditingHospitalId(null);
    setIsHospitalModalOpen(true);
  };

  const handleEditHospital = (h) => {
    setHospitalFormData({
      hospital_name: h.hospital_name, location: h.location || '', contact_person: h.contact_person || '', phone: h.phone || '',
      capacity: h.capacity || 0, available_slots: h.available_slots || 0, status: h.status || 'active'
    });
    setEditingHospitalId(h.id);
    setIsHospitalModalOpen(true);
  };

  const handleDeleteHospital = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try { await deleteHospital(id); fetchData(); } catch (err) { alert(err.message); }
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setIsHospitalSubmitting(true);
    try {
      if (editingHospitalId) await updateHospital(editingHospitalId, hospitalFormData);
      else await createHospital(hospitalFormData);
      setIsHospitalModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); } 
    finally { setIsHospitalSubmitting(false); }
  };

  // --- Assignment Handlers ---
  const handleOpenAddAssignment = () => {
    setAssignmentFormData({ group_id: '', hospital_id: '', supervisor_id: '', start_date: '', end_date: '', status: 'planned', notes: '' });
    setEditingAssignmentId(null);
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = (a) => {
    setAssignmentFormData({
      group_id: a.group_id, hospital_id: a.hospital_id, supervisor_id: a.supervisor_id,
      start_date: formatDate(a.start_date), end_date: formatDate(a.end_date), status: a.status || 'planned', notes: a.notes || ''
    });
    setEditingAssignmentId(a.id);
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try { await deleteAssignment(id); fetchData(); } catch (err) { alert(err.message); }
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setIsAssignmentSubmitting(true);
    
    // Auto calculate duration in days
    let duration = '';
    if (assignmentFormData.start_date && assignmentFormData.end_date) {
      const start = new Date(assignmentFormData.start_date);
      const end = new Date(assignmentFormData.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      duration = `${diffDays} days`;
    }

    try {
      const payload = { ...assignmentFormData, duration };
      if (editingAssignmentId) await updateAssignment(editingAssignmentId, payload);
      else await createAssignment(payload);
      setIsAssignmentModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); } 
    finally { setIsAssignmentSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hospital Assignments</h1>
          <p className="text-gray-500 mt-1">Manage partner healthcare facilities and placement allocations.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleOpenAddAssignment} className="flex items-center space-x-2">
            <Plus size={18} />
            <span>New Assignment</span>
          </Button>
          <Button onClick={handleOpenAddHospital} className="flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Hospital</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500 font-medium">Loading data...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 font-medium">{error}</div>
      ) : (
      <>
        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((h) => (
            <Card key={h.id} className="p-6 transition-all hover:shadow-premium group relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                    <Hospital size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{h.hospital_name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-1" />
                      <span>{h.location || 'Unknown Location'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditHospital(h)} className="text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDeleteHospital(h.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Capacity / Slots</p>
                  <div className="flex items-center space-x-2 text-gray-800 font-bold">
                    <Activity size={16} className="text-green-500" />
                    <span className="text-sm">{h.capacity} Total / {h.available_slots} Available</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Contact</p>
                  <div className="flex items-center space-x-2 text-gray-800 font-bold truncate">
                    <UserSquare2 size={16} className="text-blue-600" />
                    <span className="text-xs truncate">{h.contact_person || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                 <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase", h.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                   {h.status || 'active'}
                 </span>
                 <span className="text-xs text-gray-500">{h.phone || 'No phone'}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Assignments Table */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Assignment History</h2>
          </div>
          <Card className="p-0 overflow-hidden border-none shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Hospital</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Supervisor</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Period & Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">No assignments found.</td></tr>
                  ) : assignments.map((row) => {
                    const group = groups.find(g => g.id === row.group_id);
                    const hospital = hospitals.find(h => h.id === row.hospital_id);
                    const supervisor = supervisors.find(s => s.id === row.supervisor_id);

                    return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group/row">
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{group ? group.group_name : 'Unknown Group'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{hospital ? hospital.hospital_name : 'Unknown Hospital'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{supervisor ? supervisor.full_name : 'Unassigned'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(row.start_date)} to {formatDate(row.end_date)}</span>
                        </div>
                        {row.duration && <span className="text-[10px] text-gray-400 ml-5">({row.duration})</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                          row.status === 'completed' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                        )}>{row.status || 'planned'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button onClick={() => handleEditAssignment(row)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteAssignment(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </>
      )}

      {/* Hospital Modal */}
      <Modal isOpen={isHospitalModalOpen} onClose={() => setIsHospitalModalOpen(false)} title={editingHospitalId ? "Edit Hospital" : "Add Hospital"}>
        <form onSubmit={handleHospitalSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Hospital Name</label>
            <select required value={hospitalFormData.hospital_name} onChange={e => setHospitalFormData({...hospitalFormData, hospital_name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Hospital</option>
              <option value="Shaafi Hospital">Shaafi Hospital</option>
              <option value="MCH">MCH</option>
              <option value="Habeeb Hospital">Habeeb Hospital</option>
              <option value="Horyaal Hospital">Horyaal Hospital</option>
            </select>
          </div>
          <Input label="Location" placeholder="e.g. Downtown District" value={hospitalFormData.location} onChange={e => setHospitalFormData({...hospitalFormData, location: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Person" placeholder="Name" value={hospitalFormData.contact_person} onChange={e => setHospitalFormData({...hospitalFormData, contact_person: e.target.value})} />
            <Input label="Phone Number" placeholder="Phone" value={hospitalFormData.phone} onChange={e => setHospitalFormData({...hospitalFormData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Capacity" type="number" value={hospitalFormData.capacity} onChange={e => setHospitalFormData({...hospitalFormData, capacity: parseInt(e.target.value) || 0})} />
            <Input label="Available Slots" type="number" value={hospitalFormData.available_slots} onChange={e => setHospitalFormData({...hospitalFormData, available_slots: parseInt(e.target.value) || 0})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select value={hospitalFormData.status} onChange={e => setHospitalFormData({...hospitalFormData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsHospitalModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isHospitalSubmitting}>{editingHospitalId ? "Update Hospital" : "Add Hospital"}</Button>
          </div>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} title={editingAssignmentId ? "Edit Assignment" : "New Hospital Assignment"}>
        <form onSubmit={handleAssignmentSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Select Group</label>
            <select required value={assignmentFormData.group_id} onChange={e => setAssignmentFormData({...assignmentFormData, group_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Select Hospital</label>
            <select required value={assignmentFormData.hospital_id} onChange={e => setAssignmentFormData({...assignmentFormData, hospital_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Hospital</option>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospital_name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Assign Supervisor</label>
            <select value={assignmentFormData.supervisor_id} onChange={e => setAssignmentFormData({...assignmentFormData, supervisor_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Supervisor</option>
              {supervisors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input required label="Start Date" type="date" value={assignmentFormData.start_date} onChange={e => setAssignmentFormData({...assignmentFormData, start_date: e.target.value})} />
             <Input required label="End Date" type="date" value={assignmentFormData.end_date} onChange={e => setAssignmentFormData({...assignmentFormData, end_date: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select value={assignmentFormData.status} onChange={e => setAssignmentFormData({...assignmentFormData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="planned">Planned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <Input label="Notes (Optional)" placeholder="Any special requirements..." value={assignmentFormData.notes} onChange={e => setAssignmentFormData({...assignmentFormData, notes: e.target.value})} />
          
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsAssignmentModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isAssignmentSubmitting}>{editingAssignmentId ? "Update Assignment" : "Confirm Assignment"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HospitalAssignmentsPage;
