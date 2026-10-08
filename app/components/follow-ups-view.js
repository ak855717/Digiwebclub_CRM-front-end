import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function FollowUpsView({ user }) {
  const [isClient, setIsClient] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leadName: '',
    phoneNumber: '',
    description: '',
    scheduledAt: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (!user?.id) return;
    setIsClient(true);
    fetchFollowUps();
  }, [user?.id]);

  const fetchFollowUps = async () => {
    try {
      const response = await fetch('/api/followups', {
        headers: { 'x-user-id': user.id },
      });
      const data = await response.json();
      if (data.success) {
        setFollowUps(data.followUps);
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leadName || !formData.scheduledAt) {
      alert('Lead Name and Scheduled Date/Time are required');
      return;
    }

    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setFollowUps([...followUps, data.followUp]);
        setIsModalOpen(false);
        setFormData({ leadName: '', phoneNumber: '', description: '', scheduledAt: '', status: 'Pending' });
      } else {
        alert('Failed to create follow-up');
      }
    } catch (error) {
      console.error('Error creating follow-up:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      try {
        const response = await fetch(`/api/followups/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': user.id },
        });
        const data = await response.json();
        if (data.success) {
          setFollowUps(followUps.filter(f => f._id !== id));
        }
      } catch (error) {
        console.error('Error deleting follow-up:', error);
      }
    }
  };

  const handleStatusToggle = async (followUp) => {
    const newStatus = followUp.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      const response = await fetch(`/api/followups/${followUp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ ...followUp, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setFollowUps(followUps.map(f => f._id === followUp._id ? data.followUp : f));
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
    }
  };

  // Sort: Pending first, then by date
  const sortedFollowUps = [...followUps].sort((a, b) => {
    if (a.status === 'Pending' && b.status === 'Completed') return -1;
    if (a.status === 'Completed' && b.status === 'Pending') return 1;
    return new Date(a.scheduledAt) - new Date(b.scheduledAt);
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Follow-up Callbacks</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Scheduled outreach sessions for lead campaigns</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase rounded-lg shadow-md transition-all cursor-pointer"
        >
          + Add Follow-up
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedFollowUps.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center py-10 text-slate-500 font-semibold text-sm bg-white border border-slate-200/80 rounded-xl">
            No follow-ups scheduled yet. Add one above!
          </div>
        ) : (
          sortedFollowUps.map(f => {
            const isCompleted = f.status === 'Completed';
            const scheduledDate = new Date(f.scheduledAt);
            return (
              <div key={f._id} className={`bg-white border p-5 rounded-xl shadow-sm transition-all flex items-start gap-4 ${isCompleted ? 'border-emerald-200/60 opacity-75' : 'border-slate-200/80 hover:shadow-md'}`}>
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-bold text-sm ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      Callback: {f.leadName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusToggle(f)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${isCompleted ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                        {isCompleted ? 'Mark Pending' : '✓ Complete'}
                      </button>
                      <button 
                        onClick={() => handleDelete(f._id)}
                        className="text-slate-300 hover:text-rose-500 text-xs transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {f.phoneNumber && (
                    <p className={`text-[11px] font-mono font-medium mt-1 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                      📞 {f.phoneNumber}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
                    {f.description || 'No description provided.'}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-3 uppercase tracking-wider ${isCompleted ? 'text-emerald-600 bg-emerald-50 border border-emerald-100/60' : 'text-sky-600 bg-sky-50 border border-sky-100/60'}`}>
                    Scheduled: {scheduledDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isClient && isModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">Schedule Follow-up</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Lead Name *</label>
                <input 
                  type="text" 
                  value={formData.leadName}
                  onChange={e => setFormData({...formData, leadName: e.target.value})}
                  className="w-full h-10 rounded-lg border border-slate-205 px-3.5 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-10 rounded-lg border border-slate-205 px-3.5 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Scheduled At *</label>
                <input 
                  type="datetime-local" 
                  value={formData.scheduledAt}
                  onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                  className="w-full h-10 rounded-lg border border-slate-205 px-3.5 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border border-slate-205 p-3.5 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none transition-all min-h-[80px]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-lg uppercase"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
