import "dotenv/config";

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const config = {
    port: Number(process.env.PORT ?? 3001),
    githubClientId: required("GITHUB_CLIENT_ID"),
    githubClientSecret: required("GITHUB_CLIENT_SECRET"),
    githubRedirectUri: required("GITHUB_REDIRECT_URI"),
    sessionSecret: required("SESSION_SECRET"),
};