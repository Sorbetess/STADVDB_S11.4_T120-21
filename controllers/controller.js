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
    res.render('highest_grossing', {
      title: 'Top 10 Highest Grossing Movies By Year'
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
      title: 'Highest Rated Movies by Year'
    });
  },

  getHighestRated: function (req, res) {
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

  getPopularGenres: function (req, res) {
    res.render('popular_genres', {
      title: 'Most Popular Genres in the Year'
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
