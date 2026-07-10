import "./globals.css";

export const metadata = {
  title: "Everanima — the AI that remembers who you are",
  description:
    "A personal AI that writes its own memory of you, anchored to your Solana wallet. Long chats never erode who you are."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
