const express = require( 'express' );
const { Validator } = require( '../../lib/plugin' );
const { addTrade, removeTrade, updateTrade, fetchAllTrades, fetchPortfolio, fetchReturns } = require( './handler' );

const router = express.Router();

// To get the trade info.
router.post( '/trade', Validator.validate( 'addTrade' ), addTrade );
router.delete( '/trade/:id', Validator.validate( 'removeTrade' ), removeTrade );
router.put( '/trade/:id', Validator.validate( 'updateTrade' ), updateTrade );
router.get( '/trade', fetchAllTrades );
router.get( '/portfolio', fetchPortfolio );
router.get( '/returns', fetchReturns );

module.exports = router;