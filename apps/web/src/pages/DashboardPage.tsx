import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { clearAccessToken } from "../lib/auth";

type MeResponse = {
  data: {
    name: string;
    email: string;
    role: string;
    preferences?: {
      roles?: string[];
      stack?: string[];
      minSalary?: number;
      vibe?: string;
      targetLocations?: string[];
      jobType?: string;
    };
  };
};

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse["data"] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get<MeResponse>("/api/v1/auth/me");
        setMe(response.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load profile");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout", {}, true);
    } finally {
      clearAccessToken();
      navigate("/login");
    }
  };

  if (loading) return <main className="auth-shell">Loading...</main>;
  if (error) return <main className="auth-shell error">{error}</main>;

  return (
    <main className="auth-shell">
      <section className="card">
        <h1>Welcome, {me?.name}</h1>
        <p>{me?.email}</p>
        <p>Plan: {me?.role}</p>
        <h3>Preferences</h3>
        <p>Roles: {me?.preferences?.roles?.join(", ") || "-"}</p>
        <p>Stack: {me?.preferences?.stack?.join(", ") || "-"}</p>
        <p>Min salary: {me?.preferences?.minSalary ?? "-"}</p>
        <p>Vibe: {me?.preferences?.vibe ?? "-"}</p>
        <p>Locations: {me?.preferences?.targetLocations?.join(", ") || "-"}</p>
        <p>Job type: {me?.preferences?.jobType ?? "-"}</p>
        <div className="row">
          <button onClick={() => navigate("/onboarding")}>Edit onboarding</button>
          <button onClick={logout}>Logout</button>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
