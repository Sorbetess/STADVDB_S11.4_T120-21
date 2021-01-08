const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Movies',
  password: 'password',
  port: 5432
});

const queryController = {
  postHighestGrossing: function (req, res) {
    var year = req.body.year;
    var offset = 0;
    if (req.query.page) offset = (req.body.page - 1) * 50;

    var query =
      'SELECT Title, Release_Date, Revenue - Budget AS Net_Income FROM Movies WHERE EXTRACT(year FROM Release_Date) = ' +
      year +
      ' ORDER BY Revenue - Budget DESC LIMIT 50 OFFSET ' +
      offset;

    pool.query(query, (error, results) => {
      if (error) throw error;

      console.log(results.rows);

      res.render('display_highest_grossing', {
        title: 'Top 10 Highest Grossing Movies in ' + year,
        movies: results.rows
      });
    });
  },

  postMovieInfo: function (req, res) {
    res.render('movie_info', {
      title: 'Movie Info'
    });
  },

  /** 2 TABLE QUERIES */

  postCollectionEarnings: function (req, res) {
    var collection = req.query.collection;
    var offset = 0;
    if (req.query.page) offset = (req.query.page - 1) * 10;
    var query =
      "SELECT c.Name, SUM(m.Revenue) FROM Collections c, Movies m WHERE LOWER(c.Name) LIKE LOWER('%" +
      collection +
      "%') AND c.id = m.Belongs_To_Collection GROUP BY c.id, c.Name ORDER BY c.Name ASC LIMIT 10 OFFSET " +
      offset;

    pool.query(query, (error, results) => {
      if (error) throw error;

      console.log(results.rows);

      res.render('display_collection_earnings', {
        title: 'Total Movie Collection Earnings of "' + collection + '"',
        collections: results.rows
      });
    });
  },

  postHighestRated: function (req, res) {
    res.render('highest_rated', {
      title: 'Highest Rated Movies by Year'
    });
  },

  /** 3 TABLE QUERIES */

  postSimilarMovies: function (req, res) {
    res.render('similar_movies', {
      title: 'Top 50 Similar Movies'
    });
  },

  postPopularGenres: function (req, res) {
    var year = req.query.year;
    var offset = 0;
    if (req.query.page) offset = (req.query.page - 1) * 10;
    var query =
      'SELECT g.Name, ROUND(AVG(m.Popularity), 2) FROM Movies m, Genres g, Movie_Genres mg WHERE EXTRACT(year FROM m.release_date) = ' +
      year +
      ' AND mg.id = m.id AND g.id = mg.genres AND m.title IS NOT NULL GROUP BY g.id, g.name ORDER BY AVG(m.popularity) DESC LIMIT 10 OFFSET ' +
      offset;

    /*pool.query(
        query,
        (error, results) => {
          if (error) throw error;
  
          console.log(results.rows);
  
          res.render('display_popular_genres', {
            title: "Most Popular Genres in the Year " + year,
            genres: results.rows
          });
        }
      );*/

    res.render('display_popular_genres', {
      title: 'Most Popular Genres in the Year ' + year
    });
  },

  /** 4 TABLE QUERIES */

  postHighestRatedByKeywords: function (req, res) {
    res.render('highest_rated_by_keywords', {
      title: 'Top 50 Highest-Rated Movies by Keywords'
    });
  }
};

module.exports = queryController;
