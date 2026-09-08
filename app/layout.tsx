import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel Administrativo",
  description: "Controle de entradas e saídas de produção",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
