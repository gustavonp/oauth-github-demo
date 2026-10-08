import { Router } from "express";

const router = Router();

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
};

router.get("/me", async (req, res) => {
  const token = req.session.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const ghRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "oauth-github-demo", // GitHub rejects requests without one
      },
    });

    // Token revoked or expired: end the session so the client shows "logged out"
    if (ghRes.status === 401) {
      return req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(401).json({ error: "Token is no longer valid" });
      });
    }

    if (!ghRes.ok) {
      return res.status(502).json({ error: "GitHub API request failed" });
    }

    const user = (await ghRes.json()) as GitHubUser;

    // Send only what the UI needs, never the token
    res.json({
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
    });
  } catch (err) {
    console.error("GitHub API error:", err);
    res.status(502).json({ error: "Could not reach GitHub" });
  }
});

export default router;