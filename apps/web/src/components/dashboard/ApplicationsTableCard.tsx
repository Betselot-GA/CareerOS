import { useMemo } from "react";
import { Card, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export type TableJobStatus = "wishlist" | "applied" | "interview" | "offer" | "rejected";

export type ApplicationsTableJob = {
  _id: string;
  company: string;
  title: string;
  status: TableJobStatus;
  sortKey?: number;
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_LABELS: Record<TableJobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

function parseMongoIdDate(id: string): Date | null {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const ts = Number.parseInt(id.slice(0, 8), 16) * 1000;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

function jobDisplayDate(j: ApplicationsTableJob): Date | null {
  if (j.updatedAt) {
    const d = new Date(j.updatedAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (j.createdAt) {
    const d = new Date(j.createdAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return parseMongoIdDate(j._id);
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function companyInitials(company: string): string {
  const parts = company.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const MAX_ROWS = 10;

type ApplicationsTableCardProps = {
  jobs: ApplicationsTableJob[];
};

export default function ApplicationsTableCard({ jobs }: ApplicationsTableCardProps) {
  const navigate = useNavigate();

  const rows = useMemo(() => {
    return [...jobs]
      .sort((a, b) => (b.sortKey ?? 0) - (a.sortKey ?? 0))
      .slice(0, MAX_ROWS);
  }, [jobs]);

  return (
    <Card className="dash-surface-card border-0 dash-apps-table-card mb-4">
      <Card.Body className="pt-4 pb-4">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
          <h4 className="dash-apps-table-title mb-0">Applications</h4>
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              type="button"
              variant="link"
              className="dash-apps-table-menu p-0 border-0"
              aria-label="Application list actions"
            >
              <span className="dash-apps-table-menu-dots" aria-hidden>
                ⋯
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate("/applications")}>View all applications</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="dash-apps-table-head" role="row">
          <span>Company</span>
          <span>Date</span>
          <span>Role</span>
          <span className="text-end">Status</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-muted small mb-0 py-4 text-center">No applications yet. Add one from Applications.</p>
        ) : (
          <div className="dash-apps-table-body">
            {rows.map((job) => (
              <div key={job._id} className="dash-apps-table-row" role="row">
                <div className="dash-apps-table-cell dash-apps-table-cell--company">
                  <span className="dash-apps-avatar" aria-hidden>
                    {companyInitials(job.company)}
                  </span>
                  <span className="dash-apps-company-name">{job.company}</span>
                </div>
                <div className="dash-apps-table-cell dash-apps-table-cell--meta" data-label="Date">
                  <span className="dash-apps-table-muted d-md-none">Date · </span>
                  {formatDate(jobDisplayDate(job))}
                </div>
                <div className="dash-apps-table-cell dash-apps-table-cell--meta" data-label="Role">
                  <span className="dash-apps-table-muted d-md-none">Role · </span>
                  <span className="dash-apps-role-title">{job.title}</span>
                </div>
                <div className="dash-apps-table-cell dash-apps-table-cell--status text-md-end flex-shrink-0">
                  <span className={`dash-app-status dash-app-status--${job.status}`}>
                    {STATUS_LABELS[job.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
