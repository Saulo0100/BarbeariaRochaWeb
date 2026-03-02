import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, usuarioApi } from "@/lib/api";
import type { UsuarioDetalhesResponse, LoginRequest } from "@/lib/types";

interface AuthContextType {
  user: UsuarioDetalhesResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isPerfil: (perfil: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioDetalhesResponse | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await usuarioApi.me();
      setUser(response.data);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const jwt = response.data;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    // Fetch user after setting token
    try {
      const userResponse = await usuarioApi.me();
      setUser(userResponse.data);
    } catch {
      // Token may be invalid
      localStorage.removeItem("token");
      setToken(null);
      throw new Error("Falha ao obter dados do usuário");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const isPerfil = (perfil: string) => {
    return user?.perfil?.toLowerCase() === perfil.toLowerCase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
        isPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
