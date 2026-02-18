import React, { createContext, useContext, useState, useEffect } from 'react';

export type ActorGroup = 'DGS_OFFICER' | 'SEAFARER' | 'RPSL_ORG' | 'MTI_ORG' | 'SHIPPING_CO';
export type ModuleType = 'GRIEVANCE' | 'CRISIS' | 'MTI_COMPLIANCE' | 'RPSL';

interface UserState {
  id: number | null;
  name: string;
  email: string;
  actorGroup: ActorGroup;
  roles: string[];
  organization?: string;
  indos_number?: string;
}

interface GovernanceContextType {
  user: UserState;
  setUserFromLogin: (userData: any) => void;
  hasModuleAccess: (module: ModuleType) => boolean;
  switchActorGroup: (group: ActorGroup) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultUser: UserState = {
  id: null,
  name: "Guest",
  email: "",
  actorGroup: 'SEAFARER',
  roles: ['APPLICANT'],
};

const GovernanceContext = createContext<GovernanceContextType | null>(null);

export const GovernanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserState>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ 1. Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("Loading user from storage:", userData);
        
        setUser({
          id: userData.id,
          name: userData.display_name || userData.name || userData.full_name || 'User',
          email: userData.email || userData.official_email || '',
          actorGroup: mapUserTypeToActorGroup(userData.user_type_code || userData.role_key),
          roles: [userData.user_type_code || userData.role_key || 'APPLICANT'],
          organization: userData.organization,
          indos_number: userData.indos_number,
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user'); // Clear corrupted data
      }
    }
  }, []);

  // ✅ Helper to map DB roles to ActorGroups
  const mapUserTypeToActorGroup = (code: string): ActorGroup => {
    const mapping: Record<string, ActorGroup> = {
      'SEAFARER': 'SEAFARER',
      'DGS_OFFICER': 'DGS_OFFICER',
      'RPSL_ORG': 'RPSL_ORG',
      'MTI_ORG': 'MTI_ORG',
      'SHIPPING_CO': 'SHIPPING_CO',
    };
    return mapping[code] || 'SEAFARER';
  };

  // ✅ 2. Set user after login
  const setUserFromLogin = (userData: any) => {
    console.log('Setting user from login:', userData);
    
    const newUser: UserState = {
      id: userData.id,
      name: userData.display_name || userData.name || userData.full_name || 'User',
      email: userData.email || userData.official_email || '',
      actorGroup: mapUserTypeToActorGroup(userData.user_type_code || userData.role_key),
      roles: [userData.user_type_code || userData.role_key || 'APPLICANT'],
      organization: userData.organization,
      indos_number: userData.indos_number,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    
    // Save to storage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // ✅ 3. Logout
  const logout = () => {
    setUser(defaultUser);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // ✅ 4. Switch Group (Dev/Demo Mode)
  const switchActorGroup = (group: ActorGroup) => {
    const roleMap: Record<ActorGroup, string[]> = {
      'DGS_OFFICER': ['REVIEWER', 'PROCESSOR'],
      'SEAFARER': ['APPLICANT'],
      'RPSL_ORG': ['ADMINISTRATOR'],
      'MTI_ORG': ['SUPERVISOR'],
      'SHIPPING_CO': ['VIEWER']
    };

    setUser(prev => ({
      ...prev,
      name: group === 'DGS_OFFICER' ? "Officer Smith" : prev.name, // Only change name for demo switch
      actorGroup: group,
      roles: roleMap[group],
    }));
  };

  const hasModuleAccess = (module: ModuleType) => {
    const accessMap: Record<ActorGroup, ModuleType[]> = {
      'DGS_OFFICER': ['GRIEVANCE', 'CRISIS', 'MTI_COMPLIANCE', 'RPSL'],
      'SEAFARER': ['GRIEVANCE'],
      'RPSL_ORG': ['GRIEVANCE', 'CRISIS', 'RPSL'],
      'MTI_ORG': ['MTI_COMPLIANCE', 'GRIEVANCE'],
      'SHIPPING_CO': ['CRISIS', 'GRIEVANCE'],
    };

    return accessMap[user.actorGroup]?.includes(module) || false;
  };

  return (
    <GovernanceContext.Provider value={{ 
      user, 
      setUserFromLogin, 
      hasModuleAccess, 
      switchActorGroup,
      logout,
      isAuthenticated 
    }}>
      {children}
    </GovernanceContext.Provider>
  );
};

export const useGovernance = () => {
  const context = useContext(GovernanceContext);
  if (!context) throw new Error("useGovernance must be used within a GovernanceProvider");
  return context;
};