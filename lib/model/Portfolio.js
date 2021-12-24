const mongoose = require( "mongoose" );

const PortfolioSchema = new mongoose.Schema( {

  tickerSymbol: {
    type: String,
    unique: true
  },

  avgBuyPrice: {
    type: Number,
    min: 0
  },

  sharesQty: {
    type: Number,
    min: 0
  },

  createdAt: {
    type: Number
  },

  updatedAt: {
    type: Number
  },

} );

module.exports = mongoose.model( "Portfolio", PortfolioSchema );