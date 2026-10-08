import { Router } from "express";
import crypto from "node:crypto";
import { config } from "../config";

declare module "express-session" {
    interface SessionData {
        oauthState?: string;
        accessToken?: string;
    }
}

const router = Router();

router.get("/github", (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

    const params = new URLSearchParams({
        client_id: config.githubClientId,
        redirect_id: config.githubRedirectUri,
        scope: "read:user",
        state,
    });

    req.session.save(() => {
        res.redirect(`https://github.com/login/oauth/authorize?${params}`);
    });
});

router.get("/github/callback", async (req, res) => {
  const { code, state, error } = req.query;

  
  if (error) {
    return res.status(400).send(`GitHub returned an error: ${String(error)}`);
  }

  if (typeof code !== "string" || typeof state !== "string") {
    return res.status(400).send("Missing code or state");
  }

  // Clear the temp state.
  const expectedState = req.session.oauthState;
  delete req.session.oauthState;

  if (!expectedState || state !== expectedState) {
    return res.status(403).send("Invalid state. Possible CSRF attempt.");
  }

  try {
    // Access Token:
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: config.githubRedirectUri,
      }),
    });

    const data = (await tokenRes.json()) as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (data.error || !data.access_token) {
      console.error("Token exchange failed:", data.error, data.error_description);
      return res.status(502).send("Failed to exchange code for token");
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).send("Session error");

      req.session.accessToken = data.access_token;
      req.session.save(() => res.redirect("/"));
    });
  } catch (err) {
    console.error("Token exchange error:", err);
    res.status(502).send("Could not reach GitHub");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
});

export default router;