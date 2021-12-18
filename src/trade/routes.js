const express = require( 'express' );
const { Validator } = require( '../../lib/plugin' );
const { get_trade_info } = require( './handler' );

const router = express.Router();

// To get the trade info.
router.get( '/trade', Validator.validate( 'getTrade' ), get_trade_info );

module.exports = router;