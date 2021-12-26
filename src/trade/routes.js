const express = require( 'express' );
const { Validator } = require( '../../lib/plugin' );
const { addTrade, removeTrade, updateTrade, fetchAllTrades, fetchPortfolio, fetchReturns } = require( './handler' );

const router = express.Router();

/** To add a trade
    Request BODY =>
    {
        type: string,  // Support 'BUY' or 'SELL'
        tickerSymbol: string,
        sharesQty: integer, // non-negative integer
        price: float // non-negative value
    } 
*/
router.post( '/trade', Validator.validate( 'addTrade' ), addTrade );

/** To delete a trade on trade ID
    Accepts value in Params
    {
        id: string
    } 
*/
router.delete( '/trade/:id', Validator.validate( 'removeTrade' ), removeTrade );

/** To update a trade on trade ID
    Accepts value in Params
    {
        id: string
    } 

    Request BODY =>
    {
        type: string,  // Support 'BUY' or 'SELL'
        tickerSymbol: string,
        sharesQty: integer, // non-negative integer
        price: float // non-negative value
    }
*/
router.put( '/trade/:id', Validator.validate( 'updateTrade' ), updateTrade );

/** To Fetch all the trade */
router.get( '/trade', fetchAllTrades );

/** To Fetch all the Portfolio */
router.get( '/portfolio', fetchPortfolio );

/** To Fetch all the Returns */
router.get( '/returns', fetchReturns );

module.exports = router;