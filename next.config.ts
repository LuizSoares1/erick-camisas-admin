import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Como todos os dados ficam no navegador/JSON local (sem backend nem
  // banco de dados), o app pode ser exportado como site 100% estático.
  // Isso permite hospedar de graça em Vercel, Netlify, GitHub Pages, etc.
  output: "export",
};

export default nextConfig;
