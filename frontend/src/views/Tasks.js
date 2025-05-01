import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";
import { API_BASE_URL } from "../config.js";

// Function to sort tasks by priority
const sortByPriority = (tasks) => {
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };
  return tasks.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
};

function TaskManager() {
  const [columns, setColumns] = useState({
    Pending: [],
    "In Progress": [],
    Completed: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Low",
  });

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tasks`);
        const tasks = response.data;

        // Group tasks by their status
        const groupedTasks = {
          Pending: tasks.filter((task) => task.status === "Pending"),
          "In Progress": tasks.filter((task) => task.status === "In Progress"),
          Completed: tasks.filter((task) => task.status === "Completed"),
        };

        // Sort tasks by priority
        Object.keys(groupedTasks).forEach((column) => {
          groupedTasks[column] = sortByPriority(groupedTasks[column]);
        });

        setColumns(groupedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Handle drag and drop
  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const [movedTask] = sourceColumn.splice(source.index, 1);

    movedTask.status = destination.droppableId;
    destColumn.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    try {
      await axios.put(`${API_BASE_URL}/tasks/${movedTask.id}`, {
        status: movedTask.status,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Handle task deletion
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      const updatedColumns = { ...columns };
      Object.keys(updatedColumns).forEach((status) => {
        updatedColumns[status] = updatedColumns[status].filter(
          (task) => task.id !== taskId
        );
      });
      setColumns(updatedColumns);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle task edit click
  const handleEditClick = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
    });
    setShowModal(true);
  };

  // Handle saving the new or edited task
  const handleSaveTask = async () => {
    if (editingTask) {
      // Update existing task
      const updatedTask = { ...editingTask, ...newTask };
      try {
        await axios.put(
          `${API_BASE_URL}/tasks/${editingTask.id}`,
          updatedTask
        );

        // Update the state
        setColumns((prev) => {
          const updatedColumns = { ...prev };
          const taskList = updatedColumns[editingTask.status];
          const taskIndex = taskList.findIndex(
            (task) => task.id === editingTask.id
          );
          taskList[taskIndex] = updatedTask;

          return updatedColumns;
        });
        setEditingTask(null);
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      // Add new task
      const task = { ...newTask, status: "Pending" };

      try {
        const response = await axios.post(`${API_BASE_URL}/tasks`, task);
        setColumns((prev) => ({
          ...prev,
          Pending: [...prev.Pending, response.data],
        }));
      } catch (error) {
        console.error("Error adding new task:", error);
      }
    }

    setShowModal(false);
    setNewTask({ title: "", description: "", priority: "Low" });
  };

  // Calculate total tasks
  const totalTasks = Object.values(columns).reduce(
    (total, tasks) => total + tasks.length,
    0
  );

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {Object.entries(columns).map(([columnId, tasks]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    width: "30%",
                    minHeight: "500px",
                    border: "1px solid lightgray",
                    borderRadius: "5px",
                    padding: "10px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>
                      {columnId}: {tasks.length}/{totalTasks}
                    </h4>
                    {columnId === "Pending" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowModal(true)}
                      >
                        ➕
                      </button>
                    )}
                  </div>
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="task-item mb-3 p-2 border rounded bg-white"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h5 className="mb-1">{task.title}</h5>
                              <p className="text-muted mb-1">
                                {task.description}
                              </p>
                              <span
                                className={`badge ${
                                  task.priority === "High"
                                    ? "bg-danger"
                                    : task.priority === "Medium"
                                    ? "bg-warning"
                                    : "bg-secondary"
                                }`}
                              >
                                {task.priority} Priority
                              </span>
                            </div>
                            <Dropdown>
                              <Dropdown.Toggle
                                as="div"
                                className="text-secondary cursor-pointer"
                                style={{ fontSize: "1.5rem" }}
                              ></Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleEditClick(task)}
                                >
                                  Edit Task
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => deleteTask(task.id)}
                                >
                                  Delete Task
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modal for Adding/Editing Task */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTask ? "Edit Task" : "Add New Task"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, priority: e.target.value }))
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveTask}>
            {editingTask ? "Save Changes" : "Add Task"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TaskManager;
