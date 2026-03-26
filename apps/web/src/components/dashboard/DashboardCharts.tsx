import { useMemo, useState } from "react";
import { Card, Col, Form, Nav, Row } from "react-bootstrap";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

export type JobStatus = "wishlist" | "applied" | "interview" | "offer" | "rejected";

export type DashboardJob = {
  _id: string;
  company: string;
  title: string;
  location?: string;
  status: JobStatus;
  createdAt?: string;
};

const ACTIVE_STATUSES: JobStatus[] = ["wishlist", "applied", "interview"];

const STATUS_ORDER: JobStatus[] = ["wishlist", "applied", "interview", "offer", "rejected"];

const STATUS_LABELS: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

const STATUS_CHART_COLORS: Record<JobStatus, string> = {
  wishlist: "#2563eb",
  applied: "#7c3aed",
  interview: "#d97706",
  offer: "#16a34a",
  rejected: "#dc2626"
};

type LineTab = "applications" | "pipeline" | "outcomes";

function parseMongoIdDate(id: string): Date | null {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const ts = Number.parseInt(id.slice(0, 8), 16) * 1000;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

function jobMonthKey(j: DashboardJob): string | null {
  const d = j.createdAt ? new Date(j.createdAt) : parseMongoIdDate(j._id);
  if (!d || Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getRecentMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    out.push({ key, label });
  }
  return out;
}

type DashboardChartsProps = {
  jobs: DashboardJob[];
};

export default function DashboardCharts({ jobs }: DashboardChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [lineTab, setLineTab] = useState<LineTab>("applications");
  const [lineRange, setLineRange] = useState<6 | 12>(6);

  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.22)" : "rgba(15,23,42,0.08)";
  const inactiveBar = isDark ? "#3f3f46" : "#e5e7eb";
  /** Visible on dark cards without a gray plot “panel” */
  const locationBarFill = isDark ? "#4ade80" : "#22c55e";
  const highlightBar = "#3b82f6";
  const lineColor = isDark ? "#c084fc" : "#a855f7";

  const lineSeries = useMemo(() => {
    const months = getRecentMonths(lineRange);
    return months.map(({ key, label }) => {
      const inMonth = jobs.filter((j) => jobMonthKey(j) === key);
      return {
        month: label,
        applications: inMonth.length,
        pipeline: inMonth.filter((j) => ACTIVE_STATUSES.includes(j.status)).length,
        outcomes: inMonth.filter((j) => j.status === "offer" || j.status === "rejected").length
      };
    });
  }, [jobs, lineRange]);

  const lineDataKey =
    lineTab === "applications" ? "applications" : lineTab === "pipeline" ? "pipeline" : "outcomes";

  const stageBarData = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      name: STATUS_LABELS[status],
      value: jobs.filter((j) => j.status === status).length,
      status
    }));
  }, [jobs]);

  const stageMax = useMemo(() => Math.max(...stageBarData.map((d) => d.value), 0), [stageBarData]);

  const stageYMax = useMemo(() => {
    const max = Math.max(0, ...stageBarData.map((d) => d.value));
    return Math.max(1, max);
  }, [stageBarData]);

  const locationBarData = useMemo(() => {
    const map = new Map<string, number>();
    for (const j of jobs) {
      const loc = (j.location || "").trim() || "Unspecified";
      map.set(loc, (map.get(loc) || 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name: name.length > 18 ? `${name.slice(0, 17)}…` : name,
        value
      }));
  }, [jobs]);

  const locationYMax = useMemo(() => {
    const max = Math.max(0, ...locationBarData.map((d) => d.value));
    return Math.max(1, max);
  }, [locationBarData]);

  const stageLabelLayout = useMemo(() => {
    return { bottom: 16, angle: 0, textAnchor: "middle" as const, height: 28 };
  }, []);

  const locationLabelLayout = useMemo(() => {
    const n = locationBarData.length;
    if (n <= 5) {
      return { bottom: 8, angle: 0, textAnchor: "middle" as const, height: 24 };
    }
    return { bottom: 40, angle: -18, textAnchor: "end" as const, height: 44 };
  }, [locationBarData.length]);

  const stackedByMonth = useMemo(() => {
    const months = getRecentMonths(12);
    return months.map(({ key, label }) => {
      const inMonth = jobs.filter((j) => jobMonthKey(j) === key);
      const row: Record<string, string | number> = { month: label };
      for (const s of STATUS_ORDER) {
        row[s] = inMonth.filter((j) => j.status === s).length;
      }
      return row;
    });
  }, [jobs]);

  const tooltipStyle = {
    background: isDark ? "#1f2937" : "#111827",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: "0.85rem"
  };

  const emptyHint = (
    <p className="text-muted small mb-0 py-4 text-center">Add applications to see trends.</p>
  );

  return (
    <>
      <Row className="g-4 mb-4 dash-analytics-grid">
        <Col xs={12}>
          <Card className="dash-surface-card border-0 h-100 dash-line-chart-card">
            <Card.Body>
              <div className="d-flex flex-column flex-lg-row flex-wrap align-items-lg-center justify-content-between gap-3 mb-3">
                <h4 className="dash-chart-line-title mb-0">Applications over time</h4>
                <div className="d-flex flex-column flex-sm-row flex-wrap align-items-stretch align-items-sm-center gap-2 dash-line-chart-controls">
                  <Nav className="dash-line-tabs flex-wrap flex-shrink-0" variant="pills">
                    <Nav.Item>
                      <Nav.Link
                        as="button"
                        type="button"
                        active={lineTab === "applications"}
                        onClick={() => setLineTab("applications")}
                      >
                        Applications
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        as="button"
                        type="button"
                        active={lineTab === "pipeline"}
                        onClick={() => setLineTab("pipeline")}
                      >
                        Pipeline
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        as="button"
                        type="button"
                        active={lineTab === "outcomes"}
                        onClick={() => setLineTab("outcomes")}
                      >
                        Outcomes
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Form.Select
                    size="sm"
                    value={lineRange}
                    onChange={(e) => setLineRange(Number(e.target.value) as 6 | 12)}
                    className="dash-chart-select dash-chart-select--line"
                    aria-label="Time range"
                  >
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                  </Form.Select>
                </div>
              </div>
              <p className="small mb-3 dash-chart-line-desc">
                {lineTab === "applications" && "New applications added each month (by creation date)."}
                {lineTab === "pipeline" &&
                  "Of applications added that month, how many are still active (wishlist, applied, or interview)."}
                {lineTab === "outcomes" &&
                  "Of applications added that month, how many are closed as offer or rejected."}
              </p>
              {jobs.length === 0 ? (
                emptyHint
              ) : (
                <div className="dash-chart-wrap dash-chart-wrap--line">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={lineSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid
                        stroke={gridColor}
                        strokeDasharray="4 4"
                        vertical={false}
                        fill="none"
                      />
                      <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [value, "Count"]}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Line
                        type="monotone"
                        dataKey={lineDataKey}
                        name={lineDataKey}
                        stroke={lineColor}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#ffffff", stroke: "none" }}
                        activeDot={{ r: 5, fill: "#ffffff", stroke: lineColor, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4 dash-analytics-grid">
        <Col md={6}>
          <Card className="dash-surface-card border-0 h-100">
            <Card.Body>
              <h4 className="dash-chart-card-title dash-chart-card-title--blue mb-3">Pipeline stages</h4>
              {jobs.length === 0 ? (
                emptyHint
              ) : (
                <div className="dash-chart-wrap dash-chart-wrap--bar">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={stageBarData}
                      margin={{
                        top: 4,
                        right: 8,
                        left: 0,
                        bottom: stageLabelLayout.bottom
                      }}
                      barCategoryGap="24%"
                    >
                      <CartesianGrid
                        stroke={gridColor}
                        strokeDasharray="4 4"
                        vertical={false}
                        fill="none"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={stageLabelLayout.angle}
                        textAnchor={stageLabelLayout.textAnchor}
                        height={stageLabelLayout.height}
                      />
                      <YAxis
                        domain={[0, stageYMax]}
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [value, "Applications"]}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={52}
                        background={false}
                      >
                        {stageBarData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={entry.value === stageMax && stageMax > 0 ? highlightBar : inactiveBar}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="dash-surface-card border-0 h-100">
            <Card.Body>
              <h4 className="dash-chart-card-title dash-chart-card-title--green mb-3 dash-chart-bar-title--locations">
                Top locations
              </h4>
              {jobs.length === 0 ? (
                emptyHint
              ) : locationBarData.length === 0 ? (
                emptyHint
              ) : (
                <div className="dash-chart-wrap dash-chart-wrap--bar">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={locationBarData}
                      margin={{
                        top: 4,
                        right: 8,
                        left: 0,
                        bottom: locationLabelLayout.bottom
                      }}
                      barCategoryGap={locationBarData.length <= 2 ? "35%" : "24%"}
                    >
                      <CartesianGrid
                        stroke={gridColor}
                        strokeDasharray="4 4"
                        vertical={false}
                        fill="none"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={locationLabelLayout.angle}
                        textAnchor={locationLabelLayout.textAnchor}
                        height={locationLabelLayout.height}
                      />
                      <YAxis
                        domain={[0, locationYMax]}
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [value, "Applications"]}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Bar
                        dataKey="value"
                        fill={locationBarFill}
                        radius={[10, 10, 0, 0]}
                        maxBarSize={locationBarData.length <= 2 ? 72 : 52}
                        background={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4 dash-analytics-grid">
        <Col xs={12}>
          <Card className="dash-surface-card border-0 h-100">
            <Card.Body>
              <h4 className="dash-chart-card-title dash-chart-card-title--coral mb-2">Pipeline by month</h4>
              <p className="text-muted small mb-3">
                For each month, applications added that month (by creation date), split by current stage.
              </p>
              {jobs.length === 0 ? (
                emptyHint
              ) : (
                <div className="dash-chart-wrap dash-chart-wrap--stacked">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={stackedByMonth}
                      margin={{ top: 36, right: 8, left: 0, bottom: 0 }}
                      barGap={4}
                    >
                      <CartesianGrid
                        stroke={gridColor}
                        strokeDasharray="4 4"
                        vertical={false}
                        fill="none"
                      />
                      <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [value, STATUS_LABELS[name as JobStatus] ?? name]}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ top: -8, right: 0 }}
                        formatter={(value) => STATUS_LABELS[value as JobStatus] ?? value}
                      />
                      {STATUS_ORDER.map((s, idx) => (
                        <Bar
                          key={s}
                          dataKey={s}
                          stackId="pipeline"
                          fill={STATUS_CHART_COLORS[s]}
                          radius={idx === STATUS_ORDER.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                          maxBarSize={28}
                          background={false}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
