import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

const STATUSES = ["todo", "in_progress", "done"];

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [commentsByTask, setCommentsByTask] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState("");
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
  });
  const [projectActionError, setProjectActionError] = useState("");
  const [projectActionLoading, setProjectActionLoading] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    assigneeId: "",
    dueDate: "",
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
        assigneeId: "",
        dueDate: "",
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

  const requestDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  const cancelDeleteTask = () => {
    setTaskToDelete(null);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    await handleDeleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const openEditProject = () => {
    if (!project) return;

    setProjectActionError("");
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
    });
    setEditingProject(true);
  };

  const closeEditProject = () => {
    setEditingProject(false);
    setProjectActionError("");
  };

  const handleProjectFormChange = (e) => {
    setProjectForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!projectForm.title.trim()) {
      setProjectActionError("Project title is required");
      return;
    }

    setProjectActionError("");
    setProjectActionLoading(true);

    try {
      const { data } = await API.patch(`/projects/${id}`, {
        title: projectForm.title,
        description: projectForm.description,
      });
      setProject(data.project);
      closeEditProject();
    } catch (err) {
      setProjectActionError(err.response?.data?.message || "Failed to update project");
    } finally {
      setProjectActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setProjectActionError("");
    setProjectActionLoading(true);

    try {
      await API.delete(`/projects/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setProjectActionError(err.response?.data?.message || "Failed to delete project");
      setProjectActionLoading(false);
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setEditError("");
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      assigneeId: task.assignee?.id || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  };

  const closeEditTask = () => {
    setEditingTask(null);
    setEditError("");
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (!editingTask) return;

    if (!editForm.title.trim()) {
      setEditError("Task title is required");
      return;
    }

    setEditError("");
    setEditLoading(true);

    try {
      await API.patch(`/tasks/${editingTask.id}`, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        assigneeId: editForm.assigneeId,
        dueDate: editForm.dueDate,
      });

      closeEditTask();
      fetchTasks();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update task");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || !STATUSES.includes(over.id)) return;

    const task = tasks.find((item) => item.id === active.id);

    if (!task || task.status === over.id) return;

    handleStatusChange(task.id, over.id);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const email = memberEmail.trim();

    if (!email) return;

    setMemberMessage("");
    setMemberError("");
    setMemberLoading(true);

    try {
      await API.post(`/projects/${id}/members`, { email });
      setMemberEmail("");
      setMemberMessage("Member added successfully");
      fetchProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setMemberLoading(false);
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
    <DraggableTaskCard
      key={task.id}
      task={task}
      comments={commentsByTask[task.id] || []}
      commentValue={commentInputs[task.id] || ""}
      loadingTaskId={loadingTaskId}
      onEdit={openEditTask}
      onDelete={requestDeleteTask}
      onCommentChange={handleCommentInputChange}
      onAddComment={handleAddComment}
    />
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
          &larr; Back
        </button>
      </div>

      {project && (
        <div style={styles.projectCard}>
          <div style={styles.projectHeader}>
            <div>
              <h1 style={styles.projectTitle}>{project.title}</h1>
              <p style={styles.projectDescription}>{project.description || "No description"}</p>
            </div>

            <div style={styles.projectActions}>
              <button type="button" style={styles.secondaryButton} onClick={openEditProject}>
                Edit Project
              </button>
              <button
                type="button"
                style={styles.deleteButton}
                onClick={() => setConfirmDeleteProject(true)}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {project && (
        <section style={styles.membersSection}>
          <div style={styles.membersHeader}>
            <h2 style={styles.sectionTitle}>Project Members</h2>
            <span style={styles.count}>{project.members?.length || 0}</span>
          </div>

          <div style={styles.membersList}>
            {(project.members || []).map((member) => (
              <div key={member.id} style={styles.memberCard}>
                <div>
                  <p style={styles.memberName}>{member.user?.name || "Unknown user"}</p>
                  <p style={styles.memberEmail}>{member.user?.email || "No email"}</p>
                </div>
                <span style={styles.memberRole}>{member.role}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddMember} style={styles.memberForm}>
            <input
              style={styles.input}
              type="email"
              placeholder="Invite member by email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <button style={styles.button} type="submit" disabled={memberLoading}>
              {memberLoading ? "Adding..." : "Add Member"}
            </button>
          </form>

          {memberMessage && <p style={styles.success}>{memberMessage}</p>}
          {memberError && <p style={styles.error}>{memberError}</p>}
        </section>
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

        <div style={styles.formRow}>
          <select
            style={styles.input}
            name="assigneeId"
            value={taskForm.assigneeId}
            onChange={handleChange}
          >
            <option value="">Unassigned</option>
            {(project?.members || []).map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user?.name || member.user?.email || "Unknown user"}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="date"
            name="dueDate"
            value={taskForm.dueDate}
            onChange={handleChange}
          />
        </div>

        <button style={styles.button} type="submit">
          Create Task
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      <DndContext onDragEnd={handleDragEnd}>
        <div style={styles.board}>
          <DroppableColumn
            id="todo"
            title="TODO"
            tasks={groupedTasks.todo}
            renderTaskCard={renderTaskCard}
          />

          <DroppableColumn
            id="in_progress"
            title="IN PROGRESS"
            tasks={groupedTasks.in_progress}
            renderTaskCard={renderTaskCard}
          />

          <DroppableColumn
            id="done"
            title="DONE"
            tasks={groupedTasks.done}
            renderTaskCard={renderTaskCard}
          />
        </div>
      </DndContext>

      {editingTask && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleUpdateTask} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Edit Task</h2>
              <button type="button" style={styles.secondaryButton} onClick={closeEditTask}>
                Close
              </button>
            </div>

            <input
              style={styles.input}
              type="text"
              name="title"
              placeholder="Task title"
              value={editForm.title}
              onChange={handleEditChange}
            />

            <textarea
              style={styles.textarea}
              name="description"
              placeholder="Task description"
              value={editForm.description}
              onChange={handleEditChange}
            />

            <div style={styles.formRow}>
              <select
                style={styles.input}
                name="priority"
                value={editForm.priority}
                onChange={handleEditChange}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>

              <select
                style={styles.input}
                name="assigneeId"
                value={editForm.assigneeId}
                onChange={handleEditChange}
              >
                <option value="">Unassigned</option>
                {(project?.members || []).map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user?.name || member.user?.email || "Unknown user"}
                  </option>
                ))}
              </select>
            </div>

            <input
              style={styles.input}
              type="date"
              name="dueDate"
              value={editForm.dueDate}
              onChange={handleEditChange}
            />

            {editError && <p style={styles.error}>{editError}</p>}

            <button style={styles.button} type="submit" disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {editingProject && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleUpdateProject} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Edit Project</h2>
              <button type="button" style={styles.secondaryButton} onClick={closeEditProject}>
                Close
              </button>
            </div>

            <input
              style={styles.input}
              type="text"
              name="title"
              placeholder="Project title"
              value={projectForm.title}
              onChange={handleProjectFormChange}
            />

            <textarea
              style={styles.textarea}
              name="description"
              placeholder="Project description"
              value={projectForm.description}
              onChange={handleProjectFormChange}
            />

            {projectActionError && <p style={styles.error}>{projectActionError}</p>}

            <button style={styles.button} type="submit" disabled={projectActionLoading}>
              {projectActionLoading ? "Saving..." : "Save Project"}
            </button>
          </form>
        </div>
      )}

      {confirmDeleteProject && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.sectionTitle}>Delete Project</h2>
            <p style={styles.modalText}>
              This will permanently delete the project, its tasks, and comments.
            </p>

            {projectActionError && <p style={styles.error}>{projectActionError}</p>}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                disabled={projectActionLoading}
                onClick={() => setConfirmDeleteProject(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={styles.deleteButton}
                disabled={projectActionLoading}
                onClick={handleDeleteProject}
              >
                {projectActionLoading ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.sectionTitle}>Delete Task</h2>
            <p style={styles.modalText}>
              Are you sure you want to delete "{taskToDelete.title}"?
            </p>

            <div style={styles.modalActions}>
              <button type="button" style={styles.secondaryButton} onClick={cancelDeleteTask}>
                Cancel
              </button>
              <button
                type="button"
                style={styles.deleteButton}
                disabled={loadingTaskId === taskToDelete.id}
                onClick={confirmDeleteTask}
              >
                {loadingTaskId === taskToDelete.id ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DroppableColumn({ id, title, tasks, renderTaskCard }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} style={styles.column}>
      <div style={styles.columnHeader}>
        <h2 style={styles.columnTitle}>{title}</h2>
        <span style={styles.count}>{tasks.length}</span>
      </div>
      <div style={styles.columnBody}>{tasks.map(renderTaskCard)}</div>
      {tasks.length === 0 && <div style={styles.emptyColumn}>Drop tasks here</div>}
    </div>
  );
}

function DraggableTaskCard({
  task,
  comments,
  commentValue,
  loadingTaskId,
  onEdit,
  onDelete,
  onCommentChange,
  onAddComment,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const dragStyle = {
    ...styles.taskCard,
    opacity: isDragging ? 0.6 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div ref={setNodeRef} style={dragStyle}>
      <div style={styles.dragHandle} {...listeners} {...attributes}>
        &#8942;&#8942; Drag
      </div>

      <div style={styles.taskTop}>
        <h3 style={styles.taskTitle}>{task.title}</h3>
      </div>

      <p style={styles.taskDescription}>{task.description || "No description"}</p>

      <div style={styles.taskMeta}>
        <span style={statusBadge(task.status)}>{task.status}</span>
        <span style={priorityBadge(task.priority)}>{task.priority}</span>
      </div>

      {(task.assignee || task.dueDate) && (
        <div style={styles.taskDetails}>
          {task.assignee && (
            <span style={styles.detailPill}>@ {task.assignee.name || task.assignee.email}</span>
          )}

          {task.dueDate && (
            <span style={styles.detailPill}>Due {formatDueDate(task.dueDate)}</span>
          )}
        </div>
      )}

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.secondaryButton}
          disabled={loadingTaskId === task.id}
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          type="button"
          style={styles.deleteButton}
          disabled={loadingTaskId === task.id}
          onClick={() => onDelete(task)}
        >
          {loadingTaskId === task.id ? "Loading..." : "Delete"}
        </button>
      </div>

      <div style={styles.commentSection}>
        <h4 style={styles.commentTitle}>Comments</h4>

        <div style={styles.commentList}>
          {comments.map((comment) => (
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
            value={commentValue}
            onChange={(e) => onCommentChange(task.id, e.target.value)}
          />
          <button
            type="button"
            style={styles.commentButton}
            disabled={loadingTaskId === task.id}
            onClick={() => onAddComment(task.id)}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const priorityBadge = (priority) => ({
  display: "inline-block",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  border:
    priority === "high"
      ? "1px solid rgba(248, 113, 113, 0.35)"
      : priority === "medium"
      ? "1px solid rgba(251, 191, 36, 0.35)"
      : "1px solid rgba(56, 189, 248, 0.35)",
  background:
    priority === "high"
      ? "rgba(248, 113, 113, 0.12)"
      : priority === "medium"
      ? "rgba(251, 191, 36, 0.12)"
      : "rgba(56, 189, 248, 0.12)",
  color:
    priority === "high"
      ? "#fca5a5"
      : priority === "medium"
      ? "#fcd34d"
      : "#7dd3fc",
});

const statusBadge = (status) => ({
  display: "inline-block",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  border:
    status === "done"
      ? "1px solid rgba(134, 239, 172, 0.35)"
      : status === "in_progress"
      ? "1px solid rgba(251, 191, 36, 0.35)"
      : "1px solid rgba(56, 189, 248, 0.35)",
  background:
    status === "done"
      ? "rgba(34, 197, 94, 0.12)"
      : status === "in_progress"
      ? "rgba(251, 191, 36, 0.12)"
      : "rgba(56, 189, 248, 0.12)",
  color:
    status === "done"
      ? "#86efac"
      : status === "in_progress"
      ? "#fcd34d"
      : "#7dd3fc",
});

const formatDueDate = (dueDate) => {
  return new Date(dueDate).toLocaleDateString();
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "1480px",
    margin: "0 auto",
    padding: "28px 40px 40px",
    background: "transparent",
    color: "var(--text-h)",
    boxSizing: "border-box",
  },
  topBar: {
    marginBottom: "16px",
  },
  backButton: {
    padding: "9px 14px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "rgba(15, 23, 42, 0.86)",
    color: "var(--text-h)",
    cursor: "pointer",
  },
  projectCard: {
    background: "linear-gradient(135deg, rgba(16, 24, 39, 0.96), rgba(11, 18, 32, 0.96))",
    padding: "22px",
    borderRadius: "var(--radius)",
    marginBottom: "20px",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-card)",
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  projectActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  projectTitle: {
    margin: "0 0 8px 0",
    fontSize: "34px",
    lineHeight: 1.08,
  },
  projectDescription: {
    margin: 0,
    color: "var(--text)",
  },
  membersSection: {
    background: "rgba(16, 24, 39, 0.92)",
    padding: "18px",
    borderRadius: "var(--radius)",
    marginBottom: "20px",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-soft)",
  },
  membersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  membersList: {
    display: "grid",
    gap: "10px",
    marginBottom: "16px",
  },
  memberCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    background: "var(--surface-2)",
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
  },
  memberName: {
    margin: 0,
    color: "var(--text-h)",
    fontWeight: "600",
  },
  memberEmail: {
    margin: "4px 0 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  memberRole: {
    padding: "4px 10px",
    borderRadius: "999px",
    background: "var(--accent-bg)",
    border: "1px solid var(--accent-border)",
    color: "#7dd3fc",
    fontSize: "12px",
    fontWeight: "600",
  },
  memberForm: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px",
  },
  form: {
    display: "grid",
    gap: "12px",
    marginBottom: "24px",
    background: "rgba(16, 24, 39, 0.92)",
    padding: "18px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-soft)",
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
    padding: "11px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-2)",
    color: "var(--text-h)",
  },
  textarea: {
    padding: "11px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-2)",
    color: "var(--text-h)",
    minHeight: "90px",
    resize: "vertical",
  },
  button: {
    padding: "11px 14px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "linear-gradient(135deg, #0284c7, #2563eb)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "rgba(30, 41, 59, 0.72)",
    color: "var(--text-h)",
    cursor: "pointer",
    fontSize: "13px",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px",
    alignItems: "start",
  },
  column: {
    background: "rgba(11, 18, 32, 0.9)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "14px",
    minHeight: "270px",
    boxShadow: "var(--shadow-soft)",
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
    background: "var(--accent-bg)",
    border: "1px solid var(--accent-border)",
    color: "#7dd3fc",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "700",
  },
  columnBody: {
    display: "grid",
    gap: "9px",
  },
  emptyColumn: {
    marginTop: "10px",
    padding: "18px 10px",
    border: "1px dashed rgba(148, 163, 184, 0.28)",
    borderRadius: "var(--radius-sm)",
    color: "#64748b",
    fontSize: "13px",
    textAlign: "center",
    background: "rgba(15, 23, 42, 0.42)",
  },
  taskCard: {
    background: "linear-gradient(180deg, rgba(16, 24, 39, 0.98), rgba(11, 18, 32, 0.98))",
    padding: "10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "6px",
  },
  dragHandle: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    marginBottom: "6px",
    padding: "3px 7px",
    borderRadius: "999px",
    background: "rgba(56, 189, 248, 0.08)",
    border: "1px solid rgba(56, 189, 248, 0.18)",
    color: "#94a3b8",
    cursor: "grab",
    fontSize: "12px",
    fontWeight: "600",
    lineHeight: 1,
    touchAction: "none",
  },
  taskTitle: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.25,
  },
  taskDescription: {
    margin: "0 0 7px 0",
    color: "var(--text)",
    fontSize: "13px",
    lineHeight: 1.35,
  },
  taskMeta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  taskDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "8px",
    color: "var(--text)",
  },
  detailLabel: {
    display: "block",
    marginBottom: "2px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
  },
  detailText: {
    margin: 0,
    fontSize: "13px",
  },
  detailPill: {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
    padding: "3px 7px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#cbd5e1",
    fontSize: "12px",
    lineHeight: 1.25,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    marginBottom: "8px",
  },
  smallInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#fff",
  },
  deleteButton: {
    padding: "7px 10px",
    border: "1px solid var(--danger-border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--danger-bg)",
    color: "#fecaca",
    cursor: "pointer",
    fontSize: "13px",
  },
  commentSection: {
    borderTop: "1px solid var(--border-strong)",
    paddingTop: "8px",
  },
  commentTitle: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    color: "#94a3b8",
  },
  commentList: {
    display: "grid",
    gap: "6px",
    marginBottom: "8px",
  },
  commentItem: {
    background: "var(--surface-2)",
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    color: "var(--text)",
  },
  commentForm: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px",
  },
  commentInput: {
    padding: "8px 10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-2)",
    color: "var(--text-h)",
  },
  commentButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "var(--accent-strong)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  error: {
    color: "var(--danger)",
    marginBottom: "16px",
  },
  success: {
    color: "var(--success)",
    marginBottom: "16px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(2, 6, 23, 0.82)",
    backdropFilter: "blur(12px)",
    zIndex: 20,
  },
  modal: {
    width: "100%",
    maxWidth: "540px",
    display: "grid",
    gap: "12px",
    background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius)",
    padding: "18px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.48)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  modalText: {
    margin: 0,
    color: "#cbd5e1",
  },
  modalActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
};

export default Project;
