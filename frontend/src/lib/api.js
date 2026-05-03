import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    return Promise.reject(new Error(message));
  }
);

function unwrap(promise) {
  return promise.then((response) => response.data.data ?? response.data);
}

export const authApi = {
  login: (payload) => unwrap(api.post("/auth/login", payload)),
  signup: (payload) => unwrap(api.post("/auth/signup", payload)),
  me: () => unwrap(api.get("/auth/me")),
  logout: () => unwrap(api.post("/auth/logout"))
};

export const dashboardApi = {
  overview: () => unwrap(api.get("/dashboard/overview"))
};

export const userApi = {
  list: () => unwrap(api.get("/users")),
  create: (payload) => unwrap(api.post("/users", payload)),
  update: (id, payload) => unwrap(api.put(`/users/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/users/${id}`)),
  removeMe: () => unwrap(api.delete("/users/me")),
  updateProfile: (payload) => unwrap(api.put("/users/me/profile", payload)),
  updatePreferences: (payload) => unwrap(api.put("/users/me/preferences", payload))
};

export const teamApi = {
  list: () => unwrap(api.get("/teams")),
  create: (payload) => unwrap(api.post("/teams", payload)),
  update: (id, payload) => unwrap(api.put(`/teams/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/teams/${id}`))
};

export const projectApi = {
  list: () => unwrap(api.get("/projects")),
  create: (payload) => unwrap(api.post("/projects", payload)),
  update: (id, payload) => unwrap(api.put(`/projects/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/projects/${id}`))
};

export const taskApi = {
  list: () => unwrap(api.get("/tasks")),
  create: (payload) => unwrap(api.post("/tasks", payload)),
  update: (id, payload) => unwrap(api.put(`/tasks/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/tasks/${id}`)),
  comment: (id, payload) => unwrap(api.post(`/tasks/${id}/comments`, payload))
};

export const eventApi = {
  list: () => unwrap(api.get("/events")),
  create: (payload) => unwrap(api.post("/events", payload)),
  update: (id, payload) => unwrap(api.put(`/events/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/events/${id}`))
};

export const fileApi = {
  list: () => unwrap(api.get("/files")),
  createFolder: (payload) => unwrap(api.post("/files/folders", payload)),
  upload: async (formData) => {
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data.data;
  },
  update: (id, payload) => unwrap(api.put(`/files/${id}`, payload)),
  comment: (id, payload) => unwrap(api.post(`/files/${id}/comments`, payload)),
  remove: (id) => unwrap(api.delete(`/files/${id}`)),
  downloadUrl: (id) => `${baseURL}/files/${id}/download`
};

export const reportApi = {
  summary: () => unwrap(api.get("/reports/summary"))
};

export const notificationApi = {
  list: () => unwrap(api.get("/notifications")),
  read: (id) => unwrap(api.put(`/notifications/${id}/read`))
};

export const workspaceApi = {
  get: () => unwrap(api.get("/workspace")),
  update: (payload) => unwrap(api.put("/workspace", payload))
};
