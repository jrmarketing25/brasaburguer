import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brasa-bg text-brasa-cream">
      {children}
    </div>
  );
}

