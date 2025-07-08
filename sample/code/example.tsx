import React, { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

type Status = "loading" | "success" | "error";

const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    fetchUser(userId)
      .then(data => {
        setUser(data);
        setStatus("success");
      })
      .catch(error => {
        console.error("Failed to fetch user:", error);
        setStatus("error");
      });
  }, [userId]);

  const fetchUser = async (id: number): Promise<User> => {
    const response = await fetch(`/api/users/${id}`);
    if (\!response.ok) {
      throw new Error("User not found");
    }
    return response.json();
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error loading user</div>;

  return (
    <div className="user-profile">
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <span className={`role-badge ${user?.role}`}>{user?.role}</span>
    </div>
  );
};

export default UserProfile;
