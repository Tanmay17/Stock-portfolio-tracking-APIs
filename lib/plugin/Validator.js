const { body, param } = require( 'express-validator' )

exports.validate = ( method ) => {

    switch ( method ) {
        case 'addTrade': {
            return [
                body( 'type', 'Invalid type' ).isIn( [ 'BUY', 'SELL' ] ).isString().notEmpty(),
                body( 'tickerSymbol', 'Invalid Ticker Symbol' ).isString().notEmpty(),
                body( 'sharesQty', 'Invalid Shares Quantity' ).isInt( { min: 0 } ),
                body( 'price', 'Invalid Price' ).isFloat( { min: 0 } ),
            ]   
        }
        case 'removeTrade': {
            return [
                param( 'id', 'Invalid ID' ).isString().notEmpty()
            ]   
        }
        case 'updateTrade': {
            return [
                param( 'id', 'Invalid ID' ).isString().notEmpty(),
                body( 'type', 'Invalid type' ).isIn( [ 'BUY', 'SELL' ] ).isString().notEmpty(),
                body( 'tickerSymbol', 'Invalid Ticker Symbol' ).isString().notEmpty(),
                body( 'sharesQty', 'Invalid Shares Quantity' ).isInt( { min: 0 } ),
                body( 'price', 'Invalid Price' ).isFloat( { min: 0 } ),
            ]   
        }
    }
}