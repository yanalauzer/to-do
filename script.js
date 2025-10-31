// Простой ToDo-лист на чистом JS
document.addEventListener("DOMContentLoaded", () => {
  // Создаём элементы
  const title = document.createElement("h1");
  title.textContent = "ToDo List";
  const form = document.createElement("form");
  const input = document.createElement("input");
  input.placeholder = "Введите задачу";
  input.required = true;
  const addBtn = document.createElement("button");
  addBtn.textContent = "Добавить";
  const list = document.createElement("ul");

  form.append(input, addBtn);
  document.body.append(title, form, list);

  // Загружаем сохранённые задачи
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.forEach(addTaskToDOM);

  // Добавление новой задачи
  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const task = { text, done: false };
    tasks.push(task);
    save();
    addTaskToDOM(task);
    input.value = "";
  });

  // Добавление задачи в DOM
  function addTaskToDOM(task) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.done) span.style.textDecoration = "line-through";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✓";
    doneBtn.onclick = () => {
      task.done = !task.done;
      span.style.textDecoration = task.done ? "line-through" : "none";
      save();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "✗";
    delBtn.onclick = () => {
      tasks = tasks.filter(t => t !== task);
      li.remove();
      save();
    };

    li.append(doneBtn, span, delBtn);
    list.append(li);
  }

  // Сохраняем в localStorage
  function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});
