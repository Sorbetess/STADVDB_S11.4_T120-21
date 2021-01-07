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

  getHighestGrossing: function (req, res) {
    res.render('highest_grossing', {
      title: 'Top 10 Highest Grossing Movies by Year'
    });
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

  getCollectionEarnings: function (req, res) {
    res.render('collection_earnings', {
      title: 'Total Movie Collection Earnings'
    });
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
