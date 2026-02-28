import React from "react";

const HeroBackground = () => {
    return (
        <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
            {/* Primary Glow Blob */}
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] opacity-70 animate-pulse"
                style={{ animationDuration: "8s" }}></div>

            {/* Secondary Glow Blob - Offset and Different Color (Violet/Purple) */}
            <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#8B5CF6]/20 rounded-full blur-[80px] opacity-60 animate-pulse"
                style={{ animationDuration: "10s", animationDelay: "1s" }}></div>

            {/* Third Blob - Bottom Center */}
            <div className="absolute bottom-[20%] left-[30%] w-[600px] h-[300px] bg-primary-200/10 rounded-full blur-[90px] opacity-50 animate-bounce"
                style={{ animationDuration: "20s" }}></div>

            {/* Grid Pattern Overlay (Optional, enhances tech feel) */}
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] mix-blend-overlay"></div>
        </div>
    );
};

export default HeroBackground;
