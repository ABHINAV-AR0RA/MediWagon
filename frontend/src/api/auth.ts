import axios from "axios";

const API_BASE = "https://doc-backend-hsf5.onrender.com/api/auth";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  age: number;
  address: string;
  gender: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export const registerUser = async (
  data: RegisterData
): Promise<{ message?: string; userId?: string }> => {
  try {
    const res = await axios.post(`${API_BASE}/register`, data, {
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 201) {
      return res.data as { message?: string; userId?: string };
    }
    throw new Error((res.data && (res.data as any).message) || "Registration failed");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response && (error.response.data as any)?.message) || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const res = await axios.post(`${API_BASE}/login`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data as LoginResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response && (error.response.data as any)?.message) || error.message;
      throw new Error(message);
    }
    throw error;
  }
};
