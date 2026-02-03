import React, { createContext, useContext, useState } from 'react'

export type ActorGroup = 'DGS_OFFICER' | 'SEAFARER' | 'RPSL_ORG' | 'MTI_ORG' | 'SHIPPING_CO';


export type ModuleType = 'GRIEVANCE' | 'CRISIS' | 'MTI_COMPLIANCE'  | 'RPSL';

interface UserState {
  name: string;
  actorGroup: ActorGroup;
  roles: string[];
  organization?: string;
}

const GovernanceContext = createContext<any>(null);

export const GovernanceProvider = ({ children }: { children: React.ReactNode}) => {
  const [user, setUser] = useState<UserState>({
    name: "Suraj",
    actorGroup: 'SEAFARER',
    roles: ['APPLICANT'],
  });

  const switchActorGroup = (group: ActorGroup) => {
    const roleMap: Record<ActorGroup, string[]> = {
      'DGS_OFFICER' : ['REVIEWER', 'PROCESSOR'],
      'SEAFARER' : ['APPLICANT'],
      'RPSL_ORG': ['ADMINISTRATOR'],
      'MTI_ORG': ['SUPERVISOR'],
      'SHIPPING_CO' : ['VIEWER']
    };

    setUser({
      name: group === 'DGS_OFFICER' ? "Officer Smith" : "Suraj",
      actorGroup: group,
      roles: roleMap[group],
      organization: group === 'DGS_OFFICER' ? 'DG Shipping' : 'Individual'
    });
  };


  const hasModuleAccess = (module: ModuleType) => {
    const accessMap: Record<ActorGroup, ModuleType[]> = {
      'DGS_OFFICER' : ['GRIEVANCE', 'CRISIS', 'MTI_COMPLIANCE', 'RPSL'],
      'SEAFARER' : ['GRIEVANCE'], 
      'RPSL_ORG' : ['GRIEVANCE', 'CRISIS', 'RPSL'],
      'MTI_ORG' : ['MTI_COMPLIANCE', 'GRIEVANCE'],
      'SHIPPING_CO' : ['CRISIS', 'GRIEVANCE'],
    };
    

    return accessMap[user.actorGroup]?.includes(module) || false;
  };

  return (
    <GovernanceContext.Provider value={{ user, hasModuleAccess, switchActorGroup }}>
      {children}
    </GovernanceContext.Provider>
  );
};

export const useGovernance = () => {
  const context = useContext(GovernanceContext);
  if (!context) throw new Error("useGovernance must be used within a GovernanceProvider");
  return context;
}