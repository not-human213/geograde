export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <main style={{ backgroundImage: "url('/bg.jpg')" }}>
          {children}
      </main>
    );
  }
  