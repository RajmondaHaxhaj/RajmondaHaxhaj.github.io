const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.className = 'task';
  li.draggable = true;
  if (task.completed) li.classList.add('completed');

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  // Double click to edit
  span.addEventListener('dblclick', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'edit-input';
    li.replaceChild(input, span);
    input.focus();

    input.addEventListener('blur', () => {
      task.text = input.value.trim();
      saveTasks();
      renderTasks();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') input.blur();
    });
  });

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const completeBtn = document.createElement('button');
  completeBtn.innerHTML = task.completed ? '✅' : '✔️';
  completeBtn.title = 'Mark complete';
  completeBtn.onclick = () => {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '🗑';
  deleteBtn.title = 'Delete task';
  deleteBtn.onclick = () => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  };

  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(actions);

  // Drag events
  li.addEventListener('dragstart', () => {
    li.classList.add('dragging');
    li.dataset.index = index;
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
  });

  return li;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const taskEl = createTaskElement(task, index);
    taskList.appendChild(taskEl);
  });
  addDragAndDrop();
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text === '') return;
  tasks.push({ text, completed: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
});

function addDragAndDrop() {
  taskList.querySelectorAll('.task').forEach(taskEl => {
    taskEl.addEventListener('dragover', e => e.preventDefault());

    taskEl.addEventListener('drop', e => {
      e.preventDefault();
      const fromIndex = parseInt(document.querySelector('.dragging').dataset.index);
      const toIndex = Array.from(taskList.children).indexOf(taskEl);

      if (fromIndex === toIndex) return;

      const movedTask = tasks.splice(fromIndex, 1)[0];
      tasks.splice(toIndex, 0, movedTask);
      saveTasks();
      renderTasks();
    });
  });
}

// Initial render
renderTasks();
