import React, { useState } from 'react';

export default function SettingsView({ user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Could not change password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(data.message || 'Password changed successfully.');
    } catch (requestError) {
      console.error('Password change failed:', requestError);
      setError('Could not connect to the server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Account Settings</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">Configure profile specifications</p>
      </div>
      
      <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-sm max-w-xl">
        <h3 className="text-sm font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Profile Configuration</h3>
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md md:max-w-none">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Display Name</label>
              <input className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-500 outline-none" defaultValue={user?.name || 'N/A'} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">User ID</label>
              <input className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-500 outline-none" defaultValue={user?.userId || 'N/A'} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Employee ID</label>
              <input className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-500 outline-none" defaultValue={user?.employeeId || 'N/A'} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Registered Email</label>
              <input className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-500 outline-none" defaultValue={user?.email || 'N/A'} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Phone Number</label>
              <input className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-500 outline-none" defaultValue={user?.phonenumber || 'N/A'} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Role</label>
              <input className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-500 outline-none uppercase" defaultValue={user?.role || 'N/A'} disabled />
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-sm max-w-xl">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Change Password</h3>
        <p className="text-xs text-slate-400 mb-5">Confirm your current password before setting a new one.</p>
        {error && <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">{error}</div>}
        {success && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">{success}</div>}
        <form className="flex flex-col gap-4" onSubmit={handlePasswordChange}>
          <label className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Current password
            <input required type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10" />
          </label>
          <label className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">New password
            <input required minLength={4} type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10" />
          </label>
          <label className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm new password
            <input required minLength={4} type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10" />
          </label>
          <button type="submit" disabled={isSaving} className="self-start rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60">
            {isSaving ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
