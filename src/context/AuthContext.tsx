import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { registerUser } from "../api/registerUser";
import { loginUser } from "../api/api";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  gender?: 'male' | 'female';
  avatar?: string;
  credits?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<void>;

  register: (firstName: string, lastName: string, fullName: string, email: string, phone: string, universityId: string, password: string, gender: string) => Promise<void>;

  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);

      if (data.status === "success") {
        const userData = data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };


  const register = async (
    firstName: string,
    lastName: string,
    fullName: string,
    email: string,
    phone: string,
    universityId: string,
    password: string,
    gender: string
  ) => {
    setLoading(true);
    try {
      const data = await registerUser(firstName, lastName, fullName, email, phone, universityId, password, gender);


      if (data.status === "success") {
        await login(email, password);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isManager: user?.role === "manager",
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

