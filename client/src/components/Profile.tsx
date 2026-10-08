export type User = {
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
};

type Props = {
  user: User;
  onLogout: () => void;
};

function Profile({ user, onLogout }: Props) {
  return (
    <section style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <img
        src={user.avatarUrl}
        alt={`${user.login}'s avatar`}
        width={96}
        height={96}
        style={{ borderRadius: "50%" }}
      />
      <div>
        <h2 style={{ margin: 0 }}>{user.name ?? user.login}</h2>
        <p style={{ margin: "0.25rem 0" }}>
          <a href={user.profileUrl} target="_blank" rel="noreferrer">
            @{user.login}
          </a>
        </p>
        <p style={{ margin: "0.25rem 0" }}>Public repos: {user.publicRepos}</p>
        <button onClick={onLogout}>Log out</button>
      </div>
    </section>
  );
}

export default Profile;