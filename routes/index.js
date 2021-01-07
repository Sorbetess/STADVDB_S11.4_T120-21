const router = require('express').Router();
const controller = require('../controllers/controller.js')

router.get('/', (req, res) => {
  controller.getHome(req, res);
});

router.get('/top-10-highest-grossing-movies-by-year', (req, res) => {
  controller.getHighestGrossing(req, res);
});

router.get('/popular-movies', (req, res) => {
  controller.getPopularMovies(req, res);
});

router.get('/total-movie-collection-earnings', (req, res) => {
  controller.getCollectionEarnings(req, res);
});

router.get('/highest-rated-movies-by-year', (req, res) => {
  controller.getHighestRated(req, res);
});

router.get('/top-50-similar-movies', (req, res) => {
  controller.getSimilarMovies(req, res);
});

router.get('/top-10-most-popular-genres-by-year', (req, res) => {
  controller.getPopularGenres(req, res);
});

router.get('/movie-info', (req, res) => {
  controller.getMovieInfo(req, res);
});

module.exports = router;
