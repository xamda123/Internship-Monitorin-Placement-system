import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Camera, Edit2, Shield, LogOut } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';
import { getProfile, updateProfile } from '../../services/api';

import { useUser } from '../../context/UserContext';

const ProfilePage = () => {
  const { refreshUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState({
    full_name: '',
    email: '',
    role: '',
    phone: '',
    location: '',
    bio: '',
    joined: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfile();
      setAdminInfo({
        ...data,
        joined: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(adminInfo);
      setIsEditing(false);
      await fetchProfile();
      await refreshUser(); // Update global context
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between translate-y-12">
           <div className="flex items-end space-x-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-premium">
                  <div className="w-full h-full rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-4xl overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${adminInfo.full_name}&background=3b82f6&color=fff`} alt="Admin" />
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg text-slate-600 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <Camera size={18} />
                </button>
              </div>
              <div className="pb-12">
                <h1 className="text-2xl font-bold text-white">{adminInfo.full_name}</h1>
                <p className="text-blue-100 font-medium capitalize">{adminInfo.role}</p>
              </div>
           </div>
           <div className="pb-12">
             <Button variant="secondary" onClick={() => setIsEditing(!isEditing)} className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
               <Edit2 size={18} className="mr-2" />
               {isEditing ? 'Cancel Editing' : 'Edit Profile'}
             </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-6">About Me</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              {adminInfo.bio || 'No bio provided.'}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Mail size={16} />
                </div>
                <span className="text-gray-700 font-medium">{adminInfo.email}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={16} />
                </div>
                <span className="text-gray-700 font-medium">{adminInfo.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin size={16} />
                </div>
                <span className="text-gray-700 font-medium">{adminInfo.location || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Briefcase size={16} />
                </div>
                <span className="text-gray-700 font-medium">Joined {adminInfo.joined}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-none">
             <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                   <Shield size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Security Access</h3>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between text-xs">
                   <span className="text-gray-400">Account Status</span>
                   <span className="text-green-400 font-bold">VERIFIED</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-400">Permissions</span>
                   <span className="text-white font-bold uppercase">{adminInfo.role} ACCESS</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-400">Last Login</span>
                   <span className="text-white font-bold">Recently</span>
                </div>
             </div>
             <Button variant="ghost" className="w-full mt-8 text-red-400 hover:bg-red-400/10 border border-red-400/20" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Logout Session
             </Button>
          </Card>
        </div>

        {/* Right Column: Edit/Activity Card */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Update Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={adminInfo.full_name} onChange={e => setAdminInfo({...adminInfo, full_name: e.target.value})} />
                  <Input label="Email Address" value={adminInfo.email} disabled />
                  <Input label="Phone Number" value={adminInfo.phone} onChange={e => setAdminInfo({...adminInfo, phone: e.target.value})} />
                  <Input label="Location" value={adminInfo.location} onChange={e => setAdminInfo({...adminInfo, location: e.target.value})} />
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Bio</label>
                    <textarea 
                      className="w-full mt-1.5 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-gray-700 text-sm min-h-[120px]"
                      value={adminInfo.bio}
                      onChange={e => setAdminInfo({...adminInfo, bio: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4">
                   <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                   <Button type="submit">Save Changes</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                 <div>
                   <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                   <p className="text-sm text-gray-500 mt-1">Timeline of your recent administrative actions.</p>
                 </div>

                 <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {[
                      { action: 'Approved internship for Hibaq Ahmed', date: 'Today, 10:45 AM', type: 'approval' },
                      { action: 'Created new placement group: Group E', date: 'Yesterday, 03:20 PM', type: 'create' },
                      { action: 'Updated system security settings', date: 'Apr 25, 2024, 09:15 AM', type: 'update' },
                      { action: 'Assigned Dr. Mohamud Ali to Shaafi Hospital', date: 'Apr 24, 2024, 11:30 AM', type: 'assign' },
                      { action: 'Exported monthly performance report', date: 'Apr 22, 2024, 02:00 PM', type: 'export' },
                    ].map((item, i) => (
                      <div key={i} className="relative pl-10">
                         <div className={cn(
                           "absolute left-0 top-1 w-9 h-9 rounded-xl border-4 border-white shadow-sm flex items-center justify-center text-white",
                           i === 0 ? "bg-blue-600" : "bg-gray-400"
                         )}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-800">{item.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
