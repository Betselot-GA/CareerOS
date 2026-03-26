import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/auth";
import GoogleAuthButton from "../components/GoogleAuthButton";

function RegisterPage() {
  const passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$";
  const emailPattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post<{ data: { accessToken: string } }>("/api/v1/auth/register", {
        name,
        email,
        password,
        confirmPassword
      });
      setAccessToken(response.data.accessToken);
      navigate("/onboarding");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const registerWithGoogleToken = async (idToken: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await api.post<{ data: { accessToken: string } }>("/api/v1/auth/google", {
        idToken
      });
      setAccessToken(response.data.accessToken);
      navigate("/onboarding");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <Container className="auth-container">
        <Card className="shadow-lg border-0">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-2">Create your account</h2>
            <p className="text-muted mb-4">Start your AI-powered job search system.</p>
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  pattern={emailPattern}
                  autoComplete="email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  pattern={passwordPattern}
                  type="password"
                  autoComplete="new-password"
                />
                <Form.Text muted>
                  At least 8 chars with uppercase, lowercase, number, and special character.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button type="submit" disabled={loading} className="w-100">
                {loading ? "Creating..." : "Create account"}
              </Button>
            </Form>
            <p className="mt-3 mb-0 text-muted">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
            <hr className="my-4" />
            <GoogleAuthButton
              text="signup_with"
              onError={setError}
              onCredential={(token) => {
                void registerWithGoogleToken(token);
              }}
            />
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}

export default RegisterPage;
