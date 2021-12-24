const mongoose = require("mongoose");

const TradeHistorySchema = new mongoose.Schema( {

  tickerSymbol: {
    type: String,
    unique: true
  },

  price: {
    type: Number,
    min: 0
  },

  sharesQty: {
    type: Number,
    min: 0
  },

  type: {
    type: String,
    enum : [ 'BUY','SELL' ],
  },

  createdAt: {
    type: Number,
    min: 0
  },

  updatedAt: {
    type: Number,
    min: 0
  },

} );

module.exports = mongoose.model( "TradeHistory", TradeHistorySchema );