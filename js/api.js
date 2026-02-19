(function () {
  const DEFAULT_API_BASE = "https://vite-gourmand-1.onrender.com/api";
  const STORAGE_KEY = "auth_session";

  function isValidApiBase(value) {
    if (!value || typeof value !== "string") return false;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_e) {
      return false;
    }
  }

  function computeAutoApiBase() {
    const host = window.location.hostname || "localhost";
    if (host !== "localhost" && host !== "127.0.0.1") return null;
    return `${window.location.protocol || "http:"}//${host}:3000/api`;
  }

  function getApiBase() {
    if (isValidApiBase(window.API_BASE_URL)) return window.API_BASE_URL;
    const stored = localStorage.getItem("api_base_url");
    if (isValidApiBase(stored)) return stored;
    const auto = computeAutoApiBase();
    if (isValidApiBase(auto)) return auto;
    return DEFAULT_API_BASE;
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (_e) {
      return null;
    }
  }

  function setSession(token, user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getToken() {
    const session = getSession();
    return session ? session.token : null;
  }

  function getUser() {
    const session = getSession();
    return session ? session.user : null;
  }

  function authHeaders(extra) {
    const token = getToken();
    const headers = Object.assign({}, extra || {});
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  function toQueryString(query) {
    const q = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      q.set(key, String(value));
    });
    return q.toString();
  }

  async function request(path, options) {
    const opts = Object.assign({ method: "GET", headers: {} }, options || {});
    const url = `${getApiBase()}${path}`;
    const response = await fetch(url, opts);
    let body = null;
    try {
      body = await response.json();
    } catch (_e) {
      body = null;
    }
    if (!response.ok) {
      const err = new Error((body && body.error) || `HTTP ${response.status}`);
      err.status = response.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  const Api = {
    getApiBase,
    getSession,
    setSession,
    clearSession,
    getToken,
    getUser,
    me: () => request("/me", { headers: authHeaders() }),
    updateMe: (payload) => request("/me", {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    register: (payload) => request("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
    login: (payload) => request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
    requestPasswordReset: (email) => request("/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    }),
    confirmPasswordReset: (payload) => request("/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
    menus: (query) => {
      const qs = toQueryString(query);
      const suffix = qs ? `?${qs}` : "";
      return request(`/menus${suffix}`);
    },
    menuById: (id) => request(`/menus/${id}`),
    createOrder: (payload) => request("/orders", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    listOrders: (query) => {
      const qs = toQueryString(query);
      const suffix = qs ? `?${qs}` : "";
      return request(`/orders${suffix}`, { headers: authHeaders() });
    },
    updateOrder: (id, payload) => request(`/orders/${id}`, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    getHours: () => request("/settings/hours"),
    updateHours: (payload) => request("/settings/hours", {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    sendContact: (payload) => request("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
    createReview: (payload) => request("/reviews", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    myReviews: () => request("/reviews/me", { headers: authHeaders() }),
    validatedReviews: () => request("/reviews/validated"),
    pendingReviews: () => request("/reviews/pending", { headers: authHeaders() }),
    validateReview: (id) => request(`/reviews/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ action: "validate" })
    }),
    rejectReview: (id) => request(`/reviews/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ action: "reject" })
    }),
    adminEmployees: () => request("/admin/employees", { headers: authHeaders() }),
    adminCreateEmployee: (payload) => request("/admin/employees", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    adminToggleEmployee: (id, disabled) => request(`/admin/employees/${id}/disable`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ disabled })
    }),
    statsOrdersByMenu: (query) => {
      const qs = toQueryString(query);
      const suffix = qs ? `?${qs}` : "";
      return request(`/stats/orders-by-menu${suffix}`, { headers: authHeaders() });
    },
    manageCreateMenu: (payload) => request("/manage/menus", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    manageUpdateMenu: (id, payload) => request(`/manage/menus/${id}`, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload)
    }),
    manageDeleteMenu: (id, options) => {
      const force = options && options.force ? "?force=1" : "";
      return request(`/manage/menus/${id}${force}`, {
      method: "DELETE",
      headers: authHeaders()
      });
    }
  };

  window.Api = Api;
})();
