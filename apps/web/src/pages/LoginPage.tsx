import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/auth";
import GoogleAuthButton from "../components/GoogleAuthButton";

function LoginPage() {
  const passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$";
  const emailPattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post<{ data: { accessToken: string } }>("/api/v1/auth/login", {
        email,
        password
      });
      setAccessToken(response.data.accessToken);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleToken = async (idToken: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await api.post<{ data: { accessToken: string } }>("/api/v1/auth/google", {
        idToken
      });
      setAccessToken(response.data.accessToken);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <Container className="auth-container">
        <Card className="shadow-lg border-0">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-2">Welcome back</h2>
            <p className="text-muted mb-4">Sign in to continue building your career pipeline.</p>
            <Form onSubmit={onSubmit}>
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
                  autoComplete="current-password"
                />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button type="submit" disabled={loading} className="w-100">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Form>
            <p className="mt-3 mb-0 text-muted">
              New here? <Link to="/register">Create account</Link>
            </p>
            <hr className="my-4" />
            <GoogleAuthButton
              text="signin_with"
              onError={setError}
              onCredential={(token) => {
                void loginWithGoogleToken(token);
              }}
            />
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}

export default LoginPage;
