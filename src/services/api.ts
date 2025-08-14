import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  CreateUserRequest, 
  UpdateUserRequest 
} from '@/types';

interface ResponseInterface<T> {
  message: string;
  data?: T;
}

interface ResponseListUsersInterface extends ResponseInterface<User[]> {
  total: number;
}

export class ApiError extends Error {
  status?: number;
  data?: AxiosNestErrorData | unknown;
  constructor(message: string, status?: number, data?: AxiosNestErrorData | unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type AxiosNestErrorData = { message?: string | string[]; statusCode?: number; [key: string]: unknown };

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro'): string {
  if (axios.isAxiosError<AxiosNestErrorData>(error)) {
    const msg = error.response?.data?.message ?? error.message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;
  } else if (error instanceof Error) {
    return error.message || fallback;
  } else if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

function hasData<T>(obj: unknown): obj is { data: T } {
  return !!obj && typeof obj === 'object' && 'data' in obj;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        const message = getErrorMessage(error, 'Erro na requisição');
        const data = error.response?.data;

        if (status === 401) {
          Cookies.remove('auth_token');
          // Redirect and also reject with a friendly error
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(new ApiError(message, status, data));
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse | { data: LoginResponse }> = await this.api.post('/auth/login', credentials);
    const body = response.data;
    return hasData<LoginResponse>(body) ? body.data : (body as LoginResponse);
  }
  async getUsers(): Promise<{ users: User[]; total: number; message?: string }> {
    type UsersListBody = ResponseListUsersInterface | { data: User[]; total: number; message?: string } | User[];
    const response: AxiosResponse<UsersListBody> = await this.api.get('/users');
    const body = response.data;
    if (Array.isArray(body)) {
      return { users: body, total: body.length };
    }
    if (body && typeof body === 'object' && 'data' in body) {
      const b = body as Partial<ResponseListUsersInterface> & { data: User[] };
      const total = typeof b.total === 'number' ? b.total : (b.data?.length ?? 0);
      const message = typeof b.message === 'string' ? b.message : undefined;
      return { users: b.data ?? [], total, message };
    }
    return { users: [], total: 0 };
  }

  async getUserById(id: string): Promise<User> {
    const response: AxiosResponse<User | { data: User }> = await this.api.get(`/users/${id}`);
    const body = response.data;
    return hasData<User>(body) ? body.data : (body as User);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response: AxiosResponse<User | { data: User }> = await this.api.post('/users', userData);
    const body = response.data;
    return hasData<User>(body) ? body.data : (body as User);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response: AxiosResponse<User | { data: User }> = await this.api.put(`/users/${id}`, userData);
    const body = response.data;
    return hasData<User>(body) ? body.data : (body as User);
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }
}

export const apiService = new ApiService();
