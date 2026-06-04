import { createContext, useContext, useEffect, useState } from "react";
import { login, getUser } from "./User.jsx";
import SweetAlert from "sweetalert2";

const AuthContext = createContext({
  user: null,
  token: null,
  handleLogin: async () => {},
  handleLogout: () => {},
  isAuthenticated: () => false,
  hasRole: () => false,
  loading: true,
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in localStorage
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          // Verify token and get user data
          const [status, response] = await getUser();
          if (status === 200) {
            setUser(response.user);
            setToken(storedToken);
          } else {
            // Token is invalid or expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateSelectedBranch = (branch, role = null) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      const updatedUser = { 
        ...prevUser,
        selectedBranch: branch,
        ...(role && { selectedRole: role })
      };
      
      // Persist in localStorage if needed
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const handleLogin = async (username, password) => {
    try {
      SweetAlert.showLoading();
      const [status, response] = await login(username, password);
      
      if (status === 200) {
        let userData = response.user;
        
        // Set initial branch selection based on role
        if (userData.role === "Member" && userData.client_access?.length > 0) {
          userData = {
            ...userData,
            selectedBranch: userData.client_access[0]
          };
        }
        
        if (userData.role === "Super Member") {
          userData = {
            ...userData,
            selectedBranch: "All Branches",
            selectedRole: "Super Member"
          };
        }

        // Store token and user data
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setToken(response.token);
        
        return status;
      }
    } catch (error) {
      console.error("Login error:", error);
      SweetAlert.fire({
        icon: "error",
        title: "Login Error",
        text: "An error occurred during login",
        confirmButtonColor: "#FD6E28",
      });
      return 500;
    } finally {
      SweetAlert.close();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  const value = {
    user,
    token,
    loading,
    handleLogin,
    handleLogout,
    isAuthenticated,
    hasRole,
    updateSelectedBranch
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside of a AuthProvider");
  }

  return context;
}