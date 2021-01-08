const router = require('express').Router();
const controller = require('../controllers/controller.js');
const queryController = require('../controllers/queryController.js');
const bodyparser = require('body-parser');

router.use(bodyparser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
  controller.getHome(req, res);
});

router.get('/top-10-highest-grossing-movies-by-year', (req, res) => {
  controller.getHighestGrossing(req, res);
});

router.post('/top-10-highest-grossing-movies-by-year', (req, res) => {
  queryController.postHighestGrossing(req, res);
});

router.get('/movie-info', (req, res) => {
  controller.getMovieInfo(req, res);
});

router.post('/movie-info', (req, res) => {
  queryController.postMovieInfo(req, res);
});

router.get('/total-movie-collection-earnings', (req, res) => {
  controller.getCollectionEarnings(req, res);
});

router.post('/total-movie-collection-earnings', (req, res) => {
  queryController.postCollectionEarnings(req, res);
});

router.get('/top-50-highest-rated-movies-by-year', (req, res) => {
  controller.getHighestRated(req, res);
});

router.post('/top-50-highest-rated-movies-by-year', (req, res) => {
  queryController.postHighestRated(req, res);
});

router.get('/top-50-similar-movies', (req, res) => {
  controller.getSimilarMovies(req, res);
});

router.post('/top-50-similar-movies', (req, res) => {
  queryController.postSimilarMovies(req, res);
});

router.get('/top-10-most-popular-genres-by-year', (req, res) => {
  controller.getPopularGenres(req, res);
});

router.post('/top-10-most-popular-genres-by-year', (req, res) => {
  queryController.postPopularGenres(req, res);
});

router.get('/top-50-highest-rated-movies-by-keywords', (req, res) => {
  controller.getHighestRatedByKeywords(req, res);
});

router.post('/top-50-highest-rated-movies-by-keywords', (req, res) => {
  queryController.postHighestRatedByKeywords(req, res);
});


module.exports = router;
