import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { api } from "../lib/api";
import { clearAccessToken } from "../lib/auth";
import ApplicationsTableCard from "../components/dashboard/ApplicationsTableCard";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardShell from "../components/layout/DashboardShell";

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

type Job = {
  _id: string;
  company: string;
  title: string;
  location?: string;
  notes?: string;
  status: JobStatus;
  sortKey?: number;
  createdAt?: string;
  updatedAt?: string;
};

type JobStatus = "wishlist" | "applied" | "interview" | "offer" | "rejected";

const ACTIVE_STATUSES: JobStatus[] = ["wishlist", "applied", "interview"];

const STATUS_ORDER: JobStatus[] = ["wishlist", "applied", "interview", "offer", "rejected"];

const STATUS_LABELS: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

/** Matches Kanban column chip colors (light theme) for chart consistency */
const STATUS_CHART_COLORS: Record<JobStatus, string> = {
  wishlist: "#2563eb",
  applied: "#7c3aed",
  interview: "#d97706",
  offer: "#16a34a",
  rejected: "#dc2626"
};

type ChartRow = { name: string; value: number; key: JobStatus };

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse["data"] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [meResponse, jobsResponse] = await Promise.all([
          api.get<MeResponse>("/api/v1/auth/me"),
          api.get<{ data: Job[] }>("/api/v1/jobs")
        ]);
        setMe(meResponse.data);
        setJobs(jobsResponse.data);
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

  const activeCount = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status)).length;
  const isUnlimited = me?.role === "pro" || me?.role === "admin";
  const interviewCount = jobs.filter((j) => j.status === "interview").length;
  const offerCount = jobs.filter((j) => j.status === "offer").length;
  const rejectedCount = jobs.filter((j) => j.status === "rejected").length;

  const chartData = useMemo((): ChartRow[] => {
    return STATUS_ORDER.map((status) => ({
      name: STATUS_LABELS[status],
      value: jobs.filter((j) => j.status === status).length,
      key: status
    })).filter((row) => row.value > 0);
  }, [jobs]);

  const resolvedCount = offerCount + rejectedCount;
  const successRatePercent =
    resolvedCount > 0 ? Math.round((offerCount / resolvedCount) * 100) : null;

  if (loading)
    return (
      <div className="dash-root dash-root--loading">
        <Spinner animation="border" />
      </div>
    );
  if (error)
    return (
      <div className="dash-root dash-root--loading text-danger px-3 text-center">
        {error}
      </div>
    );

  if (!me) return null;

  return (
    <DashboardShell
      title="Dashboard Overview"
      breadcrumb="Dashboards / Default"
      userName={me.name}
      userEmail={me.email}
      role={me.role}
      onLogout={() => void logout()}
    >
      <div className="dash-kpi-grid mb-4">
        <div className="dash-kpi dash-kpi--blue">
          <div className="dash-kpi-label">Total applications</div>
          <div className="dash-kpi-value">{jobs.length}</div>
          <div className="dash-kpi-sub">Saved in your pipeline</div>
        </div>
        <div className="dash-kpi dash-kpi--dark">
          <div className="dash-kpi-label">Active pipeline</div>
          <div className="dash-kpi-value">{activeCount}</div>
          <div className="dash-kpi-sub">
            {isUnlimited ? "Unlimited plan" : `Cap ${activeCount}/10 on FREE`}
          </div>
        </div>
        <div className="dash-kpi dash-kpi--blue">
          <div className="dash-kpi-label">Interviews</div>
          <div className="dash-kpi-value">{interviewCount}</div>
          <div className="dash-kpi-sub">In interview stage</div>
        </div>
        <div className="dash-kpi dash-kpi--dark">
          <div className="dash-kpi-label">Offers</div>
          <div className="dash-kpi-value">{offerCount}</div>
          <div className="dash-kpi-sub">Wins to celebrate</div>
        </div>
      </div>

      <DashboardCharts jobs={jobs} />

      <ApplicationsTableCard jobs={jobs} />

      <Row className="g-4 mb-4">
        <Col xs={12}>
          <Card className="dash-surface-card border-0">
            <Card.Body>
              <h4 className="mb-1">Application success</h4>
              <p className="text-muted small mb-3">
                How your applications are distributed by stage, and your win rate when an outcome is recorded (offer vs
                rejected).
              </p>
              <Row className="align-items-center g-4">
                <Col lg={7}>
                  {jobs.length === 0 ? (
                    <p className="text-muted mb-0">
                      Add applications from Applications to see your pipeline chart.
                    </p>
                  ) : (
                    <div className="dash-chart-wrap">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={68}
                            outerRadius={112}
                            paddingAngle={2}
                          >
                            {chartData.map((entry) => (
                              <Cell key={entry.key} fill={STATUS_CHART_COLORS[entry.key]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              typeof value === "number" ? value : Number(value ?? 0),
                              "Applications"
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Col>
                <Col lg={5}>
                  {resolvedCount > 0 ? (
                    <>
                      <div className="metric-label mb-1">Win rate (closed outcomes)</div>
                      <div className="dash-chart-success-rate">{successRatePercent}%</div>
                      <div className="dash-chart-success-label">
                        {offerCount} offer{offerCount === 1 ? "" : "s"} vs {rejectedCount} rejected
                      </div>
                    </>
                  ) : jobs.length > 0 ? (
                    <p className="text-muted mb-0">
                      Move applications to <strong>Offer</strong> or <strong>Rejected</strong> on the board to track
                      your success rate.
                    </p>
                  ) : null}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xs={12}>
          <Card className="dash-surface-card border-0">
            <Card.Body>
              <h4 className="mb-3">Preference snapshot</h4>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="metric-label">Roles</div>
                  <div>{me.preferences?.roles?.join(", ") || "—"}</div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="metric-label">Stack</div>
                  <div>{me.preferences?.stack?.join(", ") || "—"}</div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="metric-label">Min salary</div>
                  <div>{me.preferences?.minSalary ?? "—"}</div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="metric-label">Vibe</div>
                  <div>{me.preferences?.vibe ?? "—"}</div>
                </Col>
                <Col md={8} className="mb-3">
                  <div className="metric-label">Target locations</div>
                  <div>{me.preferences?.targetLocations?.join(", ") || "—"}</div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="metric-label">Job type</div>
                  <div>{me.preferences?.jobType ?? "—"}</div>
                </Col>
              </Row>
              <Button variant="outline-primary" size="sm" onClick={() => navigate("/onboarding")}>
                Edit onboarding
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardShell>
  );
}

export default DashboardPage;
