const { query, body } = require( 'express-validator' )

exports.validate = ( method ) => {

    switch ( method ) {
        case 'getTrade': {
            return []   
        }
    }
}