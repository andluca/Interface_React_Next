export interface User {
  id: string;
  name: string;
  gender?: string;
  email?: string;
  birthDate: string;
  placeOfBirth?: string;
  nationality?: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

export interface CreateUserRequest {
  name: string;
  gender?: string;
  email?: string;
  birthDate: string;
  placeOfBirth?: string;
  nationality?: string;
  cpf: string;
}

export interface UpdateUserRequest {
  name?: string;
  gender?: string;
  email?: string;
  birthDate?: string;
  placeOfBirth?: string;
  nationality?: string;
  cpf?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
