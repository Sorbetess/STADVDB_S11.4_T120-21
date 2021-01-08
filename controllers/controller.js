const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: 'p@ssword',
  port: 5432
});

const controller = {

  getFavicon: function (req, res) {
    console.log('@ controller, getFavicon');

    res.status(204);
  },

  getHome: function (req, res) {
    res.render('home', {
      title: 'Skyflix'
    });
  },

  /** 1 TABLE QUERIES */

  getHighestGrossing: function (req, res) {
    var year = req.query.year;
    var query =
    "SELECT Title, Release_Date, Revenue - Budget AS Net_Income FROM Movies WHERE EXTRACT(year FROM Release_Date) = " + year + " ORDER BY Revenue - Budget DESC LIMIT 10"

    pool.query(
      query,
      (error, results) => {
        if (error) throw error;

        console.log(results.rows);

        res.render('display_highest_grossing', {
          title: "Top 10 Highest Grossing Movies in " + year,
          movies: results.rows
        });
      }
    );
  },

  postHighestGrossing: function (req, res) {
    res.render('highest_grossing', {
      title: 'Top 10 Highest Grossing Movies by Year'
    });
  },

  getPopularMovies: function (req, res) {
    res.render('popular_movies', {
      title: 'Popular Movies'
    });
  },

  postPopularMovies: function (req, res) {
    res.render('popular_movies', {
      title: 'Popular Movies'
    });
  },

  /** 2 TABLE QUERIES */

  getCollectionEarnings: function (req, res) {
    var collection = req.query.collection;
    var query = "SELECT c.Name, SUM(m.Revenue) FROM Collections c, Movies m WHERE LOWER(c.Name) LIKE LOWER('%" + collection + "%') AND c.id = m.Belongs_To_Collection GROUP BY c.id, c.Name ORDER BY c.Name ASC LIMIT 10"
    
    pool.query(
      query,
      (error, results) => {
        if (error) throw error;

        console.log(results.rows);

        res.render('display_collection_earnings', {
          title: "Total Movie Collection Earnings of \"" + collection + "\"",
          collections: results.rows
        });
      }
    );
  },

  postCollectionEarnings: function (req, res) {
    console.log(req.body.collection);

    res.render('collection_earnings', {
      title: 'Total Movie Collection Earnings'
    });
  },

  getHighestRated: function (req, res) {
    res.render('highest_rated', {
      title: 'Highest Rated Movies by Year'
    });
  },

  postHighestRated: function (req, res) {
    res.render('highest_rated', {
      title: 'Highest Rated Movies by Year'
    });
  },

  /** 3 TABLE QUERIES */

  getSimilarMovies: function (req, res) {
    res.render('similar_movies', {
      title: 'Top 50 Similar Movies'
    });
  },

  postSimilarMovies: function (req, res) {
    res.render('similar_movies', {
      title: 'Top 50 Similar Movies'
    });
  },

  getPopularGenres: function (req, res) {
    res.render('popular_genres', {
      title: 'Top 10 Most Popular Genres by Year'
    });
  },

  postPopularGenres: function (req, res) {
    res.render('popular_genres', {
      title: 'Top 10 Most Popular Genres by Year'
    });
  },

  /** 4 TABLE QUERIES */

  getMovieInfo: function (req, res) {
    res.render('movie_info', {
      title: 'Movie Info'
    });
  },

  postMovieInfo: function (req, res) {
    res.render('movie_info', {
      title: 'Movie Info'
    });
  }
};

module.exports = controller;
