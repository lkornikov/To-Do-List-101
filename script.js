const storageKey = "little-list-tasks";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const storageMessage = document.querySelector("#storage-message");

let tasks = [];

try {
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(task =>
      task && typeof task.text === "string" && typeof task.completed === "boolean"
    )) {
      throw new Error("Invalid task data");
    }
    tasks = parsed;
  }
} catch (error) {
  storageMessage.textContent = "Saved tasks could not be loaded. Changes may not persist in this browser.";
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    storageMessage.textContent = "";
  } catch (error) {
    storageMessage.textContent = "Tasks could not be saved. Your changes will be lost when you close this page.";
  }
}

function renderTasks() {
  list.replaceChildren();
  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = task.completed ? "task-item completed" : "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.id = `task-${index}`;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
      document.getElementById(`task-${index}`).focus();
    });

    const label = document.createElement("label");
    label.className = "task-text";
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
      input.focus();
    });

    item.append(checkbox, label, deleteButton);
    list.append(item);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  count.textContent = `${remaining} remaining`;
  emptyState.hidden = tasks.length > 0;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.value = "";
    input.focus();
    return;
  }
  tasks.push({ text, completed: false });
  saveTasks();
  renderTasks();
  input.value = "";
  input.focus();
});

renderTasks();
