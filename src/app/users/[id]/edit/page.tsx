'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UserForm, { UserFormData } from '@/containers/UserForm';
import { apiService, getErrorMessage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth.tsx';

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<Partial<UserFormData>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && id) {
      void loadUser(String(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, id]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      const user = await apiService.getUserById(userId);
      setInitialData({
        name: user.name,
        gender: user.gender ?? '',
        email: user.email ?? '',
        birthDate: user.birthDate,
        placeOfBirth: user.placeOfBirth ?? '',
        nationality: user.nationality ?? '',
        cpf: user.cpf ?? '',
      });
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar usuário'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: UserFormData) => {
    if (!id) return;
    try {
      setSaving(true);
      setError('');
      const payload = {
        name: formData.name.trim(),
        birthDate: formData.birthDate,
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.email && { email: formData.email }),
        ...(formData.placeOfBirth && { placeOfBirth: formData.placeOfBirth }),
        ...(formData.nationality && { nationality: formData.nationality }),
      };
      await apiService.updateUser(String(id), payload);
      router.push(`/users/${id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar usuário'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(id ? `/users/${id}` : '/users');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Usuário</h1>
            <p className="mt-2 text-sm text-gray-600">Atualize as informações do usuário</p>
          </div>
          <button className="btn-secondary" onClick={handleCancel}>Cancelar</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando...</span>
            </div>
          </div>
        ) : (
          <UserForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Salvar Alterações"
            loading={saving}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
