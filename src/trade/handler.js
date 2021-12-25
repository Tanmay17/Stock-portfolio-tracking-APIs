const { Service: { TradeService } } = require( '../../lib' );
const { validationResult } = require( 'express-validator' );

const addTrade = async ( req, res ) => {

  const errors = validationResult( req );

  if ( !errors.isEmpty() ) {
        
    return res.status( 400 ).json( { errors: errors.array() } );
        
  }
  
  try {
    const { tickerSymbol, sharesQty, type } = req.body;
  
    console.log( `POST /trade => Adding trade of ${sharesQty} Ticker( ${tickerSymbol} ) type: ${type}` );

    console.log( `POST /trade => Adding Ticker( ${tickerSymbol} ) in portfolio` );
    const trade = await TradeService.addTrade( req.body );
    if ( !trade ) {

      console.error( `POST /trade => Some error occured while adding trade for Ticker( ${tickerSymbol} ) of type: ${type}` );
      return res.status( 422 ).json( { message: 'Unable to add the ticker' } );

    }
    console.log( `POST /trade => Added trade of ${sharesQty} Ticker( ${tickerSymbol} ) type: ${type}` );

    return res.status( 200 ).json( { data: trade } );

  } catch ( err ) {

    console.error( 'POST /trade =>', err.message );
    return res.status( 500 );

  }
};

const removeTrade = async ( req, res ) => {

  const errors = validationResult( req );

  if ( !errors.isEmpty() ) {
        
    return res.status( 400 ).json( { errors: errors.array() } );
        
  }

  try {

    const tradeId = req.params.id;

    console.log( `DELETE /trade/:id => Deleting trade( ${tradeId} )` );
    const deletedTrade = await TradeService.resetTrade( tradeId );

    if (!deletedTrade) {

      console.error( `DELETE /trade/:id => Some error occured while deleting trade( ${tradeId} )` );
      return res.status( 422 ).json( { message: 'Unable to delete the trade' } );
    
    }
    console.log( `DELETE /trade/:id => Deleted trade( ${tradeId} )` );
    
    return res.status( 200 ).json( { data: deletedTrade } );
  
  } catch ( err ) {

    console.error( 'DELETE /trade/:id =>', err.message );
    return res.status( 500 );

  }
};

const updateTrade = async ( req, res ) => {

  const errors = validationResult( req );

  if ( !errors.isEmpty() ) {
        
    return res.status( 400 ).json( { errors: errors.array() } );
        
  }

  try {
    const { id } = req.params;
    const data = req.body;

    console.log( `PUT /trade/:id => Updating Trade( ${ id } )` );
    const updatedTrade = await TradeService.updateTrade( id, data );
    console.log( `PUT /trade/:id => Updated Trade( ${ id } )` );

    if ( !updatedTrade ) {

      console.error( `PUT /trade/:id => Some error occured while updating trade( ${id} )` );
      return res.status( 422 ).json( { message: 'Unable to update the trade' } );

    }

    return res.status( 200 ).json( { data: updatedTrade } );

  } catch ( err ) {

    console.error( 'PUT /trade/:id =>', err.message );
    return res.status( 500 );

  }
};

const fetchAllTrades = async ( req, res ) => {
  
  try {

    console.log( `GET /trade => Fetching Trade` );
    const tradesData = await TradeService.getAllTrades();
    console.log( `GET /trade => Fetched Trade` );

    if ( !tradesData ) {

      console.error( `GET /trade => Some error occured while fetching trades` );
      return res.status( 422 ).json( { message: 'Unable to fetch trades' } );

    }

    return res.status( 200 ).json( { data: tradesData } );
    
  } catch ( err ) {

    console.error( 'GET /trade =>', err.message );
    return res.status( 500 );

  }
}

const fetchPortfolio = async ( req, res ) => {
  
  try {

    console.log( `GET /portfolio => Fetching portfolio` );
    const portfolioData = await TradeService.getPortfolio();
    console.log( `GET /portfolio => Fetched portfolio` );

    if ( !portfolioData ) {

      console.error( `GET /portfolio => Some error occured while fetching portfolio` );
      return res.status( 422 ).json( { message: 'Unable to fetch portfolio' } );

    }

    return res.status( 200 ).json( { data: portfolioData } );
    
  } catch ( err ) {

    console.error( 'GET /portfolio =>', err.message );
    return res.status( 500 );

  }
}

const fetchReturns = async ( req, res ) => {
  
  try {

    console.log( `GET /returns => Fetching returns` );
    const returns = await TradeService.getReturns();
    console.log( `GET /returns => Fetched returns` );

    return res.status( 200 ).json( { returns } );
    
  } catch ( err ) {

    console.error( 'GET /returns =>', err.message );
    return res.status( 500 );

  }
}

module.exports = {

  addTrade,
  updateTrade,
  removeTrade,
  fetchAllTrades,
  fetchPortfolio,
  fetchReturns

}