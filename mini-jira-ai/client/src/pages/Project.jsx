import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [commentsByTask, setCommentsByTask] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState("");
  const [loadingTaskId, setLoadingTaskId] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data.project);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    }
  }, [id]);

  const fetchComments = useCallback(async (taskId) => {
    try {
      const { data } = await API.get(`/tasks/${taskId}/comments`);
      setCommentsByTask((prev) => ({
        ...prev,
        [taskId]: data.comments || [],
      }));
    } catch {
      setCommentsByTask((prev) => ({
        ...prev,
        [taskId]: [],
      }));
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await API.get(`/tasks/project/${id}`);
      const loadedTasks = data.tasks || [];
      setTasks(loadedTasks);

      for (const task of loadedTasks) {
        fetchComments(task.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    }
  }, [fetchComments, id]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchProject();
    fetchTasks();
  }, [fetchProject, fetchTasks, navigate]);

  const groupedTasks = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      in_progress: tasks.filter((task) => task.status === "in_progress"),
      done: tasks.filter((task) => task.status === "done"),
    };
  }, [tasks]);

  const handleChange = (e) => {
    setTaskForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/tasks", {
        ...taskForm,
        projectId: id,
      });

      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
      });

      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (loadingTaskId) return;

    try {
      setLoadingTaskId(taskId);
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setCommentsByTask((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoadingTaskId(taskId);
      await API.patch(`/tasks/${taskId}`, {
        status: newStatus,
      });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleCommentInputChange = (taskId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleAddComment = async (taskId) => {
    const content = commentInputs[taskId]?.trim();

    if (!content) return;

    try {
      setLoadingTaskId(taskId);
      await API.post(`/tasks/${taskId}/comments`, { content });
      setCommentInputs((prev) => ({
        ...prev,
        [taskId]: "",
      }));
      fetchComments(taskId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const renderTaskCard = (task) => (
    <div key={task.id} style={styles.taskCard}>
      <div style={styles.taskTop}>
        <h3 style={styles.taskTitle}>{task.title}</h3>
        <span style={priorityBadge(task.priority)}>{task.priority}</span>
      </div>

      <p style={styles.taskDescription}>{task.description || "No description"}</p>

      <div style={styles.taskMeta}>
        <span>Status: {task.status}</span>
      </div>

      <div style={styles.actions}>
        <select
          style={styles.smallInput}
          value={task.status}
          disabled={loadingTaskId === task.id}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
        >
          <option value="todo">todo</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
        </select>

        <button
          type="button"
          style={styles.deleteButton}
          disabled={loadingTaskId === task.id}
          onClick={() => handleDeleteTask(task.id)}
        >
          {loadingTaskId === task.id ? "Loading..." : "Delete"}
        </button>
      </div>

      <div style={styles.commentSection}>
        <h4 style={styles.commentTitle}>Comments</h4>

        <div style={styles.commentList}>
          {(commentsByTask[task.id] || []).map((comment) => (
            <div key={comment.id} style={styles.commentItem}>
              <strong>{comment.author?.name || "User"}:</strong> {comment.content}
            </div>
          ))}
        </div>

        <div style={styles.commentForm}>
          <input
            style={styles.commentInput}
            type="text"
            placeholder="Write a comment..."
            value={commentInputs[task.id] || ""}
            onChange={(e) => handleCommentInputChange(task.id, e.target.value)}
          />
          <button
            type="button"
            style={styles.commentButton}
            disabled={loadingTaskId === task.id}
            onClick={() => handleAddComment(task.id)}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
      </div>

      {project && (
        <div style={styles.projectCard}>
          <h1 style={styles.projectTitle}>{project.title}</h1>
          <p style={styles.projectDescription}>{project.description || "No description"}</p>
        </div>
      )}

      <form onSubmit={handleCreateTask} style={styles.form}>
        <h2 style={styles.sectionTitle}>Create Task</h2>

        <input
          style={styles.input}
          type="text"
          name="title"
          placeholder="Task title"
          value={taskForm.title}
          onChange={handleChange}
        />

        <textarea
          style={styles.textarea}
          name="description"
          placeholder="Task description"
          value={taskForm.description}
          onChange={handleChange}
        />

        <div style={styles.formRow}>
          <select
            style={styles.input}
            name="priority"
            value={taskForm.priority}
            onChange={handleChange}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>

          <select
            style={styles.input}
            name="status"
            value={taskForm.status}
            onChange={handleChange}
          >
            <option value="todo">todo</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
        </div>

        <button style={styles.button} type="submit">
          Create Task
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.board}>
        <div style={styles.column}>
          <div style={styles.columnHeader}>
            <h2 style={styles.columnTitle}>TODO</h2>
            <span style={styles.count}>{groupedTasks.todo.length}</span>
          </div>
          <div style={styles.columnBody}>{groupedTasks.todo.map(renderTaskCard)}</div>
        </div>

        <div style={styles.column}>
          <div style={styles.columnHeader}>
            <h2 style={styles.columnTitle}>IN PROGRESS</h2>
            <span style={styles.count}>{groupedTasks.in_progress.length}</span>
          </div>
          <div style={styles.columnBody}>{groupedTasks.in_progress.map(renderTaskCard)}</div>
        </div>

        <div style={styles.column}>
          <div style={styles.columnHeader}>
            <h2 style={styles.columnTitle}>DONE</h2>
            <span style={styles.count}>{groupedTasks.done.length}</span>
          </div>
          <div style={styles.columnBody}>{groupedTasks.done.map(renderTaskCard)}</div>
        </div>
      </div>
    </div>
  );
}

const priorityBadge = (priority) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  background:
    priority === "high"
      ? "#7f1d1d"
      : priority === "medium"
      ? "#78350f"
      : "#1e3a8a",
  color: "#fff",
});

const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: "32px",
    background: "#0f172a",
    color: "#fff",
  },
  topBar: {
    marginBottom: "20px",
  },
  backButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#334155",
    color: "#fff",
    cursor: "pointer",
  },
  projectCard: {
    background: "#1e293b",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
    border: "1px solid #334155",
  },
  projectTitle: {
    margin: "0 0 8px 0",
  },
  projectDescription: {
    margin: 0,
    color: "#cbd5e1",
  },
  form: {
    display: "grid",
    gap: "12px",
    marginBottom: "32px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #334155",
  },
  sectionTitle: {
    margin: 0,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
  },
  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    minHeight: "100px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    alignItems: "start",
  },
  column: {
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "16px",
    minHeight: "400px",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  columnTitle: {
    margin: 0,
    fontSize: "18px",
  },
  count: {
    background: "#334155",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
  },
  columnBody: {
    display: "grid",
    gap: "12px",
  },
  taskCard: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #334155",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "10px",
  },
  taskTitle: {
    margin: 0,
    fontSize: "16px",
  },
  taskDescription: {
    margin: "0 0 12px 0",
    color: "#cbd5e1",
  },
  taskMeta: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  actions: {
    display: "grid",
    gap: "10px",
    marginBottom: "14px",
  },
  smallInput: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
  },
  deleteButton: {
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
  commentSection: {
    borderTop: "1px solid #334155",
    paddingTop: "12px",
  },
  commentTitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
  },
  commentList: {
    display: "grid",
    gap: "8px",
    marginBottom: "10px",
  },
  commentItem: {
    background: "#0f172a",
    padding: "8px 10px",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
  commentForm: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px",
  },
  commentInput: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
  },
  commentButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    marginBottom: "16px",
  },
};

export default Project;
