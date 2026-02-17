export const metadata = {
  title: "Lady Fantasy Tarot",
  description: "Draw from a full 78-card deck. AI transforms your cards into a mystical cinematic narrative.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0514" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0a0514", overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
