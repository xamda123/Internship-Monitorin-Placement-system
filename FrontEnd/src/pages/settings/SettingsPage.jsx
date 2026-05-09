import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  ShieldCheck,
  UserCog,
  Database,
  Mail,
  Lock,
  ChevronRight,
  ToggleLeft as Toggle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';
import { getSettings, updateSettings } from '../../services/api';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [form, setForm] = useState({
    system_name: '',
    support_email: '',
    timezone: '',
    language: ''
  });

  const sections = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'internship', label: 'Internship Config', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'roles', label: 'Roles & Permissions', icon: UserCog },
    { id: 'security', label: 'Security & Privacy', icon: ShieldCheck },
  ];

  //update

  useEffect(() => {
    const token = localStorage.getItem("token");

    getSettings(token).then((data) => {
      setForm(data);
    });
  }, []);

  //update
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    const res = await updateSettings(form, token);

    alert(res.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Configure system preferences and management rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-3 space-y-1.5 shadow-md">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center space-x-3">
                  <section.icon size={20} className={activeSection === section.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
                  <span className="font-semibold text-sm">{section.label}</span>
                </div>
                <ChevronRight size={16} className={cn("transition-transform", activeSection === section.id ? "rotate-90 text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
              </button>
            ))}
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px] shadow-md p-8">
            {activeSection === 'general' && (
              <div className="space-y-8 flex flex-col h-full">
                <div className="pb-6 border-b border-gray-50">
                  <h3 className="text-xl font-bold text-gray-800">General Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Basic configuration for the internship portal.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  <div className="space-y-6">
                    <Input label="System Name" value={form.system_name || ''} onChange={e => setForm({...form, system_name: e.target.value})} />
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">System Timezone</label>
                      <select value={form.timezone || ''} onChange={e => setForm({...form, timezone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all hover:bg-white">
                        <option>(GMT+00:00) UTC</option>
                        <option>(GMT+03:00) East Africa Time</option>
                        <option>(GMT-05:00) Eastern Time</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <Input label="Support Email" value={form.support_email || ''} onChange={e => setForm({...form, support_email: e.target.value})} />
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">Language</label>
                      <select value={form.language || ''} onChange={e => setForm({...form, language: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all hover:bg-white">
                        <option>English (US)</option>
                        <option>French</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end mt-auto">
                  <Button className="px-8 py-2.5 shadow-sm" onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage how and when you receive system alerts.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive alerts about new student registrations via email.', checked: true },
                    { label: 'Push Notifications', desc: 'Enable browser-level push notifications for urgent tasks.', checked: false },
                    { label: 'Weekly Summary', desc: 'Get a weekly performance report for all active groups.', checked: true },
                    { label: 'Logbook Alerts', desc: 'Notify when a logbook has been pending for more than 48 hours.', checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                      <div className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
                        item.checked ? "bg-blue-600" : "bg-gray-200"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                          item.checked ? "right-1" : "left-1"
                        )}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-end">
                  <Button>Update Preferences</Button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Security & Privacy</h3>
                  <p className="text-sm text-gray-500 mt-1">Secure your admin account and manage data privacy.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start space-x-4">
                    <ShieldCheck className="text-orange-500 shrink-0" size={24} />
                    <div>
                      <p className="text-sm font-bold text-orange-900">Two-Factor Authentication</p>
                      <p className="text-xs text-orange-700 mt-1">Enhance your account security by adding an extra layer of verification.</p>
                      <Button variant="secondary" size="sm" className="mt-3 text-orange-700 border-orange-200 hover:bg-orange-100">Enable 2FA</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-end">
                  <Button>Change Password</Button>
                </div>
              </div>
            )}

            {activeSection === 'internship' && (
              <div className="space-y-8 flex flex-col h-full">
                <div className="pb-6 border-b border-gray-50">
                  <h3 className="text-xl font-bold text-gray-800">Internship Config</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage rotation rules and placement logic.</p>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                      label="Minimum Duration (Days)" 
                      type="number"
                      value={form.min_duration_days || ''} 
                      onChange={e => setForm({...form, min_duration_days: e.target.value})} 
                    />
                    <Input 
                      label="Maximum Duration (Days)" 
                      type="number"
                      value={form.max_duration_days || ''} 
                      onChange={e => setForm({...form, max_duration_days: e.target.value})} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="max-w-md">
                      <p className="text-sm font-bold text-gray-800">Auto-Assign Supervisor</p>
                      <p className="text-xs text-gray-500 mt-1">Automatically assign the default hospital supervisor to new groups.</p>
                    </div>
                    <div 
                      onClick={() => setForm({...form, auto_assign_supervisor: !form.auto_assign_supervisor})}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
                        form.auto_assign_supervisor ? "bg-blue-600" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                        form.auto_assign_supervisor ? "right-1" : "left-1"
                      )}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end mt-auto">
                  <Button className="px-8 py-2.5 shadow-sm" onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            )}

            {(activeSection === 'roles') && (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <SettingsIcon size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{sections.find(s => s.id === activeSection).label}</h3>
                <p className="text-sm text-gray-500 max-w-xs mt-2">This configuration module is available in the full version of the management system.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
