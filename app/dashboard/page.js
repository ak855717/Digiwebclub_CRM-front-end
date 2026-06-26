'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import DashboardOverview from '../components/dashboard-overview';
import LeadsManager from '../components/leads-manager';
import FollowUpsView from '../components/follow-ups-view';
import SettingsView from '../components/settings-view';
import UserManagement from '../components/user-management';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [totalEmployees, setTotalEmployees] = useState(0);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      if (data.success) {
        const formattedLeads = data.leads.map(l => ({ ...l, id: l._id }));
        setLeads(formattedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const response = await fetch('/api/followups');
      const data = await response.json();
      if (data.success) {
        const formattedTodos = data.followUps.map(f => ({
          id: f._id,
          text: f.description || `Follow up with ${f.leadName || 'client'}`,
          completed: f.status === 'Completed'
        }));
        setTodos(formattedTodos);
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  };

  const fetchTotalEmployees = async (userId) => {
    try {
      const response = await fetch('/api/users/count', {
        headers: {
          'x-user-id': userId
        }
      });
      const data = await response.json();
      if (data.success) {
        setTotalEmployees(data.count);
      }
    } catch (error) {
      console.error('Error fetching employees count:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchFollowUps();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTotalEmployees(parsedUser.id);
    }
  }, [router]);

  // Redirect non-admins away from user management tab
  useEffect(() => {
    if (activeTab === 'users' && user && user.role !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <main className="flex min-h-screen bg-slate-50 items-center justify-center font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verifying Credentials...
          </span>
        </div>
      </main>
    );
  }





  // Todo handlers
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: 'Manual Task',
          description: newTodoText.trim(),
          status: 'Pending',
          scheduledAt: new Date()
        })
      });
      const data = await response.json();
      if (data.success) {
        setTodos((prev) => [
          ...prev,
          { id: data.followUp._id, text: data.followUp.description, completed: false }
        ]);
        setNewTodoText('');
      }
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newStatus = todo.completed ? 'Pending' : 'Completed';
    
    // Optimistic update
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    
    try {
      await fetch(`/api/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Error updating todo:', err);
      // Revert on error
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    }
  };

  const deleteTodo = async (id) => {
    // Optimistic update
    setTodos((prev) => prev.filter((t) => t.id !== id));
    
    try {
      await fetch(`/api/followups/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting todo:', err);
      fetchFollowUps(); // Refresh from server on error
    }
  };

  // Rendering Helper for active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            todos={todos}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            newTodoText={newTodoText}
            setNewTodoText={setNewTodoText}
            handleAddTodo={handleAddTodo}
            leads={leads}
            setActiveTab={setActiveTab}
            totalEmployees={totalEmployees}
          />
        );
      case 'leads':
        return (
          <LeadsManager
            leads={leads}
            setLeads={setLeads}
            user={user}
          />
        );
      case 'follow-ups':
        return <FollowUpsView />;
      case 'settings':
        return <SettingsView user={user} />;
      case 'users':
        return <UserManagement user={user} />;
      default:
        return <div className="text-slate-500 text-xs font-semibold">Tab page not found.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700">
      {/* Top Navbar */}
      <Navbar user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onLogout={handleLogout} 
        />

        {/* Scrollable Main Console */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-h-[calc(100vh-64px)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}