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
    padding: "32px",
    background: "#0f172a",
    color: "#fff",
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
    marginBottom: "24px",
    maxWidth: "500px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: "16px",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "14px",
    cursor: "pointer",
    border: "1px solid #334155",
  },
  error: {
    color: "#f87171",
  },
};

export default Dashboard;
