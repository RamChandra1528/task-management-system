import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import AppShell from "./components/layout/AppShell.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ModalProvider } from "./context/ModalContext.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import FilesPage from "./pages/FilesPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import TasksBoardPage from "./pages/TasksBoardPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import { LoadingState } from "./components/ui.jsx";

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-shell p-6">
        <LoadingState label="Opening your workspace..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <AppShell />;
}

function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-shell p-6">
        <LoadingState label="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/app/overview" replace /> : children;
}

function AppRoutes() {
  const auth = useAuth();
  const rootRedirect = useMemo(
    () => (auth.isAuthenticated ? "/app/overview" : "/"),
    [auth.isAuthenticated]
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <SignupPage />
          </GuestOnly>
        }
      />
      <Route path="/app" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="board" element={<TasksBoardPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={rootRedirect} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <AppRoutes />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
