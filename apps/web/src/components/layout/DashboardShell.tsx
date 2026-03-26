import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext";

type DashboardShellProps = {
  title?: string;
  breadcrumb?: string;
  userName: string;
  userEmail: string;
  role: string;
  onLogout: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** When true, the Activity/Tips column is hidden so main content can use full width (e.g. Kanban). */
  hideRail?: boolean;
  /** Rendered below `children` but still in the main column (same width as main, beside the rail). */
  contentAfter?: ReactNode;
  children: ReactNode;
};

function DashboardShell({
  title = "Overview",
  breadcrumb = "Dashboards / Default",
  userName,
  userEmail,
  role,
  onLogout,
  searchValue,
  onSearchChange,
  hideRail = false,
  contentAfter,
  children
}: DashboardShellProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navClass = (path: string) =>
    location.pathname === path ? "dash-nav-link dash-nav-link--active" : "dash-nav-link";

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-brand-mark" aria-hidden>
            C
          </div>
          <span className="dash-brand-text">CareerOS</span>
        </div>

        <div className="dash-nav-section">
          <div className="dash-nav-label">Favorites</div>
          <Link className={navClass("/dashboard")} to="/dashboard">
            Overview
          </Link>
          <Link className={navClass("/applications")} to="/applications">
            Applications
          </Link>
        </div>

        <div className="dash-nav-section">
          <div className="dash-nav-label">Career</div>
          <Link className={navClass("/onboarding")} to="/onboarding">
            Onboarding
          </Link>
        </div>

        <div className="dash-sidebar-footer">
          <div className="dash-user-pill">
            <div className="dash-avatar">{userName.slice(0, 1).toUpperCase()}</div>
            <div className="dash-user-meta">
              <div className="dash-user-name">{userName}</div>
              <div className="dash-user-email">{userEmail}</div>
              <span className="dash-user-role">{role}</span>
            </div>
          </div>
          <Button variant="outline-secondary" size="sm" className="w-100 mt-2" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </aside>

      <div className="dash-main-wrap">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-breadcrumb text-muted small">{breadcrumb}</span>
            <h1 className="dash-page-title mb-0">{title}</h1>
          </div>
          <div className="dash-topbar-center flex-grow-1">
            {onSearchChange !== undefined && searchValue !== undefined && (
              <InputGroup className="dash-search">
                <InputGroup.Text className="bg-transparent border-end-0">
                  <span className="dash-icon-search" aria-hidden>
                    ⌕
                  </span>
                </InputGroup.Text>
                <Form.Control
                  className="border-start-0"
                  placeholder="Search applications…"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </InputGroup>
            )}
          </div>
          <div className="dash-topbar-right">
            <Button
              variant="outline-secondary"
              size="sm"
              className="dash-theme-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀" : "☾"}
            </Button>
          </div>
        </header>

        <div className="dash-content-row">
          <div className="dash-main-column">
            <main className="dash-content">{children}</main>
            {contentAfter}
          </div>

          {!hideRail && (
            <aside className="dash-rail d-none d-xl-block">
              <div className="dash-rail-card">
                <div className="dash-rail-title">Activity</div>
                <ul className="dash-rail-list">
                  <li>Pipeline updated</li>
                  <li>Drag cards to change stage</li>
                  <li>Edit details from each card</li>
                </ul>
              </div>
              <div className="dash-rail-card">
                <div className="dash-rail-title">Tips</div>
                <p className="dash-rail-body mb-0">
                  FREE plan allows up to 10 active applications (Wishlist, Applied, Interview). Move
                  items to Offer or Rejected to free slots.
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardShell;
