const { uuid, isUuid } = require('uuidv4')
const express = require("express");
const cors = require("cors");

// const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function idIsValid(request, response, next) {
  const { id } = request.params

  if (!isUuid(id)) return response.status(400).json({error: 'Invalid ID!'})

  return next()
}

function idIsRegistered(request, response, next) {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(repository => 
    (repository.id === id)
  )

  if (repositoryIndex < 0) return response.status(400).json({
    error: 'No repository was found with the given ID!'
  })

  return next()
}

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  if (!title || !url || !techs) return response.send(400)

  const id = uuid()

  const newRepository ={
    id,
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(newRepository)

  return response.json(newRepository)
});

app.put("/repositories/:id", idIsValid, idIsRegistered, (request, response) => {
  const { id } = request.params
  let { title, url, techs } = request.body

  const repositoryIndex = repositories.findIndex(repository => 
    (repository.id === id)
  )

  if (!title) title = repositories[repositoryIndex].title
  if (!url) url = repositories[repositoryIndex].url
  if (!techs) techs = repositories[repositoryIndex].techs

  const modifiedRepository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes
  }

  repositories[repositoryIndex] = modifiedRepository

  return response.json(modifiedRepository)
});

app.delete("/repositories/:id", 
  idIsValid, 
  idIsRegistered, 
  (request, response) => {
    const { id } = request.params
    let { title, url, techs } = request.body

    const repositoryIndex = repositories.findIndex(repository => 
      (repository.id === id)
    )

    repositories.splice(repositoryIndex, 1)

    return response.status(204).send()
  }
);

app.post("/repositories/:id/like", 
  idIsValid, 
  idIsRegistered, 
  (request, response) => {
    const { id } = request.params

    const repositoryIndex = repositories.findIndex(repository => 
      (repository.id === id)
    )

    repositories[repositoryIndex].likes += 1

    return response.json({ likes: repositories[repositoryIndex].likes })
  }
);

module.exports = app;
