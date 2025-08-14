'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiService, getErrorMessage } from '@/services/api';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth.tsx';

export default function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { isAuthenticated, loading: authLoading } = useAuth();

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

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
			const data = await apiService.getUserById(userId);
			setUser(data);
			setError('');
		} catch (err) {
			setError(getErrorMessage(err, 'Erro ao carregar usuário'));
		} finally {
			setLoading(false);
		}
	};

	const formatCPF = (cpf: string) => {
		const n = cpf?.replace(/\D/g, '') ?? '';
		return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
	};

	const formatDate = (iso: string) => {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('pt-BR');
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

			<div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Detalhes do Usuário</h1>
						<p className="mt-2 text-sm text-gray-600">Visualize as informações do usuário</p>
					</div>
					<div className="space-x-3">
						<button className="btn-secondary" onClick={() => router.push('/users')}>Voltar</button>
						{id && (
							<button className="btn-primary" onClick={() => router.push(`/users/${id}/edit`)}>Editar</button>
						)}
					</div>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
						{error}
					</div>
				)}

				{loading ? (
					<div className="bg-white shadow rounded-lg p-6">
						<div className="flex justify-center items-center h-48">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
							<span className="ml-3 text-gray-600">Carregando usuário...</span>
						</div>
					</div>
				) : user ? (
					<div className="bg-white shadow rounded-lg p-6 space-y-4">
						<div>
							<h2 className="text-lg font-semibold text-gray-800">Informações básicas</h2>
							<div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-gray-500">Nome</p>
													<p className="text-gray-900">{user.name}</p>
												</div>
								<div>
									<p className="text-sm text-gray-500">CPF</p>
									<p className="text-gray-900">{formatCPF(user.cpf)}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Data de nascimento</p>
									<p className="text-gray-900">{formatDate(user.birthDate)}</p>
								</div>
								{user.email && (
									<div>
										<p className="text-sm text-gray-500">Email</p>
										<p className="text-gray-900">{user.email}</p>
									</div>
								)}
								{user.gender && (
									<div>
										<p className="text-sm text-gray-500">Gênero</p>
										<p className="text-gray-900">{user.gender}</p>
									</div>
								)}
								{user.placeOfBirth && (
									<div>
										<p className="text-sm text-gray-500">Local de nascimento</p>
										<p className="text-gray-900">{user.placeOfBirth}</p>
									</div>
								)}
								{user.nationality && (
									<div>
										<p className="text-sm text-gray-500">Nacionalidade</p>
										<p className="text-gray-900">{user.nationality}</p>
									</div>
								)}
							</div>
						</div>

						<div className="pt-4 border-t">
							<h2 className="text-lg font-semibold text-gray-800">Metadados</h2>
							<div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500">Criado em</p>
									<p className="text-gray-900">{formatDate(user.createdAt)}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Atualizado em</p>
									<p className="text-gray-900">{formatDate(user.updatedAt)}</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="bg-white shadow rounded-lg p-6">
						<p className="text-gray-700">Usuário não encontrado.</p>
					</div>
				)}
			</div>
		</div>
	);
}
