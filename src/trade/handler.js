const { Service: { TradeService } } = require( '../../lib' );

const addTrade = async ( req, res ) => {
  try {
    const { tickerSymbol, sharesQty, type } = req.body;
  
    console.log( `POST /trade => Adding trade of ${sharesQty} Ticker( ${tickerSymbol} ) type: ${type}` );

    console.log( `POST /trade => Adding Ticker( ${tickerSymbol} ) in portfolio` );
    const trade = await TradeService.addTrade( req.body );
    if ( !trade ) {

      console.error( `POST /trade => Some error occured while adding trade for Ticker( ${tickerSymbol} ) of type: ${type}` );
      return res.send( { message: 'Unable to add the ticker' } ).sendStatus( 422 );

    }
    console.log( `POST /trade => Added trade of ${sharesQty} Ticker( ${tickerSymbol} ) type: ${type}` );

    return res.sendStatus( 200 ).send( trade );

  } catch (err) {

    console.error( 'POST /trade =>', err.message );
    res.sendStatus( 500 );

  }
};

const removeTrade = async ( req, res ) => {
  try {

    const tradeId = req.params.id;

    console.log( `DELETE /trade/:id => Deleting trade( ${tradeId} )` );
    const deletedTrade = await TradeService.resetTrade( tradeId );

    if (!deletedTrade) {

      console.error( `DELETE /trade/:id => Some error occured while deleting trade( ${tradeId} )` );
      return res.send( { message: 'Unable to delete the trade' } ).sendStatus( 422 );
    
    }
    console.log( `DELETE /trade/:id => Deleted trade( ${tradeId} )` );
    
    return res.sendStatus( 200 ).send( deletedTrade );
  
  } catch ( err ) {

    console.error( 'DELETE /trade/:id =>', err.message );
    res.sendStatus( 500 );

  }
};

const updateTrade = async ( req, res ) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log( `PUT /trade/:id => Updating Trade( ${ id } )` );
    const updatedTrade = await TradeService.updateTrade( id, data );
    console.log( `PUT /trade/:id => Updated Trade( ${ id } )` );

    if ( !updatedTrade ) {

      console.error( `PUT /trade/:id => Some error occured while updating trade( ${id} )` );
      return res.send( { message: 'Unable to update the trade' } ).sendStatus( 422 );

    }

    return res.status( 200 ).json( updatedTrade );

  } catch ( err ) {

    console.error( 'PUT /trade/:id =>', err.message );
    res.sendStatus( 500 );

  }
};

const fetchAllTrades = async ( req, res ) => {
  
  try {

    console.log( `GET /trade => Fetching Trade` );
    const tradesData = await TradeService.getAllTrades();
    console.log( `GET /trade => Fetched Trade` );

    if ( !tradesData ) {

      console.error( `GET /trade => Some error occured while fetching trades` );
      return res.send( { message: 'Unable to fetch trades' } ).sendStatus( 422 );

    }

    return res.status( 200 ).json( tradesData );
    
  } catch ( err ) {

    console.error( 'GET /trade =>', err.message );
    res.sendStatus( 500 );

  }
}

const fetchPortfolio = async ( req, res ) => {
  
  try {

    console.log( `GET /portfolio => Fetching portfolio` );
    const portfolioData = await TradeService.getPortfolio();
    console.log( `GET /portfolio => Fetched portfolio` );

    if ( !portfolioData ) {

      console.error( `GET /portfolio => Some error occured while fetching portfolio` );
      return res.send( { message: 'Unable to fetch portfolio' } ).sendStatus( 422 );

    }

    return res.status( 200 ).json( portfolioData );
    
  } catch ( err ) {

    console.error( 'GET /portfolio =>', err.message );
    res.sendStatus( 500 );

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
    res.sendStatus( 500 );

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