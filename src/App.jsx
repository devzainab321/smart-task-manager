
import { useState, useEffect } from "react";
import "./app.css";

function App() {
const playAlarm = () => {
  
const audioContext = window.alarmAudioContext;
if (!audioContext) return;


  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.frequency.value = 880;
  gain.gain.value = 0.15;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1);
};


 useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/firebase-messaging-sw.js")
      .catch((error) => console.log("Service Worker Error:", error));
  }
}, []);

const enableNotifications = async () => {
  if (!("Notification" in window)) {
    alert("Your browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();

  
  if (permission === "granted") {
  window.alarmAudioContext = new (
    window.AudioContext || window.webkitAudioContext
  )();

  await window.alarmAudioContext.resume();

  alert("Notifications enabled successfully!");
}
  
  else {
    alert("Please allow notifications in your browser.");
  }
};

  const [task, setTask] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [filter, setFilter] = useState("All");
  const [taskDate, setTaskDate] = useState("");
const [taskTime, setTaskTime] = useState("");const [priority, setPriority] = useState("Medium");



const [editId, setEditId] = useState(null);
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("myTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

const totalTasks = tasks.length;

const completedTasks = tasks.filter(
  (item) => item.completed
).length;

const pendingTasks = tasks.filter(
  (item) => !item.completed
).length;

const highPriorityTasks = tasks.filter(
  (item) => item.priority === "High"
).length;

const clearAllTasks = () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete all tasks?"
  );

  if (confirmDelete) {
    setTasks([]);
  }
};
  (() => {
    localStorage.setItem("myuseEffectTasks", JSON.stringify(tasks));
  }, [tasks]);useEffect(() => {
  const checkReminders = () => {
    const now = new Date();

    tasks.forEach((item) => {
      if (!item.date || !item.time || item.completed || item.reminderSent) {
        return;
      }

      const taskDateTime = new Date(`${item.date}T${item.time}`);

      if (now >= taskDateTime) {
        if (Notification.permission === "granted") {
          playAlarm();
          
        navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification("Task Reminder 🔔", {
    body: item.text,
    icon: "/favicon.svg",
    tag: String(item.id),
  });
});
          
        }

        setTasks((prevTasks) =>
          prevTasks.map((taskItem) =>
            taskItem.id === item.id
              ? { ...taskItem, reminderSent: true }
              : taskItem
          )
        );
      }
    });
  };

  const interval = setInterval(checkReminders, 10000);

  return () => clearInterval(interval);
}, [tasks]);


   const addTask = () => {
  if (task.trim() === "") {
    alert("Please enter a task!");
    return;
  }

  if (editId !== null) {
    setTasks(
      tasks.map((item) =>
        item.id === editId
          ? {
    ...item,
    text: task,
    date: taskDate,
    time: taskTime,
    priority: priority,

  }
          : item
      )
    );

    setEditId(null);
  } else {
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: task,
        date: taskDate,
        time: taskTime,
        priority: priority,
        completed: false,
      },
    ]);
  }

  setTask("");
  setTaskDate("");
  setTaskTime("");

};
 const editTask = (id) => {
  const selectedTask = tasks.find((item) => item.id === id);

  setTask(selectedTask.text);
  setEditId(id);
};
  const completeTask = (id) => {
    setTasks(
      tasks.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  return (
    <div className="container">
      <h1>Smart Task Manager</h1>
      <button
  className="clear-all-btn"
  onClick={clearAllTasks}
>
  Clear All Tasks
</button>

  <div className="dashboard">
  <div className="dashboard-card">
    <h3>Total Tasks</h3>
    <h2>{totalTasks}</h2>
  </div>

  <div className="dashboard-card">
    <h3>Completed</h3>
    <h2>{completedTasks}</h2>
  </div>

  <div className="dashboard-card">
    <h3>Pending</h3>
    <h2>{pendingTasks}</h2>
  </div>

  <div className="dashboard-card">
    <h3>High Priority</h3>
    <h2>{highPriorityTasks}</h2>
  </div>
</div><button className="notification-btn" onClick={enableNotifications}>
  🔔 Enable Notifications
</button>


      
      <div className="input-section">
        <select
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
>
  <option value="High">🔴 High</option>
  <option value="Medium">🟡 Medium</option>
  <option value="Low">🟢 Low</option>
</select>

<input
  type="date"
  value={taskDate}
  onChange={(e) => setTaskDate(e.target.value)}
/>

<input
  type="time"
  value={taskTime}
  onChange={(e) => setTaskTime(e.target.value)}
/>

        
        <input
          type="text"
          placeholder="Enter your task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
        />

        <button onClick={addTask}>Add Task</button>
      </div>
      <input
  type="text"
  placeholder="🔍 Search tasks..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
<div className="filter-buttons">
  <button onClick={() => setFilter("All")}>All</button>
  <button onClick={() => setFilter("Pending")}>Pending</button>
  <button onClick={() => setFilter("Completed")}>Completed</button>
</div>

      <ul>
  {tasks.length === 0 && (
    <p className="empty-message">
      No tasks yet. Add your first task! ✨
    </p>
  )}

        {tasks
  
.filter((item) => {
  const matchesSearch = item.text
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesFilter =
    filter === "All" ||
    (filter === "Pending" && !item.completed) ||
    (filter === "Completed" && item.completed);

  return matchesSearch && matchesFilter;
})

  .map((item) => (

          <li
  key={item.id}
  className={`task-card ${item.completed ? "completed-task" : ""}`}
>
            <span
              style={{
                textDecoration: item.completed
                  ? "line-through"
                  : "none",
              }}
            >
              {item.text}
              <br />
<small className={`priority ${item.priority || "Medium"}`}>
  Priority: {item.priority || "Medium"}
</small>
              <br />
<small>
  Date: {item.date || "Not set"} | Time: {item.time || "Not set"}
</small>
            </span>
<button className="edit-btn" onClick={() => editTask(item.id)}>
  Edit
</button>
<button className="done-btn" onClick={() => completeTask(item.id)}>
  {item.completed ? "Undo" : "Done"}
</button>
<button className="delete-btn" onClick={() => deleteTask(item.id)}>
  Delete
</button>
          </li>
        ))}
      </ul>

      <p>Total Tasks: {tasks.length}</p>
      <p>
        Completed: {tasks.filter((item) => item.completed).length}
      </p>
      <p>
        Pending: {tasks.filter((item) => !item.completed).length}
      </p>
    </div>
  );
}

export default App;