import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/register", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <p style={styles.text}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    background: "transparent",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
    padding: "32px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.32)",
  },
  title: {
    marginBottom: "24px",
    textAlign: "center",
    color: "var(--text-h)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
  error: {
    color: "var(--danger)",
    margin: 0,
  },
  text: {
    marginTop: "16px",
    color: "var(--text)",
    textAlign: "center",
  },
};

export default Register;
