import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Filter, Plus, List, Grid } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { 
  getAssignments, createAssignment, 
  getGroups, getHospitals, getSupervisors 
} from '../../services/api';

const SchedulingPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    group_id: '', hospital_id: '', supervisor_id: '', start_date: '', end_date: '', status: 'active', notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsData, groupsData, hospitalsData, supervisorsData] = await Promise.all([
        getAssignments(), getGroups(), getHospitals(), getSupervisors()
      ]);
      setAssignments(assignmentsData);
      setGroups(groupsData);
      setHospitals(hospitalsData);
      setSupervisors(supervisorsData);
      setError('');
    } catch (err) {
      setError('Failed to load scheduling data');
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

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Insights Calculations
  const activeAssignments = assignments.filter(a => a.status === 'active' || a.status === 'ongoing');
  const uniqueHospitals = new Set(activeAssignments.map(a => a.hospital_id)).size;
  
  let totalHours = 0;
  activeAssignments.forEach(a => {
    if (a.start_date && a.end_date) {
      const diffTime = Math.abs(new Date(a.end_date) - new Date(a.start_date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include end day
      totalHours += diffDays * 8; 
    }
  });

  // Upcoming Deadlines (Closest End Dates)
  const upcomingAssignments = [...assignments]
    .filter(a => a.end_date && new Date(a.end_date) >= today)
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
    .slice(0, 4);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let duration = '';
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      duration = `${diffDays} days`;
    }

    try {
      await createAssignment({ ...formData, duration });
      setIsModalOpen(false);
      setFormData({ group_id: '', hospital_id: '', supervisor_id: '', start_date: '', end_date: '', status: 'active', notes: '' });
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
          <h1 className="text-3xl font-bold text-gray-800">Internship Scheduling</h1>
          <p className="text-gray-500 mt-1">Plan rotations, evaluations, and clinical milestones.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl">
             <button 
               onClick={() => setView('calendar')}
               className={cn("p-2 rounded-lg transition-all", view === 'calendar' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500")}
             >
               <Grid size={18} />
             </button>
             <button 
               onClick={() => setView('timeline')}
               className={cn("p-2 rounded-lg transition-all", view === 'timeline' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500")}
             >
               <List size={18} />
             </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
            <Plus size={18} />
            <span>Create Event</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading schedule data...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-500 font-medium">{error}</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Calendar Side Panel - 30% */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-md">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
               {upcomingAssignments.length === 0 ? (
                 <p className="text-sm text-gray-500">No upcoming deadlines.</p>
               ) : upcomingAssignments.map((item, i) => {
                 const d = new Date(item.end_date);
                 const monthStr = d.toLocaleString('default', { month: 'short' });
                 const dayNum = d.getDate();
                 const groupName = groups.find(g => g.id === item.group_id)?.group_name || 'Group';

                 return (
                 <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                   <div className="w-12 h-12 rounded-xl bg-white flex flex-col items-center justify-center border border-gray-200 shadow-sm min-w-[3rem]">
                     <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{monthStr}</span>
                     <span className="text-base font-black text-gray-800 leading-none mt-0.5">{dayNum}</span>
                   </div>
                   <div className="flex-1 pt-0.5 overflow-hidden">
                     <p className="text-sm font-bold text-gray-800 truncate">Rotation End</p>
                     <p className="text-xs text-gray-500 truncate">{groupName}</p>
                   </div>
                 </div>
               )})}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
              View All Deadlines
            </button>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg">
            <h3 className="text-lg font-bold mb-2">Schedule Insights</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">You have {activeAssignments.length} active rotations scheduled for this month across {uniqueHospitals} hospitals.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-200">Total Hours</span>
                <span className="font-bold">{totalHours.toLocaleString()} hrs</span>
              </div>
              <div className="h-1 bg-blue-700 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[70%]"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Schedule View - 70% */}
        <Card className="lg:col-span-7 p-0 overflow-hidden border-none shadow-md">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-4">
             <div className="flex items-center space-x-4">
               <h2 className="text-xl font-bold text-gray-800 w-40">{currentMonthStr}</h2>
               <div className="flex items-center space-x-1">
                 <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                   <ChevronLeft size={20} />
                 </button>
                 <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                   <ChevronRight size={20} />
                 </button>
               </div>
             </div>
             <div className="flex items-center space-x-2">
               <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
               <Button variant="secondary" size="sm" className="flex items-center space-x-2">
                 <Filter size={14} />
                 <span>Filter</span>
               </Button>
             </div>
          </div>

          <div className="bg-white">
            {view === 'calendar' ? (
              <div className="grid grid-cols-7 border-b border-gray-100">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="px-4 py-3 text-xs font-bold text-gray-400 text-center uppercase tracking-wider border-r border-gray-100 last:border-0 bg-gray-50/50">
                    {day}
                  </div>
                ))}
              </div>
            ) : null}

            <div className={cn(
              "grid grid-cols-7 min-h-[600px]",
              view === 'calendar' ? "" : "hidden"
            )}>
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayIndex = i - startOffset;
                const dayNumber = dayIndex + 1;
                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                const cellDateStr = isCurrentMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}` : null;
                
                const isToday = isCurrentMonth && dayNumber === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                
                let cellEvents = [];
                if (cellDateStr) {
                  const cellDate = new Date(cellDateStr);
                  cellDate.setHours(0, 0, 0, 0);

                  assignments.forEach(a => {
                    const aStart = new Date(a.start_date?.split('T')[0]);
                    const aEnd = new Date(a.end_date?.split('T')[0]);
                    aStart.setHours(0, 0, 0, 0);
                    aEnd.setHours(0, 0, 0, 0);

                    const groupName = groups.find(g => g.id === a.group_id)?.group_name || 'Group';
                    const hospitalName = hospitals.find(h => h.id === a.hospital_id)?.hospital_name || 'Hospital';
                    
                    if (cellDate >= aStart && cellDate <= aEnd) {
                      let type = 'middle';
                      if (cellDate.getTime() === aStart.getTime()) type = 'start';
                      else if (cellDate.getTime() === aEnd.getTime()) type = 'end';
                      
                      cellEvents.push({ 
                        id: a.id, 
                        type: type, 
                        title: `${groupName} - ${hospitalName}`,
                        status: a.status
                      });
                    }
                  });
                }
                
                return (
                  <div key={i} className={cn(
                    "border-r border-b border-gray-100 p-2 transition-all hover:bg-gray-50 group min-h-[120px] flex flex-col",
                    !isCurrentMonth && "bg-gray-50/30",
                    i % 7 === 6 && "border-r-0"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                        isCurrentMonth ? "text-gray-700" : "text-gray-300",
                        isToday ? "bg-blue-600 text-white" : ""
                      )}>
                        {isCurrentMonth ? dayNumber : ''}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                      {cellEvents.map(ev => (
                        <div key={ev.id} className={cn(
                          "px-2 py-1 text-[10px] font-bold truncate shadow-sm border-y border-r first:border-l transition-all",
                          ev.status === 'ongoing' || ev.status === 'active' ? "bg-blue-600 text-white border-blue-700" : "bg-emerald-500 text-white border-emerald-600",
                          ev.type === 'start' ? "rounded-l-lg border-l ml-1" : "",
                          ev.type === 'end' ? "rounded-r-lg mr-1" : "",
                          ev.type === 'middle' ? "opacity-90" : ""
                        )} title={ev.title}>
                          {ev.type === 'start' ? ev.title : '\u00A0'}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {view === 'timeline' && (
              <div className="p-6 space-y-6">
                {assignments.length === 0 ? (
                  <p className="text-gray-500">No assignments scheduled.</p>
                ) : assignments.map((item) => {
                  const groupName = groups.find(g => g.id === item.group_id)?.group_name || 'Group';
                  const hospitalName = hospitals.find(h => h.id === item.hospital_id)?.hospital_name || 'Hospital';
                  const startDate = item.start_date?.split('T')[0] || '';
                  const endDate = item.end_date?.split('T')[0] || '';

                  return (
                  <div key={item.id} className="flex items-start space-x-6 group">
                    <div className="w-32 pt-1">
                       <p className="text-sm font-bold text-gray-800">{startDate}</p>
                       <p className="text-xs text-gray-500">{endDate !== startDate ? `to ${endDate}` : 'One day'}</p>
                    </div>
                    <div className="flex-1 pb-6 border-l-2 border-gray-100 pl-8 relative">
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-blue-600"></div>
                      <div className="bg-white border border-gray-100 p-4 rounded-2xl group-hover:border-blue-100 group-hover:shadow-soft transition-all">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="font-bold text-gray-800">{groupName}</h4>
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
                             {item.status || 'Active'}
                           </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon size={12} />
                            <span>{hospitalName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{item.duration || 'Unknown duration'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </Card>
      </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Schedule Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Select Group</label>
            <select required value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Select Hospital</label>
            <select required value={formData.hospital_id} onChange={e => setFormData({...formData, hospital_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Hospital</option>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospital_name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Assign Supervisor</label>
            <select value={formData.supervisor_id} onChange={e => setFormData({...formData, supervisor_id: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="">Select Supervisor</option>
              {supervisors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input required label="Start Date" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
             <Input required label="End Date" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm">
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <Input label="Notes (Optional)" placeholder="Any special requirements..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Confirm Event</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default SchedulingPage;
