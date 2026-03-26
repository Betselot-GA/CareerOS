import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Badge, Button, Card, Col, Form, Modal, OverlayTrigger, Popover, Row, Spinner } from "react-bootstrap";
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

type Job = {
  _id: string;
  company: string;
  title: string;
  location?: string;
  notes?: string;
  status: JobStatus;
  sortKey?: number;
};

type JobStatus = "wishlist" | "applied" | "interview" | "offer" | "rejected";

const ACTIVE_STATUSES: JobStatus[] = ["wishlist", "applied", "interview"];

const COLUMNS: { key: JobStatus; label: string }[] = [
  { key: "wishlist", label: "Wishlist" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" }
];

function statusLabel(status: JobStatus): string {
  return COLUMNS.find((c) => c.key === status)?.label ?? status;
}

function IconEdit() {
  return (
    <svg
      className="kanban-card-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

const CARD_CLICK_MOVE_PX = 10;

type KanbanJobCardProps = {
  job: Job;
  index: number;
  onOpenDetail: (job: Job) => void;
  onOpenEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
};

function KanbanJobCard({ job, index, onOpenDetail, onOpenEdit, onDelete }: KanbanJobCardProps) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <Draggable draggableId={job._id} index={index}>
      {(dragProvided) => (
        <Card
          className="kanban-card"
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          role="button"
          tabIndex={0}
          onPointerDown={(e) => {
            pointerStartRef.current = { x: e.clientX, y: e.clientY };
          }}
          onClick={(e) => {
            const start = pointerStartRef.current;
            if (!start) return;
            const moved =
              Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y);
            if (moved > CARD_CLICK_MOVE_PX) return;
            onOpenDetail(job);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDetail(job);
            }
          }}
        >
          <Card.Body className="p-2">
            <div className="kanban-card-inner">
              <div className="kanban-card-text">
                <div className="fw-semibold kanban-title">{job.title}</div>
                <div className="small text-muted">{job.company}</div>
                {job.location && <div className="small">{job.location}</div>}
                {job.notes && (
                  <OverlayTrigger
                    placement="auto"
                    overlay={
                      <Popover>
                        <Popover.Header as="h3">Notes</Popover.Header>
                        <Popover.Body>{job.notes}</Popover.Body>
                      </Popover>
                    }
                  >
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 mt-1 kanban-notes-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View notes
                    </Button>
                  </OverlayTrigger>
                )}
              </div>
              <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="button"
                  size="sm"
                  variant="outline-primary"
                  className="kanban-card-icon-btn"
                  onClick={() => onOpenEdit(job)}
                  aria-label="Edit application"
                  title="Edit"
                >
                  <IconEdit />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline-danger"
                  className="kanban-card-icon-btn"
                  onClick={() => {
                    void onDelete(job._id);
                  }}
                  aria-label="Delete application"
                  title="Delete"
                >
                  <IconTrash />
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </Draggable>
  );
}

function IconTrash() {
  return (
    <svg
      className="kanban-card-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function KanbanPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [me, setMe] = useState<MeResponse["data"] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [query, setQuery] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meResponse, jobsResponse] = await Promise.all([
          api.get<MeResponse>("/api/v1/auth/me"),
          api.get<{ data: Job[] }>("/api/v1/jobs")
        ]);
        setMe(meResponse.data);
        setJobs(jobsResponse.data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Could not load data");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const onCreateJob = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post<{ data: Job }>(
        "/api/v1/jobs",
        {
          company: newCompany,
          title: newTitle,
          location: newLocation || undefined,
          notes: newNotes || undefined
        },
        true
      );
      setJobs((prev) => [response.data, ...prev]);
      setNewCompany("");
      setNewTitle("");
      setNewLocation("");
      setNewNotes("");
      setActionError("");
    } catch (createError) {
      setActionError(createError instanceof Error ? createError.message : "Could not create job");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout", {}, true);
    } finally {
      clearAccessToken();
      navigate("/login");
    }
  };

  const moveJob = async (jobId: string, status: JobStatus, sortKey?: number) => {
    await api.patch<{ data: Job }>(`/api/v1/jobs/${jobId}/status`, { status, sortKey });
    setJobs((prev) =>
      prev.map((job) =>
        job._id === jobId ? { ...job, status, sortKey: sortKey ?? Date.now() } : job
      )
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      job.company.toLowerCase().includes(q) ||
      job.title.toLowerCase().includes(q) ||
      (job.location ?? "").toLowerCase().includes(q) ||
      (job.notes ?? "").toLowerCase().includes(q);
    return matchQuery;
  });

  const jobsByStatus = (status: JobStatus) =>
    filteredJobs
      .filter((job) => job.status === status)
      .sort((a, b) => (b.sortKey ?? 0) - (a.sortKey ?? 0));

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const destinationStatus = result.destination.droppableId as JobStatus;
    const jobId = result.draggableId;
    const existing = jobs.find((job) => job._id === jobId);
    if (!existing) return;
    try {
      const destinationJobs = jobsByStatus(destinationStatus);
      const destinationIndex = result.destination.index;
      const prev = destinationJobs[destinationIndex - 1];
      const next = destinationJobs[destinationIndex];
      const prevKey = typeof prev?.sortKey === "number" ? prev.sortKey : Date.now();
      const nextKey = typeof next?.sortKey === "number" ? next.sortKey : prevKey - 10;
      const sortKey =
        typeof prev?.sortKey === "number" && typeof next?.sortKey === "number"
          ? (prevKey + nextKey) / 2
          : Date.now();

      await moveJob(jobId, destinationStatus, sortKey);
    } catch (dragError) {
      setActionError(dragError instanceof Error ? dragError.message : "Could not move job");
    }
  };

  const onDeleteJob = async (jobId: string) => {
    try {
      await api.delete<{ success: boolean; message: string }>(`/api/v1/jobs/${jobId}`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "Could not delete job");
    }
  };

  const openDetailModal = (job: Job) => {
    setDetailJob(job);
  };

  const closeDetailModal = () => {
    setDetailJob(null);
  };

  const openEditModal = (job: Job) => {
    setDetailJob(null);
    setEditingJob(job);
    setEditCompany(job.company);
    setEditTitle(job.title);
    setEditLocation(job.location ?? "");
    setEditNotes(job.notes ?? "");
  };

  const closeEditModal = () => {
    setEditingJob(null);
  };

  const saveEdit = async () => {
    if (!editingJob) return;
    try {
      const response = await api.patch<{ data: Job }>(`/api/v1/jobs/${editingJob._id}`, {
        company: editCompany,
        title: editTitle,
        location: editLocation || undefined,
        notes: editNotes || undefined
      });
      setJobs((prev) => prev.map((j) => (j._id === editingJob._id ? response.data : j)));
      closeEditModal();
    } catch (editError) {
      setActionError(editError instanceof Error ? editError.message : "Could not update job");
    }
  };

  const activeCount = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status)).length;
  const isUnlimited = me?.role === "pro" || me?.role === "admin";

  if (loading)
    return (
      <div className="dash-root dash-root--loading">
        <Spinner animation="border" />
      </div>
    );
  if (loadError)
    return (
      <div className="dash-root dash-root--loading text-danger px-3 text-center">
        {loadError}
      </div>
    );

  if (!me) return null;

  return (
    <>
      <DashboardShell
        title="Applications"
        breadcrumb="Career / Applications"
        userName={me.name}
        userEmail={me.email}
        role={me.role}
        onLogout={() => void logout()}
        searchValue={query}
        onSearchChange={setQuery}
        hideRail
      >
        <div className="dash-page-kanban">
          {actionError && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {actionError}
            </div>
          )}
          <Card className="dash-surface-card border-0 applications-card mb-4" id="applications">
            <Card.Body className="overflow-visible">
              <h4 className="mb-3">Applications</h4>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="text-muted">
                  Active apps:{" "}
                  <strong className={activeCount >= 10 && !isUnlimited ? "text-danger" : undefined}>
                    {activeCount}
                  </strong>
                  {isUnlimited ? (
                    <Badge bg="success" className="ms-2">
                      Unlimited
                    </Badge>
                  ) : (
                    <span className="ms-1">/ 10 (FREE)</span>
                  )}
                </div>
                {!isUnlimited && activeCount >= 10 && (
                  <Badge bg="warning" text="dark">
                    You hit the FREE active limit — move items to Offer/Rejected or upgrade to PRO
                  </Badge>
                )}
              </div>
              <h5 className="mb-3">Add application</h5>
              <Form onSubmit={onCreateJob} className="add-application-form">
                <Row className="g-3 align-items-end">
                  <Col xs={12} sm={6} lg={3}>
                    <Form.Label className="small text-muted mb-1">Company</Form.Label>
                    <Form.Control
                      placeholder="Acme Inc."
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <Form.Label className="small text-muted mb-1">Job title</Form.Label>
                    <Form.Control
                      placeholder="Software Engineer"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={2}>
                    <Form.Label className="small text-muted mb-1">Location</Form.Label>
                    <Form.Control
                      placeholder="Remote, NYC…"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={2}>
                    <Form.Label className="small text-muted mb-1">Notes</Form.Label>
                    <Form.Control
                      placeholder="Optional"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={2}>
                    <Button type="submit" className="add-application-submit w-100 text-nowrap">
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <section id="kanban">
            <h4 className="mb-3 text-uppercase small fw-bold text-muted letter-spacing-wide">Application Kanban</h4>
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="kanban-board">
                {COLUMNS.map((column) => (
                  <div key={column.key} className="kanban-column">
                    <Card className="kanban-column-card dash-surface-card border-0 h-100">
                      <Card.Body className="d-flex flex-column p-3">
                        <div className="kanban-col-header d-flex justify-content-between align-items-center gap-2">
                          <span className={`kanban-col-title kanban-col-title--${column.key}`}>{column.label}</span>
                          <span className="kanban-count" aria-label={`${column.label} count`}>
                            {jobsByStatus(column.key).length}
                          </span>
                        </div>
                        <Droppable droppableId={column.key}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="kanban-col flex-grow-1"
                            >
                              {jobsByStatus(column.key).map((job, index) => (
                                <KanbanJobCard
                                  key={job._id}
                                  job={job}
                                  index={index}
                                  onOpenDetail={openDetailModal}
                                  onOpenEdit={openEditModal}
                                  onDelete={onDeleteJob}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </section>
        </div>
      </DashboardShell>

      <Modal show={!!detailJob} onHide={closeDetailModal} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="h5 mb-0">{detailJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailJob && (
            <>
              <div className="mb-3">
                <div className="small text-muted mb-1">Status</div>
                <span className={`kanban-col-title kanban-col-title--${detailJob.status}`}>
                  {statusLabel(detailJob.status)}
                </span>
              </div>
              <div className="mb-3">
                <div className="small text-muted mb-1">Company</div>
                <div>{detailJob.company}</div>
              </div>
              {detailJob.location && (
                <div className="mb-3">
                  <div className="small text-muted mb-1">Location</div>
                  <div>{detailJob.location}</div>
                </div>
              )}
              <div>
                <div className="small text-muted mb-1">Description and notes</div>
                <div className="kanban-detail-notes text-break">
                  {detailJob.notes?.trim() ? detailJob.notes : "No notes or description added yet."}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="gap-2">
          <Button variant="outline-secondary" onClick={closeDetailModal}>
            Close
          </Button>
          {detailJob && (
            <Button
              onClick={() => {
                openEditModal(detailJob);
              }}
            >
              Edit
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={!!editingJob} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button onClick={() => void saveEdit()}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default KanbanPage;
