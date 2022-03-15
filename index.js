const express = require( 'express' );
const mongoose = require( 'mongoose' );
const bodyParser = require( 'body-parser' );
const port = process.env.PORT || 3000;
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/portfolio';

const app = express()
const routes = require( './src/trade/routes' );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

app.use( '/', routes );

mongoose
  .connect( mongoURL )
  .then( () => {
    app.listen( port, () => {
      console.log( `Server is listening on port ${ port }` );
    } );
  } );

module.exports = {
    app
}
