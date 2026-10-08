import { useEffect, useState } from "react";
import Profile, { type User } from "./components/Profile";

type AuthState =
  | { status: "loading" }
  | { status: "loggedOut" }
  | { status: "loggedIn"; user: User }
  | { status: "error" };

function App() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (res.status === 401) return setAuth({ status: "loggedOut" });
        if (!res.ok) return setAuth({ status: "error" });
        const user = (await res.json()) as User;
        setAuth({ status: "loggedIn", user });
      })
      .catch(() => setAuth({ status: "error" }));
  }, []);

  async function handleLogout() {
    await fetch("/auth/logout", { method: "POST" });
    setAuth({ status: "loggedOut" });
  }

  return (
    <main style={{ maxWidth: 480, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h1>OAuth GitHub Demo</h1>

      {auth.status === "loading" && <p>Loading...</p>}

      {auth.status === "error" && <p>Something went wrong. Is the server running?</p>}

      {auth.status === "loggedOut" && (
        <>
          <p>You are not logged in.</p>
          {/* Plain link: the browser must navigate to GitHub, not fetch */}
          <a href="/auth/github">Login with GitHub</a>
        </>
      )}

      {auth.status === "loggedIn" && (
        <Profile user={auth.user} onLogout={handleLogout} />
      )}
    </main>
  );
}

export default App;