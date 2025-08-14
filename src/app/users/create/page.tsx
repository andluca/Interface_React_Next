'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { apiService, getErrorMessage } from '@/services/api';
import Navbar from '@/components/Navbar';
import UserForm, { UserFormData } from '@/containers/UserForm';

export default function CreateUserPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (formData: UserFormData) => {
    setLoading(true);
    setError('');

    try {
      // Preparar dados para envio à API
      const userData = {
        name: formData.name.trim(),
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        birthDate: formData.birthDate,
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.email && { email: formData.email }),
        ...(formData.placeOfBirth && { placeOfBirth: formData.placeOfBirth }),
        ...(formData.nationality && { nationality: formData.nationality }),
      };

      await apiService.createUser(userData);
      
      // Redirecionar para a lista de usuários após sucesso
      router.push('/users');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao criar usuário'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Usuário</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preencha os dados do novo usuário no sistema
          </p>
        </div>

        {/* Formulário */}
        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Criar Usuário"
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}