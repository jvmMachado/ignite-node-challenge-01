const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'Invalid username.' })
  }

  request.user = user;

  return next();
}

function findTodoToEdit(request, response, next) {
  const { user } = request;

  const { id } = request.params;

  const todoToEdit = user.todos.find(todo => todo.id === id );

  if(!todoToEdit) {
    return response.status(404).json({ error: 'No Todo was found with this ID.'})
  }

  request.todoToEdit = todoToEdit;

  return next();

};

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({error: 'Username already in use.'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, findTodoToEdit, (request, response) => {
  const { title, deadline } = request.body;

  const { todoToEdit } = request;

  todoToEdit.title = title;
  todoToEdit.deadline = new Date(deadline);

  return response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, findTodoToEdit, (request, response) => {
  const { user, todoToEdit } = request;

  todoToEdit.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, findTodoToEdit, (request, response) => {
  const { user, todoToEdit } = request;

  user.todos.splice(todoToEdit, 1);

  return response.status(204).send();
});

module.exports = app;