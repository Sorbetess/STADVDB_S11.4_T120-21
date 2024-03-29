const Pool = require('pg').Pool;
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

/** This function returns whether or not there is a previous page. */
function isTherePrevPage(currentPage) {
  // return false if the current page is 1
  return currentPage <= 1 ? false : true;
}

/** This function returns whether or not there is a next page. */
function isThereNextPage(queryCount, limit, currentPage) {
  var lastPage = queryCount / limit;

  // return false if the number of queries is less than 1 page, or if the current page is already the last page
  return queryCount <= limit || currentPage >= lastPage ? false : true;
}

const yearQuery = `
  SELECT DISTINCT EXTRACT(year FROM release_date) as year
  FROM Movies
  WHERE release_date IS NOT NULL
  ORDER BY year DESC
`;

const pool = new Pool({
  user: process.env.RDS_USER,
  host: process.env.RDS_URL,
  database: process.env.RDS_DATABASE,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT
});

const queryController = {
  /** 1 TABLE QUERIES */

  postHighestGrossing: function (req, res) {
    var year = req.body.year;

    var query =
      'SELECT Title, Release_Date, Revenue - Budget AS Net_Income ' +
      'FROM Movies ' +
      'WHERE EXTRACT(year FROM Release_Date) = ' +
      year +
      ' ORDER BY Revenue - Budget DESC ' +
      'LIMIT 50';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('highest_grossing', {
          title: 'Top 50 Highest Grossing Movies in ' + year,

          isResults: true,
          movies: results.rows,

          years: years.rows,

          input_option: 'year',
          input_value: year,
          offset: 0
        });
      });
    });
  },

  postMovieInfo: function (req, res) {
    var title = req.body.title;

    var currentPage = req.body.page;

    var limit = 5;
    var offset = (currentPage - 1) * limit;

    var query =
      "SELECT title, overview, release_date, runtime, tagline, ROUND(popularity, 2) as popularity, CONCAT('https://imdb.com/title/', imdb_id) AS imdb_link,  count(*) OVER() AS full_count " +
      'FROM Movies ' +
      "WHERE LOWER(title) LIKE LOWER('%" +
      title.replace("'", "''") +
      "%') " +
      'ORDER BY popularity DESC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;

        res.render('movie_info', {
          title: 'Movie Info of "' + title + '"',
          isResults: true,
          movies: results.rows,

          input_option: 'title',
          input_value: title,

          previousPage: currentPage - 1,
          currentPage: currentPage,
          offset: offset,
          nextPage: parseInt(currentPage) + 1,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(
            results.rows[0].full_count,
            limit,
            currentPage
          )
        });
      } else {
        res.render('movie_info', {
          title: 'Movie Info of "' + title + '"',
          isEmpty: true
        });
      }
    });
  },

  /** 2 TABLE QUERIES */

  postCollectionEarnings: function (req, res) {
    var collection = req.body.collection;
    var currentPage = req.body.page;

    var limit = 10;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT c.Name, SUM(m.Revenue), count(*) OVER() AS full_count ' +
      'FROM Collections c, Movies m ' +
      "WHERE LOWER(c.Name) LIKE LOWER('%" +
      collection.replace("'", "''") +
      "%') " +
      'AND c.id = m.Belongs_To_Collection ' +
      'GROUP BY c.id, c.Name ' +
      'ORDER BY c.Name ASC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;

        res.render('collection_earnings', {
          title: 'Total Movie Collection Earnings of "' + collection + '"',
          isResults: true,
          collections: results.rows,

          input_option: 'collection',
          input_value: collection,

          previousPage: currentPage - 1,
          currentPage: currentPage,
          offset: offset,
          nextPage: parseInt(currentPage) + 1,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(
            results.rows[0].full_count,
            limit,
            currentPage
          )
        });
      } else {
        res.render('collection_earnings', {
          title: 'Total Movie Collection Earnings of "' + collection + '"',
          isEmpty: true
        });
      }
    });
  },

  postHighestRated: function (req, res) {
    var year = req.body.year;

    /**var query =
      'SELECT m.title, ROUND(AVG(r.rating), 2), COUNT(r.rating) ' +
      'FROM movies m ' +
      'JOIN ratings r ON m.id = r.movie_id ' +
      'WHERE EXTRACT(YEAR FROM release_date) = ' +
      year +
      ' GROUP BY m.id, m.title ' +
      'ORDER BY AVG(r.rating) DESC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;*/

    var query =
      'SELECT title, avg_rating, num_ratings ' +
      'FROM movies ' +
      'WHERE EXTRACT(YEAR FROM release_date) = ' +
      year +
      ' AND avg_rating IS NOT NULL ' +
      'GROUP BY id, title, avg_rating, num_ratings ' +
      'ORDER BY avg_rating DESC ' +
      'LIMIT 50';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('highest_rated', {
          title: 'Top 50 Highest Rated Movies in the Year ' + year,
          isResults: true,
          movies: results.rows,

          years: years.rows,

          input_option: 'year',
          input_value: year,

          offset: 0
        });
      });
    });
  },

  /** 3 TABLE QUERIES */

  postSimilarMovies: function (req, res) {
    var title = req.body.title;

    var query =
      "SELECT m.title, string_agg(DISTINCT k.name, ', ') AS keywords " +
      'FROM Movies m JOIN Movie_Keywords mk ON m.id = mk.movie_id ' +
      'JOIN Keywords k ON k.id = mk.keyword_id ' +
      'WHERE m.id != (	SELECT m.id ' +
      'FROM movies m ' +
      "WHERE LOWER(m.title) LIKE LOWER('%" +
      title.replace("'", "''") +
      "%') " +
      'LIMIT 1) ' +
      'AND	k.id IN ( 	SELECT DISTINCT mk.keyword_id ' +
      'FROM Movie_keywords mk ' +
      'JOIN Movies m ON mk.movie_id = m.id ' +
      "WHERE LOWER(m.title) LIKE LOWER('%" +
      title.replace("'", "''") +
      "%')) " +
      'GROUP BY m.id, m.title ' +
      'ORDER BY COUNT(DISTINCT mk.keyword_id) DESC ' +
      'LIMIT 50';

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;

        res.render('similar_movies', {
          title: 'Top 50 Similar Movies to "' + title + '"',
          isResults: true,
          movies: results.rows,

          input_option: 'title',
          input_value: title,

          offset: 0
        });
      } else {
        res.render('similar_movies', {
          title: 'Top 50 Similar Movies to "' + title + '"',
          isEmpty: true
        });
      }
    });
  },

  postPopularGenres: function (req, res) {
    var year = req.body.year;

    var query =
      'SELECT g.Name, ROUND(AVG(m.Popularity), 2) ' +
      'FROM Movies m, Genres g, Movie_Genres mg ' +
      'WHERE EXTRACT(year FROM m.release_date) = ' +
      year +
      ' AND mg.movie_id = m.id AND g.id = mg.genre_id ' +
      'AND m.title IS NOT NULL ' +
      'GROUP BY g.id, g.name ' +
      'ORDER BY AVG(m.popularity) DESC ' +
      'LIMIT 10';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('popular_genres', {
          title: 'Most Popular Genres in the Year ' + year,
          isResults: true,
          genres: results.rows,

          years: years.rows,

          input_option: 'year',
          input_value: year,
          offset: 0
        });
      });
    });
  },

  /** 4 TABLE QUERIES */

  postHighestRatedByKeywords: function (req, res) {
    var keyword = req.body.keyword;

    /**var query =
      'SELECT m.Title, ROUND(AVG(r.rating),2), COUNT(r.rating) FROM Movies m ' +
      'JOIN Movie_Keywords mk ON m.id = mk.movie_id ' +
      'JOIN Keywords k ON mk.keyword_id = k.id ' +
      'JOIN Ratings r ON r.movie_id = m.id ' +
      "WHERE k.name LIKE '%" +
      keyword.replace("'", "''") +
      "%'" +
      'GROUP BY m.id, m.title ' +
      'ORDER BY AVG(r.rating) DESC ' +
      'LIMIT 50';*/

    var query =
      'SELECT m.title, m.avg_rating, m.num_ratings ' +
      'FROM movies m ' +
      'JOIN Movie_Keywords mk ON m.id = mk.movie_id ' +
      'JOIN Keywords k ON mk.keyword_id = k.id ' +
      "WHERE k.name LIKE LOWER('%" +
      keyword.replace("'", "''") +
      "%') " +
      'AND m.avg_rating IS NOT NULL ' +
      'GROUP BY m.id, m.title, m.avg_rating, m.num_ratings ' +
      'ORDER BY avg_rating DESC ' +
      'LIMIT 50 ';

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;

        res.render('highest_rated_by_keywords', {
          title: 'Top 50 Highest-Rated Movies by Keyword ' + keyword,
          isResults: true,
          movies: results.rows,

          input_option: 'keyword',
          input_value: keyword,
          offset: 0
        });
      } else {
        res.render('highest_rated_by_keywords', {
          title: 'Top 50 Highest-Rated Movies by Keyword ' + keyword,
          isEmpty: true
        });
      }
    });
  }
};

module.exports = queryController;
