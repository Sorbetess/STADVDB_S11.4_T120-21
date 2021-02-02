const Pool = require('pg').Pool;
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const pool = new Pool({
  user: process.env.RDS_USER,
  host: process.env.RDS_URL,
  database: process.env.RDS_DATABASE,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT
});
const yearQuery = `
  SELECT DISTINCT EXTRACT(year FROM release_date) as year 
  FROM Movies 
  WHERE release_date IS NOT NULL
  ORDER BY year DESC
`;

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
    transpool.query(yearQuery, (error, years) => {
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
  },



  

  /** OLAP PAGES */

  getSlice: function (req, res) {
    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      res.render('slice', {
        title: 'Slice - Total Revenue of Production Companies in a Specific Year',
        years: years.rows
      });
    });
  },

  getDice: function (req, res) {
    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      res.render('dice', {
        title: 'Dice - Revenue of a Production Company in a Specific Year',
        years: years.rows
      });
    });
  },



  getDrillDown_a: function (req, res) {
    var query = 
    'SELECT rd.month, pd.name AS Company, m.title as Movie, ROUND(AVG(r.revenue), 2) AS Avg_Revenue ' +
    'FROM (SELECT revenue, release_id, company_id, movie_id ' +
    'FROM Revenue GROUP BY revenue, release_id, company_id, movie_id) r ' +
    'JOIN Release_Date rd ON r.release_id = rd.release_id ' +
    'JOIN Production_Company pd ON r.company_id = pd.company_id ' +
    'JOIN Movie m ON r.movie_id = m.movie_id ' +
    'GROUP BY ROLLUP(rd.month, pd.name, m.title) ' +
    'ORDER BY rd.month, (CASE WHEN pd.name IS NULL THEN 1 ELSE 0 END), pd.name, (CASE WHEN m.title IS NULL THEN 1 ELSE 0 END), Avg_Revenue desc';

    pool.query(query, (error, results) => {
      if (error) throw error;
      res.render('drilldown_a', {
        title: 'Drill-Down - Average Monthly Revenue of Production Companies',
  
        isResults: true,
        results: results.rows,
        offset: 0
      });
    });
  },

  getDrillDown_b: function (req, res) {
    var query = 
    'SELECT rd.month, g.name AS Genre, ROUND(AVG(r.revenue), 2) AS Avg_Revenue ' +
    'FROM Revenue r ' +
    'JOIN Release_Date rd ON r.release_id = rd.release_id ' +
    'JOIN Genre g ON r.genre_id = g.genre_id ' +
    'GROUP BY ROLLUP(rd.month, g.name) ' +
    'ORDER BY rd.month, (CASE WHEN g.name IS NULL THEN 1 ELSE 0 END), Avg_Revenue DESC, g.name';

    pool.query(query, (error, results) => {
      if (error) throw error;
      res.render('drilldown_b', {
        title: 'Drill-Down - Average Monthly Revenue of Genres',
  
        isResults: true,
        results: results.rows,
        offset: 0
      });
    });
  },



  getRollUp_a: function (req, res) {
    var query = 
    'SELECT rd.quarter, pd.name AS Company, m.title as Movie, ROUND(AVG(r.revenue), 2) AS Avg_Revenue ' +
    'FROM ' + 
    '(SELECT revenue, release_id, company_id, movie_id FROM Revenue GROUP BY revenue, release_id, company_id, movie_id) r ' +
    'JOIN Release_Date rd ON r.release_id = rd.release_id ' + 
    'JOIN Production_Company pd ON r.company_id = pd.company_id ' +
    'JOIN Movie m ON r.movie_id = m.movie_id ' + 
    'GROUP BY ROLLUP(rd.quarter, pd.name, m.title) ' + 
    'ORDER BY rd.quarter, (CASE WHEN pd.name IS NULL THEN 1 ELSE 0 END), ' + 
    'pd.name, (CASE WHEN m.title IS NULL THEN 1 ELSE 0 END), Avg_Revenue DESC';

    pool.query(query, (error, results) => {
      if (error) throw error;
      res.render('rollup_a', {
        title: 'Roll Up - Average Quarterly Revenue of Production Companies',
  
        isResults: true,
        results: results.rows,
        offset: 0
      });
    });       
  },

  getRollUp_b: function (req, res) {
    var query =
    'SELECT rd.quarter, g.name, ROUND(AVG(r.revenue),2) AS avg_revenue ' +
    'FROM Revenue r ' +
    'JOIN Release_Date rd ON r.release_id = rd.release_id ' +
    'JOIN Genre g ON r.genre_id = g.genre_id ' +
    'GROUP BY ROLLUP(rd.quarter, g.name) ' +
    'ORDER BY rd.quarter, (CASE WHEN g.name IS NULL THEN 1 ELSE 0 END), Avg_Revenue DESC, g.name';

    pool.query(query, (error, results) => {
      if (error) throw error;
      res.render('rollup_b', {
        title: 'Roll Up - Average Quarterly Revenue of Genres',
  
        isResults: true,
        results: results.rows,
        offset: 0
      });
    });    
  }
};

module.exports = controller;
