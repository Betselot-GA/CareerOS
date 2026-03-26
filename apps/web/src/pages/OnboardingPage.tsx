import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Form, ProgressBar, Row, Spinner } from "react-bootstrap";
import { api } from "../lib/api";
import { clearAccessToken } from "../lib/auth";
import DashboardShell from "../components/layout/DashboardShell";

type MeResponse = {
  data: {
    name: string;
    email: string;
    role: string;
  };
};

function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [me, setMe] = useState<MeResponse["data"] | null>(null);
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState("Backend Engineer");
  const [stack, setStack] = useState("Node.js, TypeScript, MongoDB");
  const [minSalary, setMinSalary] = useState(120000);
  const [vibe, setVibe] = useState("startup");
  const [targetLocations, setTargetLocations] = useState("Remote - US, New York");
  const [jobType, setJobType] = useState("remote");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const meResponse = await api.get<MeResponse>("/api/v1/auth/me");
        setMe(meResponse.data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Could not load profile");
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
    setSaving(true);
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-root dash-root--loading">
        <Spinner animation="border" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="dash-root dash-root--loading text-danger px-3 text-center">
        {loadError}
      </div>
    );
  }

  if (!me) return null;

  return (
    <DashboardShell
      title="Career preferences"
      breadcrumb="Career / Onboarding"
      userName={me.name}
      userEmail={me.email}
      role={me.role}
      onLogout={() => void logout()}
    >
      <div className="mx-auto" style={{ maxWidth: "720px" }}>
        <Card className="dash-surface-card border-0">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Career preferences</h2>
              <span className="text-muted small">Step {step}/3</span>
            </div>
            <ProgressBar now={(step / 3) * 100} className="mb-4" />

            <Form onSubmit={onSubmit}>
              {step === 1 && (
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Target roles (comma-separated)</Form.Label>
                      <Form.Control value={roles} onChange={(e) => setRoles(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tech stack (comma-separated)</Form.Label>
                      <Form.Control value={stack} onChange={(e) => setStack(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {step === 2 && (
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Minimum salary</Form.Label>
                      <Form.Control
                        type="number"
                        value={minSalary}
                        onChange={(e) => setMinSalary(Number(e.target.value))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Company vibe</Form.Label>
                      <Form.Select value={vibe} onChange={(e) => setVibe(e.target.value)} required>
                        <option value="startup">Startup</option>
                        <option value="midsize">Midsize</option>
                        <option value="corporate">Corporate</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {step === 3 && (
                <Row>
                  <Col md={8} className="mb-3">
                    <Form.Group>
                      <Form.Label>Target locations (comma-separated)</Form.Label>
                      <Form.Control
                        value={targetLocations}
                        onChange={(e) => setTargetLocations(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Job type</Form.Label>
                      <Form.Select value={jobType} onChange={(e) => setJobType(e.target.value)} required>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {error && <Alert variant="danger">{error}</Alert>}
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : step === 3 ? "Finish onboarding" : "Continue"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default OnboardingPage;
