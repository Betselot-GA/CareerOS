import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState("Backend Engineer");
  const [stack, setStack] = useState("Node.js, TypeScript, MongoDB");
  const [minSalary, setMinSalary] = useState(120000);
  const [vibe, setVibe] = useState("startup");
  const [targetLocations, setTargetLocations] = useState("Remote - US, New York");
  const [jobType, setJobType] = useState("remote");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitStepOne = async () => {
    await api.patch("/api/v1/preferences/onboarding/step-1", {
      roles: roles.split(",").map((r) => r.trim()).filter(Boolean),
      stack: stack.split(",").map((s) => s.trim()).filter(Boolean)
    });
  };

  const submitStepTwo = async () => {
    await api.patch("/api/v1/preferences/onboarding/step-2", {
      minSalary: Number(minSalary),
      vibe
    });
  };

  const submitStepThree = async () => {
    await api.patch("/api/v1/preferences/onboarding/step-3", {
      targetLocations: targetLocations.split(",").map((l) => l.trim()).filter(Boolean),
      jobType
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (step === 1) {
        await submitStepOne();
        setStep(2);
      } else if (step === 2) {
        await submitStepTwo();
        setStep(3);
      } else {
        await submitStepThree();
        navigate("/dashboard");
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not save step");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <form className="card form" onSubmit={onSubmit}>
        <h1>Onboarding (Step {step}/3)</h1>

        {step === 1 && (
          <>
            <label>
              Target roles (comma-separated)
              <input value={roles} onChange={(e) => setRoles(e.target.value)} required />
            </label>
            <label>
              Tech stack (comma-separated)
              <input value={stack} onChange={(e) => setStack(e.target.value)} required />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <label>
              Minimum salary
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Company vibe
              <select value={vibe} onChange={(e) => setVibe(e.target.value)} required>
                <option value="startup">Startup</option>
                <option value="midsize">Midsize</option>
                <option value="corporate">Corporate</option>
              </select>
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <label>
              Target locations (comma-separated)
              <input
                value={targetLocations}
                onChange={(e) => setTargetLocations(e.target.value)}
                required
              />
            </label>
            <label>
              Job type
              <select value={jobType} onChange={(e) => setJobType(e.target.value)} required>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </label>
          </>
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : step === 3 ? "Finish onboarding" : "Continue"}
        </button>
      </form>
    </main>
  );
}

export default OnboardingPage;
