const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET API 1st

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
 SELECT
 movie_name
 FROM
 movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//post API 2nd

app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const addMoviesQuery = `
    INSERT INTO 
     movie(director_id, movie_name, lead_actor)
        VALUES(${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMoviesQuery);
  console.log(dbResponse);

  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//3rd API
const convertResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id=${movieId};`;
  let player = await db.get(getPlayerQuery);
  response.send(convertResponseObject(player));
});

//APP PUT 4th

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const updatedMoviesQuery = `
    UPDATE 
    movie
    SET
    director_id=${directorId},
    movie_name ='${movieName}' ,
    lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId};`;
  await db.run(updatedMoviesQuery);
  response.send("Movie Details Updated");
});

//DeLETE API 5th
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMoviesQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMoviesQuery);
  response.send("Movie Removed");
});

//Get Directors 6th API
const convertDirectorResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
 SELECT
 *
 FROM
 director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorResponseObject(eachDirector)
    )
  );
});

// 7th API Get by specific director
const responseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT *
    FROM movie
    WHERE director_id=${directorId};`;
  const mov = await db.all(getDirectorQuery);
  response.send(responseObject(mov));
});

module.exports = app;

