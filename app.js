const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const pathDb = path.join(__dirname, "moviesData.db");
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: pathDb,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running at http://localhost:3001/");
    });
  } catch (error) {
    console.log(`Db Error: ${error.message}`);
    process.exit(1);
  }
};
const convertDbObjectToResponsiveObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

initializeDbAndServer();
// GET Method
app.get("/movies/", async (request, response) => {
  const getMovieNames = `
    SELECT 
        movie_name
    FROM 
        movie
    ORDER BY
        movie_id;`;
  const movieNamesArray = await db.all(getMovieNames);
  response.send(
    movieNamesArray.map((eachMovie) =>
      convertDbObjectToResponsiveObject(eachMovie)
    )
  );
});
// POST Method
app.post("/movies/", async (request, response) => {
  const requestBody = request.body;
  const { directorId, movieName, leadActor } = requestBody;
  const addMovieQuery = `
    INSERT INTO
        movie(director_id,
        movie_name,
        lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});
// GET Single Data
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE 
        movie_id = ${movieId};`;
  const movieArray = db.get(movieQuery);
  response.send(movieArray);
});
// Put Method
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const movieQuery = `
    UPDATE 
        movie
    SET 
        movie_id = ${movieId},
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};`;
  await db.run(movieQuery);
  response.send("Movie Details Updated");
});
//Delete Method
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const reqQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  await db.run(reqQuery);
  response.send("Movie Removed");
});
// Get method for director
app.get("/directors/", async (request, response) => {
  const directorQuery = `
    SELECT
        *
    FROM 
        director;`;
  const dbResponse = await db.all(directorQuery);
  response.send(
    dbResponse.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});
// Get Method for particular director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const reqQuery = `
    SELECT
        movie_name
    FROM
        movie
    WHERE
        director_id = ${directorId};`;
  const dbResponse = await db.all(reqQuery);
  response.send(
    dbResponse.map((eachMovie) => convertDbObjectToResponsiveObject(eachMovie))
  );
});
module.exports = app;
