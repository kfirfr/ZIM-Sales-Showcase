import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Cormorant', 'Georgia', 'serif'],
                sans: ['var(--font-inter)', 'Montserrat', 'sans-serif'],
                mono: ['var(--font-jetbrains-mono)'],
            },
            spacing: {
                'section': '6rem',    // 96px — between major sections
                'card-gap': '3rem',   // 48px — bento grid gaps
                'content': '2rem',    // 32px — internal card padding
            },
            colors: {
                zim: {
                    void: "#030712", // Deep Void
                    teal: "#2DD4BF", // Teal-400
                },
                gen: {
                    orange: "#F97316", // Orange-500
                },
                glass: {
                    DEFAULT: "rgba(255, 255, 255, 0.03)",
                    border: "rgba(255, 255, 255, 0.08)",
                    active: "rgba(45, 212, 191, 0.1)", // Teal hint
                },
            },
            backgroundImage: {
                "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")",
            },
            animation: {
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                float: "float 6s ease-in-out infinite",
                "spin-slow": "spin-slow 4s linear infinite",
                "slide-in-right": "slide-in-right 0.4s ease-out",
                "pop-in": "pop-in 0.3s ease-out",
                "scan-sweep": "scan-sweep 1s linear infinite",
                "glitch-skew": "glitch-skew 0.3s infinite",
                "reveal-mask": "reveal-mask 3s linear forwards",
                "gradient-x": "gradient-x 6s ease infinite",
                "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "spin-slow": {
                    "0%": { transform: "translate(-50%, -50%) rotate(0deg)" },
                    "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
                },
                "slide-in-right": {
                    "from": { opacity: "0", transform: "translateX(10px)" },
                    "to": { opacity: "1", transform: "translateX(0)" },
                },
                "pop-in": {
                    "0%": { opacity: "0", transform: "scale(0.8) translateY(10px)" },
                    "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
                },
                "scan-sweep": {
                    "0%": { top: "-20%", opacity: "0" },
                    "10%": { opacity: "1" },
                    "90%": { opacity: "1" },
                    "100%": { top: "120%", opacity: "0" },
                },
                "glitch-skew": {
                    "0%": { transform: "skew(0deg)" },
                    "20%": { transform: "skew(-10deg)", filter: "hue-rotate(90deg)" },
                    "40%": { transform: "skew(10deg)", filter: "hue-rotate(-90deg)" },
                    "100%": { transform: "skew(0deg)" },
                },
                "reveal-mask": {
                    "0%": { clipPath: "inset(0 100% 0 0)" },
                    "100%": { clipPath: "inset(0 0 0 0)" },
                },
                "gradient-x": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" },
                },
                "slide-up": {
                    "from": { transform: "translateY(100%)", opacity: "0" },
                    "to": { transform: "translateY(0)", opacity: "1" },
                }
            },
        },
    },
    plugins: [],
};
export default config;
