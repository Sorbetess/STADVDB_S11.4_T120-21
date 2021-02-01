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

/*const yearQuery =
  'SELECT DISTINCT year ' +
  'FROM Release_Date ' +
  'ORDER BY year DESC';*/

const yearQuery =
'SELECT DISTINCT EXTRACT(year FROM release_date) as year ' +
'FROM Movies ' +
'WHERE release_date IS NOT NULL ' +
'ORDER BY year DESC';

//UPDATE
const pool = new Pool({
  user: process.env.RDS_USER,
  host: process.env.RDS_URL,
  database: process.env.RDS_DATABASE,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT
});

const olapController = {

  postSlice: function (req, res) {
    var year = req.body.year;

    var query =
    'SELECT rd.quarter, pd.name AS Company, SUM(r.revenue) AS Total_Revenue '
    'FROM (SELECT revenue, release_id, company_id, collection_id, movie_id ' +
    'FROM Revenue ' +
    'GROUP BY revenue, release_id, company_id, collection_id, movie_id) r ' +
    'JOIN Release_Date rd ON r.release_id = rd.release_id ' +
    'JOIN Production_Company pd ON r.company_id = pd.company_id ' +
    'WHERE rd.year = ' + year + ' ' +
    'GROUP BY rd.quarter, pd.name ' + 
    'ORDER BY rd.quarter, Total_Revenue DESC';
    

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('slice', {
          title: 'Slice',

          // options for years
          years: years.rows,
          results: results.rows,

          isResults: true,
          results: results.rows,
          offset: 0
        });
      });
    });
  },

  postDice: function (req, res) {
    var year = req.body.year;
    var company = req.body.company;

    // var query = 'SELECT rd.year, pd.name AS Company, ROUND(SUM(r.revenue), 2) AS Total_Revenue ' +
    // 'FROM Revenue r, Release_Date rd, Production_Company pd, Movie m ' +
    // 'WHERE r.release_id = rd.release_id AND ' +
    // 'r.company_id = pd.company_id AND ' +
    // 'r.movie_id = m.movie_id AND ' +
    // 'rd.year =' + year + ' AND ' +
    // 'LOWER(pd.name) LIKE LOWER(\'%' + company + '%\') ' +
    // 'GROUP BY rd.year, pd.company_id ' +
    // 'ORDER BY SUM(r.revenue) desc';

    var query =
    "SELECT pd.name AS Company, (CASE WHEN c.name IS NULL THEN 'Movies Without a Collection' ELSE c.name END) AS Collection, ROUND(SUM(r.revenue), 2) AS Total_Revenue " +
    'FROM (SELECT revenue, release_id, company_id, collection_id, movie_id ' +
    'FROM Revenue ' +
    'GROUP BY revenue, release_id, company_id, collection_id, movie_id) r ' +
    'FULL JOIN Release_Date rd ON r.release_id = rd.release_id ' +
    'FULL JOIN Production_Company pd ON r.company_id = pd.company_id ' +
    'FULL JOIN Movie m ON r.movie_id = m.movie_id ' +
    'FULL JOIN Collection c ON r.collection_id = c.collection_id ' +
    'WHERE rd.year = ' + year + 'AND ' + 
    'LOWER(pd.name) LIKE LOWER(\'%' + company + '%\') ' +
    'GROUP BY pd.company_id, c.collection_id ' +
    'ORDER BY pd.name, SUM(r.revenue) DESC';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;
      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('dice', {
          title: 'Dice',

          // options for years
          years: years.rows,

          results: results.rows,

          isResults: true,
          results: results.rows,
          offset: 0
        });
      });
    });
  },

  // no need for post since no user input naman?

  /** postDrillDown: function (req, res) {
    var query = '';

    pool.query(query, (error, results) => {
      if (error) throw error;

      res.render('drilldown', {
        title: 'Drill-Down',

        isResults: true,
        results: results.rows,
        offset: 0
      });
  },

  postRollUp: function (req, res) {
    var query = '';

    pool.query(query, (error, results) => {
      if (error) throw error;

      res.render('rollup', {
        title: 'Roll Up',

        isResults: true,
        results: results.rows,
        offset: 0
      });
    });
  } */ 
  
};

module.exports = olapController;
