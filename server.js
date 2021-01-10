const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');

const app = express();
const port = 3000;

const indexRouter = require('./routes/index.js');

app.engine(
  'hbs',
  exphbs({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    stylesDir: path.join(__dirname, 'public/css'),
    helpers: {
      page: function (value, offset) {
        return parseInt(value) + parseInt(offset) + 1;
      },
      todate: function (value) {
        dateString = value.toUTCString();
        dateString = dateString.split(' ').slice(0, 4).join(' ');
        return dateString;
      },
      tomoney: function (value) {
        var formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        });

        if (value <= 0.0)
          return 'N/A'
        else
          return formatter.format(value);
      }
    }
  })
);

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use('/', indexRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
