const Pool = require('pg').Pool;
require('dotenv').config();

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

//UPDATE
const pool = new Pool({
  user: process.env.RDS_USER,
  host: process.env.RDS_URL,
  database: process.env.RDS_DATABASE,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT
});

const olapController = {
  /** 1 TABLE QUERIES */

  getSlice: function (req, res) {
    
    res.render('slice', {
      title: 'Slice'
    });

  },

  postSlice: function (req, res) {
    var year = req.body.year;

    var query = '';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('slice', {
          title: 'Slice'
        });
      });
    });
  },

  getDice: function (req, res) {
    
    res.render('dice', {
      title: 'Dice'
    });
    
  },

  postDice: function (req, res) {
    var year = req.body.year;

    var query = '';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('dice', {
          title: 'Dice'
        });
      });
    });
  },

  getDrillDown: function (req, res) {
    
    res.render('drilldown', {
      title: 'Drill-Down'
    });
    
  },

  postDrillDown: function (req, res) {
    var year = req.body.year;

    var query = '';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('drilldown', {
          title: 'Drill-Down'
        });
      });
    });
  },

  getRollUp: function (req, res) {
    
    res.render('rollup', {
      title: 'Roll Up'
    });
    
  },

  postRollUp: function (req, res) {

    var query = '';

    pool.query(yearQuery, (error, years) => {
      if (error) throw error;

      pool.query(query, (error, results) => {
        if (error) throw error;

        res.render('rollup', {
          title: 'Roll Up'
        });
      });
    });
  }
  
};

module.exports = olapController;
