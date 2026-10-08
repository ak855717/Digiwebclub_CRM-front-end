import React, { useState, useEffect } from 'react';

export default function UserManagement({ user: currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Track inline updating states per user ID: { [userId]: 'idle' | 'updating' | 'success' | 'error' }
  const [updateStates, setUpdateStates] = useState({});
  const [permissionUpdateStates, setPermissionUpdateStates] = useState({});

  // Password reset states
  const [passwordInputs, setPasswordInputs] = useState({});
  const [passwordUpdateStates, setPasswordUpdateStates] = useState({});

  // Create User states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmployeeId, setNewUserEmployeeId] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('employee');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhoneNumber, setNewUserPhoneNumber] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          name: newUserName,
          employeeId: newUserEmployeeId,
          userId: newUserId,
          password: newUserPassword,
          role: newUserRole,
          email: newUserEmail,
          phonenumber: newUserPhoneNumber
        }),
      });
      const res = await response.json();
      if (response.ok && res.success) {
        setSuccessMsg('User created successfully!');
        setShowCreateForm(false);
        // Clear form
        setNewUserName('');
        setNewUserEmployeeId(''); 
        setNewUserId('');
        setNewUserPassword('');
        setNewUserRole('employee');
        setNewUserEmail('');
        setNewUserPhoneNumber('');
        // Refresh users
        fetchUsers();
      } else {
        setError(res.error || 'Failed to create user.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server to create user.');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
      });
      const res = await response.json();
      if (response.ok && res.success) {
        setUsers(res.users);
      } else {
        setError(res.error || 'Failed to fetch users.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server to retrieve users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // Prevent updating current user role to avoid locking oneself out
    if (userId === currentUser.id) {
      setError("You cannot change your own role to prevent administrator lockout.");
      return;
    }

    // Set updating state for this user
    setUpdateStates(prev => ({ ...prev, [userId]: 'updating' }));
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        // Update user local state list
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
        );
        // Show success status
        setUpdateStates(prev => ({ ...prev, [userId]: 'success' }));
        setSuccessMsg(`Successfully updated role of ${res.user.name} to ${newRole}.`);
        
        // Reset success state after a few seconds
        setTimeout(() => {
          setUpdateStates(prev => ({ ...prev, [userId]: 'idle' }));
        }, 3000);
      } else {
        setUpdateStates(prev => ({ ...prev, [userId]: 'error' }));
        setError(res.error || 'Failed to update user role.');
      }
    } catch (err) {
      console.error(err);
      setUpdateStates(prev => ({ ...prev, [userId]: 'error' }));
      setError('Could not connect to the backend server to update user role.');
    }
  };

  const handlePermissionChange = async (userId, newPermissions) => {
    if (userId === currentUser.id) {
      setError("You cannot change your own permissions to prevent administrator lockout.");
      return;
    }

    setPermissionUpdateStates(prev => ({ ...prev, [userId]: 'updating' }));
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ permissions: newPermissions }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, permissions: newPermissions } : u))
        );
        setPermissionUpdateStates(prev => ({ ...prev, [userId]: 'success' }));
        setSuccessMsg(`Successfully updated permissions for ${res.user.name}.`);
        
        setTimeout(() => {
          setPermissionUpdateStates(prev => ({ ...prev, [userId]: 'idle' }));
        }, 3000);
      } else {
        setPermissionUpdateStates(prev => ({ ...prev, [userId]: 'error' }));
        setError(res.error || 'Failed to update user permissions.');
      }
    } catch (err) {
      console.error(err);
      setPermissionUpdateStates(prev => ({ ...prev, [userId]: 'error' }));
      setError('Could not connect to the backend server to update permissions.');
    }
  };

  const handlePasswordChange = async (userId) => {
    const newPassword = passwordInputs[userId];
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    
    setPasswordUpdateStates((prev) => ({ ...prev, [userId]: 'updating' }));
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json().catch(() => ({
        success: false,
        error: `The server returned an unreadable response (${response.status}).`,
      }));

      if (response.ok && data.success) {
        setPasswordUpdateStates((prev) => ({ ...prev, [userId]: 'success' }));
        const targetUser = users.find(user => user._id === userId);
        setSuccessMsg(`${data.message || 'Password updated successfully.'}${targetUser?.userId ? ` Login ID: ${targetUser.userId}.` : ''}`);
        // clear input
        setPasswordInputs((prev) => ({ ...prev, [userId]: '' }));
        setTimeout(() => setPasswordUpdateStates((prev) => ({ ...prev, [userId]: 'idle' })), 2000);
      } else {
        setPasswordUpdateStates((prev) => ({ ...prev, [userId]: 'error' }));
        setError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordUpdateStates((prev) => ({ ...prev, [userId]: 'error' }));
      setError('Could not connect to the backend server to update password.');
    }
  };

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.userId && u.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Helper to choose initials avatar background color
  const getAvatarBg = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600 border-blue-200/50',
      'bg-emerald-100 text-emerald-600 border-emerald-200/50',
      'bg-indigo-100 text-indigo-600 border-indigo-200/50',
      'bg-purple-100 text-purple-600 border-purple-200/50',
      'bg-pink-100 text-pink-600 border-pink-200/50',
      'bg-amber-100 text-amber-600 border-amber-200/50',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Authorization</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Admin-only console to view registration queue and assign corporate roles
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-bold text-xs uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
            Refresh Users
          </button>
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase rounded-lg shadow-sm shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Alerts */}
      <div className="w-full flex flex-col gap-3">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs font-semibold text-rose-700 flex items-center gap-2 shadow-sm animate-fade-in">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs font-semibold text-emerald-700 flex items-center gap-2 shadow-sm animate-fade-in">
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
          </div>
        )}
      </div>

      {/* Create User Form (Admin Only) */}
      {showCreateForm && currentUser.role === 'admin' && (
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm mb-2 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Create New User</h3>
          <form className="flex flex-col gap-4" onSubmit={handleCreateUser}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Full Name</label>
                <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all" placeholder="John Doe" disabled={isCreating} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Employee ID</label>
                <input required type="text" value={newUserEmployeeId} onChange={e => setNewUserEmployeeId(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all" placeholder="EMP-001" disabled={isCreating} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">User ID (Login ID)</label>
                <input required type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all" placeholder="user_johnd" disabled={isCreating} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Email</label>
                <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all" placeholder="jane@example.com" disabled={isCreating} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Phone Number</label>
                <input required type="tel" value={newUserPhoneNumber} onChange={e => setNewUserPhoneNumber(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all" placeholder="+1234567890" disabled={isCreating} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Password</label>
                <input required type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all" placeholder="••••••••" disabled={isCreating} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Role</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all cursor-pointer" disabled={isCreating}>
                  <option value="employee">Employee (Default)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-3 justify-end items-end">
                <button type="submit" disabled={isCreating} className="w-full sm:w-auto px-6 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-xs font-bold text-white shadow-md shadow-emerald-500/15 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center">
                  {isCreating ? 'Creating...' : 'Create Admin/User Account'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all cursor-pointer min-w-[130px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden min-h-[200px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <svg className="animate-spin h-7 w-7 text-sky-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Loading Users Database...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="w-10 h-10 text-slate-300 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="font-bold text-slate-800 text-xs">No users found</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your search filters.' 
                : 'No users exist in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 border-r border-slate-100/60">User Identity</th>
                  <th className="p-4 border-r border-slate-100/60">Registration Date</th>
                  <th className="p-4 border-r border-slate-100/60 text-center">Auth Status Badge</th>
                  <th className="p-4 border-r border-slate-100/60 text-center">Role & Password</th>
                  <th className="p-4 text-center">Permissions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userObj) => {
                  const isSelf = userObj._id === currentUser.id;
                  const currentRole = userObj.role;
                  const rowState = updateStates[userObj._id] || 'idle';
                  const avatarClass = getAvatarBg(userObj.name);
                  
                  return (
                    <tr 
                      key={userObj._id} 
                      className="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 font-semibold text-xs text-slate-600 transition-colors"
                    >
                      {/* Column 1: Identity */}
                      <td className="p-4 border-r border-slate-100/60">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center font-extrabold text-xs uppercase shadow-sm shrink-0 ${avatarClass}`}>
                            {userObj.name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              {userObj.name}
                              {isSelf && (
                                <span className="bg-sky-100 text-sky-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">ID: {userObj.userId || 'N/A'} • EMP: {userObj.employeeId || 'N/A'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">✉ {userObj.email || 'N/A'} • 📞 {userObj.phonenumber || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Date */}
                      <td className="p-4 border-r border-slate-100/60 text-slate-500 font-mono text-[11px]">
                        {userObj.createdAt 
                          ? new Date(userObj.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Pre-existing Account'}
                      </td>

                      {/* Column 3: Current Badge */}
                      <td className="p-4 border-r border-slate-100/60 text-center select-none">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                          currentRole === 'admin' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                          currentRole === 'manager' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          currentRole === 'employee' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {currentRole}
                        </span>
                      </td>

                      {/* Column 4: Dropdown selector and Password Reset */}
                      <td className="p-4 align-top border-r border-slate-100/60">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 w-10">Role:</span>
                            <select
                              value={currentRole}
                              disabled={isSelf || rowState === 'updating'}
                              onChange={(e) => handleRoleChange(userObj._id, e.target.value)}
                              className={`h-8 px-2 border rounded text-xs font-semibold outline-none transition-all w-[130px] ${
                                isSelf 
                                  ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:border-sky-500 cursor-pointer'
                              }`}
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                            {/* Saving Status Spinner/Checkmark for Role */}
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              {rowState === 'updating' && (
                                <svg className="animate-spin h-3.5 w-3.5 text-sky-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              )}
                              {rowState === 'success' && (
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {rowState === 'error' && (
                                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 w-10">Pass:</span>
                            <div className="flex gap-1.5 w-[130px]">
                              <input 
                                type="password"
                                autoComplete="new-password"
                                minLength={4}
                                placeholder="New Pass"
                                value={passwordInputs[userObj._id] || ''}
                                onChange={e => setPasswordInputs({...passwordInputs, [userObj._id]: e.target.value})}
                                className="h-8 w-full px-2 border border-slate-200 rounded text-xs outline-none focus:border-sky-500 transition-all bg-white"
                              />
                              <button 
                                type="button"
                                onClick={() => handlePasswordChange(userObj._id)}
                                disabled={passwordUpdateStates[userObj._id] === 'updating' || !(passwordInputs[userObj._id]?.length > 0)}
                                className="px-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                              >
                                {passwordUpdateStates[userObj._id] === 'updating' ? '...' : 'Save'}
                              </button>
                            </div>
                            {/* Saving Status Spinner/Checkmark for Password */}
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              {passwordUpdateStates[userObj._id] === 'success' && (
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {passwordUpdateStates[userObj._id] === 'error' && (
                                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                          </div>

                        </div>
                      </td>
                      <td className="p-4 align-top min-w-[220px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 mt-1 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 w-10">Perms:</span>
                            <div className="flex items-center gap-2 w-[130px] flex-wrap">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={userObj.permissions?.canView !== false} 
                                  disabled={isSelf || permissionUpdateStates[userObj._id] === 'updating'}
                                  onChange={(e) => handlePermissionChange(userObj._id, { ...userObj.permissions, canView: e.target.checked })}
                                  className="w-3 h-3 accent-sky-500 rounded-sm cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-slate-600">View</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={userObj.permissions?.canEdit || false} 
                                  disabled={isSelf || permissionUpdateStates[userObj._id] === 'updating'}
                                  onChange={(e) => handlePermissionChange(userObj._id, { ...userObj.permissions, canEdit: e.target.checked })}
                                  className="w-3 h-3 accent-sky-500 rounded-sm cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-slate-600">Edit</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={userObj.permissions?.canDelete || false} 
                                  disabled={isSelf || permissionUpdateStates[userObj._id] === 'updating'}
                                  onChange={(e) => handlePermissionChange(userObj._id, { ...userObj.permissions, canDelete: e.target.checked })}
                                  className="w-3 h-3 accent-sky-500 rounded-sm cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-slate-600">Delete</span>
                              </label>
                            </div>
                            {/* Saving Status Spinner/Checkmark for Permissions */}
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              {permissionUpdateStates[userObj._id] === 'updating' && (
                                <svg className="animate-spin h-3.5 w-3.5 text-sky-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              )}
                              {permissionUpdateStates[userObj._id] === 'success' && (
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {permissionUpdateStates[userObj._id] === 'error' && (
                                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 border-t border-slate-100 pt-2">
                            <span className="text-[10px] font-bold text-slate-400 w-10">Report:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userObj.permissions?.canViewReports === true}
                                disabled={isSelf || permissionUpdateStates[userObj._id] === 'updating'}
                                onChange={(e) => handlePermissionChange(userObj._id, { ...userObj.permissions, canViewReports: e.target.checked })}
                                className="w-3 h-3 accent-sky-500 rounded-sm cursor-pointer"
                              />
                              <span className="text-[10px] font-bold text-slate-600">View Reports</span>
                            </label>
                          </div>
                        
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
