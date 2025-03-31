import { GlassCard } from './GlassCard';
import { useState } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import type { Database } from '../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import AddUserForm from './AddUserForm';

export default function UserManagementTab() {
  const supabase = supabaseAdmin;
  const [activeView, setActiveView] = useState<'list' | 'roles' | 'activity'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
        <div className="flex">
          <button
            className={`pb-2 px-4 ${activeView === 'list' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveView('list')}
          >
            User List
          </button>
          <button
            className={`pb-2 px-4 ${activeView === 'roles' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveView('roles')}
          >
            Role Management
          </button>
          <button
            className={`pb-2 px-4 ${activeView === 'activity' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveView('activity')}
          >
            Activity Log
          </button>
        </div>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => {
            setActiveView('list');
            setShowAddForm(true);
          }}
        >
          Add User
        </button>
      </div>

      {showAddForm && (
        <AddUserForm 
          supabase={supabase}
          onSuccess={() => {
            setShowAddForm(false);
            setRefreshKey(prev => prev + 1);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {activeView === 'list' && <UserList key={refreshKey} supabase={supabase} />}
      {activeView === 'roles' && <RoleManagement supabase={supabase} />}
      {activeView === 'activity' && <ActivityLog supabase={supabase} />}
    </GlassCard>
  );
}

import UserList from './UserList';
import RoleManagement from './RoleManagement';
import ActivityLog from './ActivityLog';
