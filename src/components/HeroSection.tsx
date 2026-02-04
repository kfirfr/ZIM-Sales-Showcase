import React, { useState, useEffect } from 'react';

export const HeroSection = () => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { setLoaded(true); }, []);

    return (
        <div className="text-center mb-32 relative z-10 pt-20 min-h-[50vh] flex flex-col justify-center">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}></div>
            <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-tight relative z-20">
                <span className="block overflow-hidden"><span className={`block transition-all duration-1000 ease-out transform ${loaded ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-20 opacity-0 blur-xl'}`}>The Intelligent</span></span>
                <span className="block overflow-hidden"><span className={`block quattro-gradient transition-all duration-1000 delay-200 ease-out transform ${loaded ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-20 opacity-0 blur-xl'}`}>Neural Core</span></span>
            </h1>
            <p className={`text-xl text-slate-400 max-w-2xl mx-auto font-light transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                ZIM's operational brain. <span className="text-white font-medium">Analyzing, distilling, and translating</span> every interaction in real-time.
            </p>
        </div>
    );
};
