import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Eye, UserPlus, Download, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { 
  getStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  getHospitals, 
  getGroups,
  downloadStudentsReport 
} from '../../services/api';

const StudentsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  
  const [students, setStudents] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    student_id: '',
    department: 'Nursing',
    group_id: '',
    hospital_id: '',
    internship_status: 'pending'
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentsData, hospitalsData, groupsData] = await Promise.all([
        getStudents(),
        getHospitals(),
        getGroups()
      ]);
      setStudents(studentsData);
      setHospitals(hospitalsData);
      setGroups(groupsData);
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

  const filteredStudents = students.filter(s => 
    (activeTab === 'All' || (s.internship_status && s.internship_status.toLowerCase() === activeTab.toLowerCase())) &&
    ((s.full_name && s.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
     (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (student) => {
    setFormData({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || '',
      student_id: student.student_id,
      department: student.department || 'Nursing',
      group_id: student.group_id || '',
      hospital_id: student.hospital_id || '',
      internship_status: student.internship_status || 'pending',
    });
    setEditingId(student.id);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      student_id: '',
      department: 'Nursing',
      group_id: '',
      hospital_id: '',
      internship_status: 'pending',
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleView = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
         await updateStudent(editingId, formData);
      } else {
         await createStudent(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Directory</h1>
          <p className="text-gray-500 mt-1">Manage all registered students and their placement status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl shadow-sm"
            onClick={async () => {
              try {
                await downloadStudentsReport();
              } catch (err) {
                alert('Failed to export PDF: ' + err.message);
              }
            }}
          >
            <FileText size={18} />
            <span>Export List</span>
          </Button>
          <Button onClick={handleOpenAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all">
            <UserPlus size={18} />
            <span className="font-semibold">Add Student</span>
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-0 overflow-hidden border-none shadow-premium">
        <div className="p-4 bg-white border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
            {['All', 'Active', 'Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-lg transition-all",
                  activeTab === tab 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 font-medium">Loading students...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-medium">{error}</div>
          ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">ID Number</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : filteredStudents.map((student) => {
                const groupName = student.group_id ? (groups.find(g => g.id === student.group_id)?.group_name || 'Group') : 'Unassigned';
                const hospitalName = student.hospital_id ? (hospitals.find(h => h.id === student.hospital_id)?.hospital_name || 'Hospital') : '-';

                return (
                <tr key={student.id} className="group hover:bg-gray-50/50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                        {student.full_name ? student.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{student.student_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.department || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                      {groupName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{hospitalName}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      student.internship_status === 'active' && "bg-green-100 text-green-700",
                      student.internship_status === 'pending' && "bg-yellow-100 text-yellow-700",
                      student.internship_status === 'completed' && "bg-green-100 text-green-700"
                    )}>
                      {student.internship_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleView(student)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(student)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          )}
        </div>
        
        {/* Pagination */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">Showing 1 to {filteredStudents.length} of {students.length} students</p>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm">Next</Button>
          </div>
        </div>
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Student" : "Add New Student"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            <Input label="Email Address" type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Student ID" placeholder="STU-XXXXX" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required />
            <Input label="Phone Number" type="tel" placeholder="061XXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
                <option value="Nursing">Nursing</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Radiology">Radiology</option>
                <option value="Physiotherapy">Physiotherapy</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Group</label>
              <select value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
                <option value="">Unassigned</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Hospital</label>
              <select value={formData.hospital_id} onChange={e => setFormData({...formData, hospital_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
                <option value="">Unassigned</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospital_name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Internship Status</label>
              <select value={formData.internship_status} onChange={e => setFormData({...formData, internship_status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingId ? "Update Student" : "Create Student"}</Button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Details">
        {viewingStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xl">
                {viewingStudent.full_name ? viewingStudent.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{viewingStudent.full_name}</h3>
                <p className="text-sm text-gray-500">{viewingStudent.student_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                <p className="text-sm font-semibold text-gray-800">{viewingStudent.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800">{viewingStudent.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                <p className="text-sm font-semibold text-gray-800">{viewingStudent.department || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Group Assignment</p>
                <p className="text-sm font-semibold text-gray-800">
                  {viewingStudent.group_id ? (groups.find(g => g.id === viewingStudent.group_id)?.group_name || 'Group') : 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Hospital Placement</p>
                <p className="text-sm font-semibold text-gray-800">
                  {viewingStudent.hospital_id ? (hospitals.find(h => h.id === viewingStudent.hospital_id)?.hospital_name || 'Hospital') : 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Internship Status</p>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block",
                  viewingStudent.internship_status === 'active' && "bg-green-100 text-green-700",
                  viewingStudent.internship_status === 'pending' && "bg-yellow-100 text-yellow-700",
                  viewingStudent.internship_status === 'completed' && "bg-green-100 text-green-700"
                )}>
                  {viewingStudent.internship_status || 'pending'}
                </span>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end">
              <Button onClick={() => setIsViewModalOpen(false)}>Close Details</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsPage;
