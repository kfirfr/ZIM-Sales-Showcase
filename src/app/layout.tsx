import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BackgroundNeuralStars } from "@/components/BackgroundNeuralStars";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
    title: "ZIM AI Showcase",
    description: "ZIM Integrated Shipping AI Showcase",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${jetbrainsMono.variable} bg-slate-900 text-white antialiased`}>
                <BackgroundNeuralStars />
                {children}
            </body>
        </html>
    );
}
