import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjects(data.projects || []);
    } catch {
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    API.get("/projects")
      .then(({ data }) => {
        setProjects(data.projects || []);
      })
      .catch(() => {
        setError("Failed to load projects");
      });
  }, [navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/projects", { title, description });
      setTitle("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <form onSubmit={handleCreateProject} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button style={styles.button} type="submit">
          Create Project
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.list}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={styles.card}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <h3>{project.title}</h3>
            <p>{project.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: "40px",
    background: "transparent",
    color: "var(--text-h)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  form: {
    display: "grid",
    gap: "12px",
    marginBottom: "28px",
    maxWidth: "680px",
    background: "rgba(16, 24, 39, 0.92)",
    padding: "20px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-soft)",
  },
  input: {
    padding: "12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-2)",
    color: "var(--text-h)",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "linear-gradient(135deg, #0284c7, #2563eb)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  logoutButton: {
    padding: "10px 16px",
    border: "1px solid var(--danger-border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--danger-bg)",
    color: "#fecaca",
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: "16px",
  },
  card: {
    background: "linear-gradient(180deg, rgba(16, 24, 39, 0.98), rgba(11, 18, 32, 0.98))",
    padding: "20px",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-soft)",
  },
  error: {
    color: "var(--danger)",
  },
};

export default Dashboard;
