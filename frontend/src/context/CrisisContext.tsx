import React, { createContext, useContext, useState, ReactNode } from 'react';

type CrisisContextType = {
    crisisAlertActive: boolean;
    setCrisisAlert: (active: boolean) => void;
    clearCrisisAlert: () => void;
};

const CrisisContext = createContext<CrisisContextType | undefined>(undefined);

export const CrisisProvider = ({ children }: { children: ReactNode }) => {
    const [crisisAlertActive, setCrisisAlertActive] = useState(false);

    const setCrisisAlert = (active: boolean) => {
        setCrisisAlertActive(active);
    };

    const clearCrisisAlert = () => {
        setCrisisAlertActive(false);
    };

    return (
        <CrisisContext.Provider value={{ crisisAlertActive, setCrisisAlert, clearCrisisAlert }}>
            {children}
        </CrisisContext.Provider>
    );
};

export const useCrisis = () => {
    const context = useContext(CrisisContext);
    if (!context) {
        throw new Error('useCrisis must be used within CrisisProvider');
    }
    return context;
};
