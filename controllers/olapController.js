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

    var query = 'SELECT rd.year, rd.quarter, pd.name AS Company, SUM(r.revenue) AS Total_Revenue ' +
    'FROM Revenue r, Release_Date rd, Production_Company pd, Movie m ' +
    'WHERE r.release_id = rd.release_id AND ' +
    'r.company_id = pd.company_id AND ' +
    'r.movie_id = m.movie_id AND ' +
    'rd.year = ' + year + ' ' +
    'GROUP BY pd.company_id, pd.name, rd.year, rd.quarter ' +
    'ORDER BY pd.company_id, rd.year, rd.quarter, Total_Revenue desc';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('slice', {
          title: 'Slice',

          // options for years
          years: years.rows,

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

    var companyQuery = 'SELECT pd.name AS company FROM Production_Company ORDER BY Company DESC';

    var query = 'SELECT rd.year, pd.name AS Company, ROUND(SUM(r.revenue), 2) AS Total_Revenue ' +
    'FROM Revenue r, Release_Date rd, Production_Company pd, Movie m ' +
    'WHERE r.release_id = rd.release_id AND ' +
    'r.company_id = pd.company_id AND ' +
    'r.movie_id = m.movie_id AND ' +
    'rd.year =' + year + ' AND ' +
    'LOWER(pd.name) LIKE LOWER(\'%' + company + '%\') ' +
    'GROUP BY rd.year, pd.company_id ' +
    'ORDER BY SUM(r.revenue) desc';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(companyQuery, (error, companies) => {
        if (error) throw error;

        pool.query(query, (error, results) => {
          if (error) throw error;
  
          res.render('dice', {
            title: 'Dice',

            // options for years and rows
            years: years.rows,
            companies: comapnies.rows,

            isResults: true,
            results: results.rows,
            offset: 0
          });
        });

      })
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
