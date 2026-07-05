import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const is404 = router.route === "/404";
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <SessionProvider session={session}>
      <div className="font-sans">
        {!is404 && <Navbar theme={theme} toggleTheme={toggleTheme} />}
        <main className={is404 ? "" : "min-h-[calc(100vh-4rem)] bg-background text-foreground transition-colors duration-200"}>
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  );
}
