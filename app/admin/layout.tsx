import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - Docuverse",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      {children}
    </div>
  );
}
