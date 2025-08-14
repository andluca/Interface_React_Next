'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { apiService, getErrorMessage } from '@/services/api';
import { User } from '@/types';
import Navbar from '@/components/Navbar';
import UserList from '@/containers/UserList';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
  const result = await apiService.getUsers();
  setUsers(result.users || []);
      setError('');
    } catch (err: unknown) {
  setError(getErrorMessage(err, 'Erro ao carregar usuários'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await apiService.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao excluir usuário'));
    }
  };

  const handleCreateUser = () => {
    router.push('/users/create');
  };

  const handleEditUser = (id: string) => {
    router.push(`/users/${id}/edit`);
  };

  const handleViewUser = (id: string) => {
    router.push(`/users/${id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gerenciamento de Usuários
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Gerencie todos os usuários do sistema
                </p>
              </div>
              <button
                onClick={handleCreateUser}
                className="btn-primary"
              >
                + Novo Usuário
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError('')}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">Fechar</span>
                ×
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando usuários...</span>
                </div>
              </div>
            </div>
          ) : (
            /* Users List */
            <UserList
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onView={handleViewUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}
