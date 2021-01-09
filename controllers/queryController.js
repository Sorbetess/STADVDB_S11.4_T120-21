const Pool = require('pg').Pool;

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

const yearQuery =
  'SELECT DISTINCT EXTRACT(year FROM release_date) as year ' +
  'FROM Movies ' +
  'WHERE release_date IS NOT NULL ' +
  'ORDER BY year DESC';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Movies',
  password: 'password',
  port: 5432
});

const queryController = {
  /** 1 TABLE QUERIES */

  postHighestGrossing: function (req, res) {
    var year = req.body.year;
    var currentPage = req.body.page;

    var limit = 50;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT Title, Release_Date, Revenue - Budget AS Net_Income, count(*) OVER() AS full_count ' +
      'FROM Movies ' +
      'WHERE EXTRACT(year FROM Release_Date) = ' +
      year +
      ' ORDER BY Revenue - Budget DESC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        console.log(results.rows);

        res.render('highest_grossing', {
          title: 'Top 10 Highest Grossing Movies in ' + year,
          movies: results.rows,

          years: years.rows,

          input_option: 'year',
          input_value: year,

          previousPage: currentPage - 1,
          currentPage: currentPage,
          offset: offset,
          nextPage: parseInt(currentPage) + 1,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(results.rows[0].full_count, limit, currentPage)
        });
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
    var collection = req.body.collection;
    var currentPage = req.body.page;

    var limit = 10;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT c.Name, SUM(m.Revenue), count(*) OVER() AS full_count ' +
      'FROM Collections c, Movies m ' +
      "WHERE LOWER(c.Name) LIKE LOWER('%" +
      collection +
      "%') " +
      'AND c.id = m.Belongs_To_Collection ' +
      'GROUP BY c.id, c.Name ' +
      'ORDER BY c.Name ASC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    console.log(query);

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;
        console.log(results.rows);

        res.render('collection_earnings', {
          title: 'Total Movie Collection Earnings of "' + collection + '"',
          collections: results.rows,

          input_option: 'collection',
          input_value: collection,

          previousPage: currentPage - 1,
          currentPage: currentPage,
          offset: offset,
          nextPage: parseInt(currentPage) + 1,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(results.rows[0].full_count, limit, currentPage)
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
    var year = req.body.year;
    var currentPage = req.body.page;

    var limit = 10;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT g.Name, ROUND(AVG(m.Popularity), 2), count(*) OVER() AS full_count ' +
      'FROM Movies m, Genres g, Movie_Genres mg ' +
      'WHERE EXTRACT(year FROM m.release_date) = ' +
      year +
      ' AND mg.id = m.id AND g.id = mg.genres ' +
      'AND m.title IS NOT NULL ' +
      'GROUP BY g.id, g.name ' +
      'ORDER BY AVG(m.popularity) DESC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        console.log(results.rows);

        res.render('popular_genres', {
          title: 'Most Popular Genres in the Year ' + year,
          genres: results.rows,

          years: years.rows,

          input_option: 'year',
          input_value: year,

          previousPage: currentPage - 1,
          currentPage: currentPage,
          offset: offset,
          nextPage: parseInt(currentPage) + 1,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(results.rows[0].full_count, limit, currentPage)
        });
      });
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
