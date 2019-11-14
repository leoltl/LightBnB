const apiRoutes = require('./apiRoutes');
const userRoutes = require('./userRoutes');

const path = require('path');

const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// setup database connecton
const dbConnection = new Pool({
  host: 'localhost',
  username: 'vagrant',
  password: '123',
  database: 'lightbnb'
});
dbConnection.connect();

// /api/endpoints
const apiRouter = express.Router();
apiRoutes(apiRouter, dbConnection);
app.use('/api', apiRouter);

// /user/endpoints
const userRouter = express.Router();
userRoutes(userRouter, dbConnection);
app.use('/users', userRouter);

app.use(express.static(path.join(__dirname, '../public')));

app.get("/test", (req, res) => {
  res.send("🤗");
});

const port = process.env.PORT || 3000; 
app.listen(port, (err) => console.log(err || `listening on port ${port} 😎`));