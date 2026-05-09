import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserSquare2, Hospital, Calendar, Plus, Edit2, Trash2, Settings2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { getGroups, createGroup, updateGroup, deleteGroup, addStudentsToGroup, getSupervisors, getHospitals, getStudents } from '../../services/api';

const GroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [students, setStudents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    group_name: '',
    academic_year: '',
    department: '',
    supervisor_id: '',
    hospital_id: '',
    start_date: '',
    end_date: '',
    status: 'upcoming'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [groupsData, supervisorsData, hospitalsData, studentsData] = await Promise.all([
        getGroups(),
        getSupervisors(),
        getHospitals(),
        getStudents()
      ]);
      setGroups(groupsData);
      setSupervisors(supervisorsData);
      setHospitals(hospitalsData);
      setStudents(studentsData);
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
    fetchData();
  }, [navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const handleOpenAdd = () => {
    setFormData({
      group_name: '', academic_year: '', department: '', supervisor_id: '', hospital_id: '', start_date: '', end_date: '', status: 'upcoming'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (group) => {
    setFormData({
      group_name: group.group_name,
      academic_year: group.academic_year || '',
      department: group.department || '',
      supervisor_id: group.supervisor_id || '',
      hospital_id: group.hospital_id || '',
      start_date: formatDate(group.start_date),
      end_date: formatDate(group.end_date),
      status: group.status || 'upcoming'
    });
    setEditingId(group.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(id);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateGroup(editingId, formData);
      } else {
        await createGroup(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStudentModal = (group) => {
    setSelectedGroupId(group.id);
    const existingIds = students.filter(s => s.group_id === group.id).map(s => s.id);
    setSelectedStudentIds(existingIds);
    setIsStudentModalOpen(true);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveStudents = async () => {
    if (!selectedGroupId) return;
    setIsSubmitting(true);
    try {
      await addStudentsToGroup(selectedGroupId, selectedStudentIds);
      setIsStudentModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Internship Groups</h1>
          <p className="text-gray-500 mt-1">Organize students into groups and assign clinical rotations.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center space-x-2">
          <Plus size={18} />
          <span>Create New Group</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500 font-medium">Loading groups...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 font-medium">{error}</div>
      ) : groups.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-medium">No groups found.</div>
      ) : (
      <div className="grid grid-cols-1 gap-6">
        {groups.map((group) => {
          const supervisor = supervisors.find(s => s.id === group.supervisor_id);
          const hospital = hospitals.find(h => h.id === group.hospital_id);
          const studentCount = students.filter(s => s.group_id === group.id).length;

          return (
          <Card key={group.id} className="p-0 overflow-hidden group hover:shadow-premium transition-all duration-300">
            <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{group.group_name}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm font-medium text-gray-500">{studentCount} Students</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      group.status === 'active' ? "text-green-600" : 
                      group.status === 'upcoming' ? "text-blue-600" : "text-gray-400"
                    )}>{group.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 max-w-3xl">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supervisor</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 font-semibold">
                    <UserSquare2 size={16} className="text-gray-400" />
                    <span>{supervisor ? supervisor.full_name : 'Unassigned'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hospital</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 font-semibold">
                    <Hospital size={16} className="text-gray-400" />
                    <span>{hospital ? hospital.hospital_name : 'Unassigned'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 font-semibold">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="truncate">{formatDate(group.start_date)} — {formatDate(group.end_date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenStudentModal(group)}>Manage Students</Button>
                <button onClick={() => handleEdit(group)} className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-gray-50 transition-all" title="Edit Group">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(group.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-50 transition-all" title="Delete Group">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-50 flex">
              <div className={cn(
                "h-full transition-all duration-500",
                group.status === 'active' ? "bg-green-500 w-[65%] shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                group.status === 'upcoming' ? "bg-blue-300 w-[5%]" : "bg-gray-300 w-full"
              )}></div>
            </div>
          </Card>
          );
        })}
      </div>
      )}

      {/* Add/Edit Group Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Group" : "Create New Group"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Group Name" placeholder="e.g. Group Epsilon" value={formData.group_name} onChange={e => setFormData({...formData, group_name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Clinical Supervisor</label>
              <select value={formData.supervisor_id} onChange={e => setFormData({...formData, supervisor_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
                <option value="">Select Supervisor</option>
                {supervisors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Hospital</label>
              <select value={formData.hospital_id} onChange={e => setFormData({...formData, hospital_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospital_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Academic Year" placeholder="e.g. 2024-2025" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} />
            <Input label="Department" placeholder="e.g. Nursing" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            <Input label="End Date" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingId ? "Update Group" : "Create Group"}</Button>
          </div>
        </form>
      </Modal>

      {/* Manage Students Modal */}
      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title="Manage Group Students">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select the students you want to assign to this group. Changes are saved immediately.</p>
          <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
            {students.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No students available.</div>
            ) : (
              students.map(student => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div 
                    key={student.id} 
                    onClick={() => handleStudentToggle(student.id)}
                    className={cn(
                      "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                      isSelected ? "bg-blue-50/50" : ""
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.student_id} - {student.department}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                    )}>
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStudents} isLoading={isSubmitting}>Save Assignments</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupsPage;
