const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: 'p@ssword',
  port: 5432
});

const yearQuery =
  'SELECT DISTINCT EXTRACT(year FROM release_date) as year ' +
  'FROM Movies ' +
  'WHERE release_date IS NOT NULL ' +
  'ORDER BY year DESC';

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
    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      res.render('highest_grossing', {
        title: 'Top 10 Highest Grossing Movies By Year',
        years: years.rows
      });
    });
  },

  getMovieInfo: function (req, res) {
    res.render('movie_info', {
      title: 'Movie Info'
    });
  },

  /** 2 TABLE QUERIES */

  getCollectionEarnings: function (req, res) {
    res.render('collection_earnings', {
      title: 'Total Movie Collection Earnings'
    });
  },

  getHighestRated: function (req, res) {
    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      res.render('highest_rated', {
        title: 'Highest Rated Movies By Year',
        years: years.rows
      });
    });
  },

  /** 3 TABLE QUERIES */

  getSimilarMovies: function (req, res) {
    res.render('similar_movies', {
      title: 'Top 50 Similar Movies'
    });
  },

  getPopularGenres: function (req, res) {
    pool.query(yearQuery, (error, years) => {
      if (error) throw error;
      res.render('popular_genres', {
        title: 'Most Popular Genres By Year',
        years: years.rows
      });
    });
  },

  /** 4 TABLE QUERIES */

  getHighestRatedByKeywords: function (req, res) {
    res.render('highest_rated_by_keywords', {
      title: 'Top 50 Highest-Rated Movies by Keywords'
    });
  }
};

module.exports = controller;
