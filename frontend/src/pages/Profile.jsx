import { useAuth } from "../context/useAuth";

function Profile() {
  const { user } = useAuth();

  return (
    <main className="page-title">
      <h1>Profile</h1>
      <p>
        {user.firstName} {user.lastName}
      </p>
      <p>{user.email}</p>
    </main>
  );
}

export default Profile;
