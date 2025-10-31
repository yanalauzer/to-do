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
    input[type=text], select, input[type=date] {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 8px;
      font-size: 14px;
    }
    #search {
      margin-bottom: 20px;
      padding: 10px;
      width: 280px;
      border-radius: 8px;
      border: none;
      outline: none;
      font-size: 14px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.1);
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
    .lists {
      display: flex;
      gap: 30px;
      width: 100%;
      max-width: 900px;
      justify-content: center;
      flex-wrap: wrap;
    }
    ul {
      list-style: none;
      padding: 0;
      width: 100%;
      max-width: 400px;
    }
    li {
      background: white;
      border-radius: 10px;
      margin-bottom: 10px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 3px 8px rgba(0,0,0,0.1);
      cursor: grab;
    }
    li.dragging {
      opacity: 0.5;
      transform: scale(0.98);
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
    h2 {
      color: white;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);

  // Заголовок
  const title = document.createElement("h1");
  title.textContent = "Мой ToDo-лист";

  // Поиск
  const search = document.createElement("input");
  search.id = "search";
  search.type = "text";
  search.placeholder = "Поиск задачи...";

  // Форма
  const form = document.createElement("form");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Название задачи";
  input.required = true;

  const dateInput = document.createElement("input");
  dateInput.type = "date";

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

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Добавить";
  form.append(input, dateInput, hoursSelect, minutesSelect, addBtn);

  // Разделы
  const listsContainer = document.createElement("div");
  listsContainer.className = "lists";

  const todoTitle = document.createElement("h2");
  todoTitle.textContent = "Невыполненные задачи";
  const doneTitle = document.createElement("h2");
  doneTitle.textContent = "Выполненные задачи";

  const todoList = document.createElement("ul");
  const doneList = document.createElement("ul");

  const todoSection = document.createElement("div");
  const doneSection = document.createElement("div");
  todoSection.append(todoTitle, todoList);
  doneSection.append(doneTitle, doneList);
  listsContainer.append(todoSection, doneSection);

  document.body.append(title, search, form, listsContainer);

  // Логика
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  sortTasks();
  reloadLists();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    const date = dateInput.value;
    const time = `${hoursSelect.value}:${minutesSelect.value}`;
    if (!text || !date) return;
    const task = { text, date, time, done: false };
    tasks.push(task);
    sortTasks();
    save();
    reloadLists();
    form.reset();
  });

  search.addEventListener("input", () => reloadLists());

  function formatDateRus(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  }

  function addTaskToDOM(task, list) {
    const li = document.createElement("li");
    li.draggable = !task.done;

    const info = document.createElement("div");
    info.className = "task-info";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.addEventListener("click", () => editTask(li, task));

    const time = document.createElement("div");
    time.className = "task-time";
    time.textContent = `${formatDateRus(task.date)} ${task.time}`;
    info.append(span, time);

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✓";
    doneBtn.addEventListener("click", () => {
      task.done = !task.done;
      save();
      reloadLists();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "✗";
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t !== task);
      save();
      reloadLists();
    });

    li.append(doneBtn, info, delBtn);
    if (task.done) li.classList.add("done");
    list.append(li);

    if (!task.done) {
      li.addEventListener("dragstart", () => li.classList.add("dragging"));
      li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        updateOrder();
      });
    }
  }

  function editTask(li, task) {
    li.textContent = "";
    const textEdit = document.createElement("input");
    textEdit.className = "edit";
    textEdit.value = task.text;

    const dateEdit = document.createElement("input");
    dateEdit.type = "date";
    dateEdit.value = task.date;

    const timeEdit = document.createElement("input");
    timeEdit.type = "time";
    timeEdit.value = task.time;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.addEventListener("click", () => {
      task.text = textEdit.value.trim() || task.text;
      task.date = dateEdit.value || task.date;
      task.time = timeEdit.value || task.time;
      sortTasks();
      save();
      reloadLists();
    });

    li.append(textEdit, dateEdit, timeEdit, saveBtn);
  }

  function reloadLists() {
    todoList.textContent = "";
    doneList.textContent = "";
    sortTasks();
    const query = search.value.trim().toLowerCase();
    tasks
      .filter(t => t.text.toLowerCase().includes(query))
      .forEach(t => addTaskToDOM(t, t.done ? doneList : todoList));
  }

  function sortTasks() {
    tasks.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) return a.time.localeCompare(b.time);
      return dateCompare;
    });
  }

  function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  todoList.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const after = getDragAfterElement(todoList, e.clientY);
    if (!after) todoList.append(dragging);
    else todoList.insertBefore(dragging, after);
  });

  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll("li:not(.dragging)")];
    return els.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        else return closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function updateOrder() {
    const newOrder = [];
    const items = todoList.querySelectorAll("li");
    items.forEach(li => {
      const text = li.querySelector("span")?.textContent;
      const task = tasks.find(t => t.text === text && !t.done);
      if (task) newOrder.push(task);
    });
    const doneTasks = tasks.filter(t => t.done);
    tasks = [...newOrder, ...doneTasks];
    sortTasks();
    save();
  }
});
