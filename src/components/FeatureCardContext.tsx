"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureCardContextType {
    setControls: (node: ReactNode) => void;
}

const FeatureCardContext = createContext<FeatureCardContextType | undefined>(undefined);

export const useFeatureCardContext = () => {
    const context = useContext(FeatureCardContext);
    if (!context) {
        // Return a dummy setter if used outside (backwards compatibility/safety)
        return { setControls: () => { } };
    }
    return context;
};

export const FeatureCardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [controls, setControls] = useState<ReactNode>(null);

    return (
        <FeatureCardContext.Provider value={{ setControls }}>
            <div className="relative h-full flex flex-col">
                {/* Controls Slot - Absolute Top Right of the CARD */}
                <div className="absolute top-0 right-0 z-50">
                    {controls}
                </div>
                {children}
            </div>
        </FeatureCardContext.Provider>
    );
};
