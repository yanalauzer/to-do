document.addEventListener("DOMContentLoaded", () => {
  //  Стили
  const style = document.createElement("style");
  style.textContent = `
    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #69B7E8, #C2C1F2);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #333;
    }
    h1 { color: white; margin-bottom: 20px; text-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    form {
      background: white;
      border-radius: 12px;
      padding: 15px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    input[type=text], select {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 8px;
      font-size: 14px;
    }
    button {
      cursor: pointer;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      background: #69B7E8;
      color: white;
      font-weight: 600;
      transition: 0.2s;
    }
    button:hover { background: #58a8dc; }
    ul { list-style: none; padding: 0; width: 100%; max-width: 400px; }
    li {
      background: white;
      border-radius: 10px;
      margin-bottom: 10px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    }
    .task-info { flex: 1; margin: 0 10px; }
    .task-time { font-size: 12px; color: #777; }
    .done span { text-decoration: line-through; opacity: 0.6; }
    input.edit {
      border: none;
      background: #eef;
      border-radius: 5px;
      padding: 4px;
      width: 90%;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  // Основные элементы 
  const title = document.createElement("h1");
  title.textContent = "Мой ToDo-лист";

  const form = document.createElement("form");

  // Поле для текста
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Название задачи";
  input.required = true;

  // Выпадающие списки времени
  const hoursSelect = document.createElement("select");
  const minutesSelect = document.createElement("select");

  for (let h = 0; h < 24; h++) {
    const opt = document.createElement("option");
    opt.value = h.toString().padStart(2, "0");
    opt.textContent = h.toString().padStart(2, "0") + " ч";
    hoursSelect.append(opt);
  }

  for (let m = 0; m < 60; m += 5) {
    const opt = document.createElement("option");
    opt.value = m.toString().padStart(2, "0");
    opt.textContent = m.toString().padStart(2, "0") + " мин";
    minutesSelect.append(opt);
  }

  // Кнопка добавления
  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Добавить";

  form.append(input, hoursSelect, minutesSelect, addBtn);
  const list = document.createElement("ul");
  document.body.append(title, form, list);

  // Хранилище 
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  sortTasks(); // сортировка при загрузке
  tasks.forEach(addTaskToDOM);

  // Добавление задачи 
  form.onsubmit = e => {
    e.preventDefault();
    const text = input.value.trim();
    const time = `${hoursSelect.value}:${minutesSelect.value}`;
    if (!text) return;

    const task = { text, time, done: false };
    tasks.push(task);
    sortTasks(); // сортировка после добавления
    save();
    reloadList();
    form.reset();
  };

  // Отображение задачи 
  function addTaskToDOM(task) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "task-info";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.onclick = () => editTask(span, task);

    const time = document.createElement("div");
    time.className = "task-time";
    time.textContent = task.time ? `⏰ ${task.time}` : "";

    info.append(span, time);

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✓";
    doneBtn.onclick = () => {
      task.done = !task.done;
      li.classList.toggle("done");
      save();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "✗";
    delBtn.onclick = () => {
      tasks = tasks.filter(t => t !== task);
      li.remove();
      save();
    };

    li.append(doneBtn, info, delBtn);
    if (task.done) li.classList.add("done");
    list.appendChild(li);
  }

  // Редактирование задачи
  function editTask(span, task) {
    const inputEdit = document.createElement("input");
    inputEdit.value = task.text;
    inputEdit.className = "edit";
    span.replaceWith(inputEdit);
    inputEdit.focus();

    inputEdit.onkeydown = e => {
      if (e.key === "Enter") {
        task.text = inputEdit.value.trim() || task.text;
        save();
        reloadList();
      }
    };

    inputEdit.onblur = () => reloadList();
  }

  function reloadList() {
    list.innerHTML = "";
    sortTasks();
    tasks.forEach(addTaskToDOM);
  }

  function sortTasks() {
    tasks.sort((a, b) => a.time.localeCompare(b.time));
  }

  function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});
