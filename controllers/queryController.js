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
  database: 'movies',
  password: 'p@ssword',
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
          title: 'Top 50 Highest Grossing Movies in ' + year,

          isResults: true,
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
    var title = req.body.title;

    var query =
      "SELECT title, overview, release_date, runtime, tagline, ROUND(popularity, 2) as popularity, CONCAT('https://imdb.com/title/', imdb_id) AS imdb_link " +
      'FROM Movies ' +
      "WHERE LOWER(title) LIKE LOWER('%" +
      title +
      "%') " +
      'ORDER BY popularity DESC';

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;
        console.log(results.rows);

        res.render('movie_info', {
          title: 'Movie Info of "' + title + '"',
          isResults: true,
          movies: results.rows
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
          isResults: true,
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
    var year = req.body.year;
    var currentPage = req.body.page;

    var limit = 10;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT m.title, ROUND(AVG(r.rating), 2), COUNT(r.rating) ' +
      'FROM movies m ' +
      'JOIN ratings r ON m.id = r.movieid ' +
      'WHERE EXTRACT(YEAR FROM release_date) = ' +
      year +
      ' GROUP BY m.id, m.title ' +
      'ORDER BY AVG(r.rating) DESC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    console.log(query);

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      console.log(years.rows);

      pool.query(query, (error, results) => {
        if (error) throw error;
        console.log(results.rows);

        res.render('highest_rated', {
          title: 'Highest Rated Movies in the Year ' + year,
          isResults: true,
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

  /** 3 TABLE QUERIES */

  postSimilarMovies: function (req, res) {
    var title = req.body.title;
    var currentPage = req.body.page;

    var limit = 50;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT m.title, string_agg(DISTINCT k.name, \', \') AS keywords, count(*) OVER() AS full_count ' + 
      'FROM Movies m JOIN Movie_Keywords mk ON m.id = mk.movie_id ' + 
      'JOIN Keywords k ON k.id = mk.keyword_id ' + 
      'WHERE m.id != (	SELECT m.id ' +
                      'FROM movies m ' +
                      'WHERE LOWER(m.title) LIKE \'%' + 
                      title +
                      '%\' ' + 
                      'LIMIT 1) ' +
     'AND	k.id IN ( 	SELECT DISTINCT mk.keyword_id ' +
            'FROM Movie_keywords mk ' +
            'JOIN Movies m ON mk.movie_id = m.id ' + 
            'WHERE LOWER(m.title) LIKE \'%' +
            title +
            '%\') ' +
      'GROUP BY m.id, m.title ' +
      'ORDER BY COUNT(mk.keyword_id) DESC ' +
      'LIMIT ' +
       limit +
      'OFFSET ' +
      offset;
      
    console.log(query);

    pool.query(query, (error, results) => {
      console.log(error);

      if (results.rows.length > 0) {
        if (error) throw error;
        console.log(results.rows);

        res.render('similar_movies', {
          title: 'Top 50 Similar Movies to "' + title + '"',
          isResults: true,
          movies: results.rows,

          input_option: 'title',
          input_value: title,

          previousPage: currentPage - 1,
          offset: offset//,
         // nextPage: parseInt(currentPage) + 1,
         // booleanPreviousPage: isTherePrevPage(currentPage),
         // booleanNextPage: isThereNextPage(results.rows[0].full_count, limit, currentPage)
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
          isResults: true,
          genres: results.rows,

          years: years.rows,

          input_option: 'year',
          input_value: year,

          previousPage: currentPage - 1,
          nextPage: parseInt(currentPage) + 1,
          currentPage: currentPage,
          offset: offset,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(results.rows[0].full_count, limit, currentPage)
        });
      });
    });
  },

  /** 4 TABLE QUERIES */

  postHighestRatedByKeywords: function (req, res) {
    var keyword = req.body.keyword;
    var currentPage = req.body.page;

    var limit = 50;
    var offset = (currentPage - 1) * limit;

    var query =
      'SELECT m.Title, ROUND(AVG(r.rating),2), COUNT(r.rating) FROM Movies m ' +
      'JOIN Movie_Keywords mk ON m.id = mk.id ' +
      'JOIN Keywords k ON mk.keywords = k.id ' +
      'JOIN Ratings r ON r.movieid = m.id ' +
      "WHERE k.name LIKE '%" +
      keyword +
      "%'" +
      'GROUP BY m.id, m.title ' +
      'ORDER BY AVG(r.rating) DESC ' +
      'LIMIT ' +
      limit +
      ' OFFSET ' +
      offset;

    pool.query(query, (error, results) => {
      if (results.rows.length > 0) {
        if (error) throw error;
        console.log(results.rows);

        res.render('highest_rated_by_keywords', {
          title: 'Top 50 Highest-Rated Movies by Keyword ' + keyword,
          isResults: true,
          movies: results.rows,

          input_option: 'keyword',
          input_value: keyword,

          previousPage: currentPage - 1,
          currentPage: currentPage,
          offset: offset,
          nextPage: parseInt(currentPage) + 1,
          booleanPreviousPage: isTherePrevPage(currentPage),
          booleanNextPage: isThereNextPage(results.rows[0].full_count, limit, currentPage)
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
