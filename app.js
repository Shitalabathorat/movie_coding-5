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

//GET API
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
 SELECT
 *
 FROM
   movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//post API

app.post("/movies/", async(request,response)=>{
    const moviesDetails=request.body;
    const {directorId, movieName, leadActor} = moviesDetails ;
    const addMoviesQuery=`
    INSERT INTO 
     movie(directorId, movieName, leadActor)
        VALUES(`${directorId}`,`${movieName}`,`${leadActor}`);`;
    const dbResponse=await db.run(addMoviesQuery);
    console.log(dbResponse);

    const movieId=db.Response.lastID;
    response.send("Movie Successfully added");

});

//Get By Id
app.get("/movies/:movieId/", async(request,response)=>{
    const { movieId }=request.params;
    const getMovieQuery=`
    SELECT * 
    FROM 
      movie
    WHERE movie_id=${movieId};`;
    const mov=await db.get(getMovieQuery);
    response.send(mov);
});

//APP PUT

app.put("/movies/:movieId/", async(request,response)=>{
    const { movieId }=request.params;
    const moviesDetails=request.body;
    const {directorId, movieName, leadActor} = moviesDetails ;
    const updatedMoviesQuery=`
    UPDATE 
    movie
    SET
    directorId=${directorId},
    movieName =`${movieName}` ,
    leadActor=`${leadActor}`
    WHERE 
    movieId=${movieId};`;
    await db.run(updatedMoviesQuery);
    response.send("Movie Details Updated");
})

//DeLETE API
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

//Get Directors
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name

  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
 SELECT
 *
 FROM
 director;`;
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
     directorsArray.map((eachPDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

//Get by specific director

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};


app.get("/directors/:directorId/movies/", async(request,response)=>{
    const { directorId }=request.params;
    const getMovieQuery=`
    SELECT * 
    FROM 
      movie
    WHERE director_id=${directorId};`;
    const mov=await db.get(getMovieQuery);
    response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});




module.exports = app;
