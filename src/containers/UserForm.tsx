'use client';

import { useState } from 'react';

export interface UserFormData {
  name: string;
  gender: string;
  email: string;
  birthDate: string;
  placeOfBirth: string;
  nationality: string;
  cpf: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  loading?: boolean;
  error?: string;
}

export default function UserForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Salvar',
  loading = false,
  error = ''
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>(() => ({
    name: '',
    gender: '',
    email: '',
    birthDate: '',
    placeOfBirth: '',
    nationality: '',
    cpf: '',
    ...initialData
  }));

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }));

    if (formErrors.cpf) {
      setFormErrors(prev => ({
        ...prev,
        cpf: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      errors.cpf = 'CPF é obrigatório';
    } else {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        errors.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    if (!formData.birthDate) {
      errors.birthDate = 'Data de nascimento é obrigatória';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="form-label">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Digite o nome completo"
              disabled={loading}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="cpf" className="form-label">
              CPF *
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
              className={`form-input ${formErrors.cpf ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="000.000.000-00"
              maxLength={14}
              disabled={loading}
            />
            {formErrors.cpf && (
              <p className="mt-1 text-sm text-red-600">{formErrors.cpf}</p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="form-label">
              Data de Nascimento *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formatDate(formData.birthDate)}
              onChange={handleInputChange}
              className={`form-input ${formErrors.birthDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={loading}
            />
            {formErrors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{formErrors.birthDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="email@exemplo.com"
              disabled={loading}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="form-label">
              Gênero
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form-input"
              disabled={loading}
            >
              <option value="">Selecione...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="placeOfBirth" className="form-label">
              Local de Nascimento
            </label>
            <input
              type="text"
              id="placeOfBirth"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Cidade, Estado"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="nationality" className="form-label">
              Nacionalidade
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Brasileiro(a)"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}