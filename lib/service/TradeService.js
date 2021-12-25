const { TradeHistoryModel, PortfolioModel } = require( '../model' );
const moment = require( 'moment' );

const tradeResult = async ( prevPortfolio, currTrade )=> {

    try {
        
        const { type, tickerSymbol } = currTrade;
        var tradeResult;
        var isValidTrade = true;
        
        console.log( `Checking trade validity for Ticker ( ${tickerSymbol} ) of type( ${type} )` );
        switch ( type ) {

            case 'BUY':
                tradeResult = await buyTrade( prevPortfolio, currTrade );
                break;

            case 'SELL':
                tradeResult = await sellTrade( prevPortfolio, currTrade );
                break;

        }
        console.log( `Checked trade validity for Ticker ( ${tickerSymbol} ) of type( ${type} )` );

        if ( tradeResult.sharesQty < 0 || tradeResult.avgBuyPrice < 0 ) isValidTrade = false;

        return { ...tradeResult, isValidTrade };

    } catch (error) {
        
        throw error;

    }
           
}

const buyTrade = async ( prevPortfolio, currTrade )=> {

    try {

        const result = {};
        const currHoldingSum = prevPortfolio.sharesQty * prevPortfolio.avgBuyPrice;
        const wannaBuySum = Number.parseInt( currTrade.sharesQty ) * Number.parseFloat( currTrade.price );
        result[ 'sharesQty' ] = prevPortfolio.sharesQty + Number.parseInt( currTrade.sharesQty );
        result[ 'avgBuyPrice' ] = ( currHoldingSum + wannaBuySum ) / result[ 'sharesQty' ];

        return result;

    } catch ( error ) {
        
        throw error;

    }
    
}

const sellTrade = async ( prevPortfolio, currTrade )=> {

    try {
console.log(prevPortfolio, currTrade)
        const result = {};
        result[ 'sharesQty' ] = prevPortfolio.sharesQty - Number.parseInt( currTrade.sharesQty );
        result[ 'avgBuyPrice' ] = prevPortfolio.avgBuyPrice;
        return result;

    } catch ( error ) {
        
        throw error;

    }
    
}

const addTrade = async ( data )=> {

    try {
        
        const { tickerSymbol, type, price, sharesQty } = data;

        // Checking existing portfolio for particular tickerSymbol
        console.log( `Portfolio for Ticker( ${tickerSymbol} ) exists?` );
        const existingTickerPortfolio = await PortfolioModel.findOne( { tickerSymbol } );

        if ( existingTickerPortfolio ) {

            console.log( `Portfolio for Ticker( ${tickerSymbol} ) already exists` );

            // calculate and shouldn't be -ve
            console.log( `Checking impact on portfolio, if Ticker( ${tickerSymbol} ) trade happens` );
            const tradeImpact = await tradeResult( existingTickerPortfolio, data );
        
            if ( !tradeImpact.isValidTrade ) {
            
                console.error( `Ticker( ${tickerSymbol} ) trade is not valid` );
                throw new Error( 'Invalid trade' );

            } 

            // save in trade history
            console.log( `Adding trade history of ticker( ${tickerSymbol} )` );
            await TradeHistoryModel.insertMany( [ { ...data, createdAt: moment().unix(), updatedAt: moment().unix() } ] );
            console.log( `Added trade history of ticker( ${tickerSymbol} )` );

            // save in portfolio
            console.log( `Updating portfolio after the trade of ticker( ${tickerSymbol} )` );
            await PortfolioModel.updateOne( { tickerSymbol }, { 
                sharesQty: tradeImpact.sharesQty, 
                avgBuyPrice: tradeImpact.avgBuyPrice.toFixed(2) 
            } );
            console.log( `Updated portfolio after the trade of ticker( ${tickerSymbol} )` );
        

        } else if ( !existingTickerPortfolio && type === 'BUY' ) {

            console.log( `Portfolio for Ticker( ${tickerSymbol} ) doesn't exists` );

            // calculate and shouldn't be -ve
            console.log( `Checking impact on portfolio, if Ticker( ${tickerSymbol} ) trade happens` );
            const tradeImpact = await tradeResult( {
                sharesQty: 0,
                avgBuyPrice: 0
            }, data );
        
            if ( !tradeImpact.isValidTrade ) {
            
                console.error( `Ticker( ${tickerSymbol} ) trade is not valid` );
                throw new Error( 'Invalid trade' );

            } 

            // save in trade history
            console.log( `Adding trade history of ticker( ${tickerSymbol} )` );
            await TradeHistoryModel.insertMany( [ { ...data, createdAt: moment().unix(), updatedAt: moment().unix() } ] );
            console.log( `Added trade history of ticker( ${tickerSymbol} )` );

            // save in portfolio 
            console.log( `Adding portfolio after the trade of ticker( ${tickerSymbol} )` );
            await PortfolioModel.insertMany( [ { 
                tickerSymbol, 
                sharesQty: tradeImpact.sharesQty, 
                avgBuyPrice: tradeImpact.avgBuyPrice.toFixed(2), 
                createdAt: moment().unix(), 
                updatedAt: moment().unix() 
            } ] );
            console.log( `Added portfolio after the trade of ticker( ${tickerSymbol} )` );

        } else if ( !existingTickerPortfolio && type === 'SELL' ) {

            throw new Error( 'Nothing to sell any shares for this Ticker' );

        }
        
        console.log( `Fetching added trade of Ticker( ${tickerSymbol} )` );
        const updatedTrade = await TradeHistoryModel.find( { tickerSymbol, type, price, sharesQty } ).sort( { 'createdAt': -1 } ).limit(1);
        console.log( `Fetched added trade of Ticker( ${tickerSymbol} )` );

        return updatedTrade;

    } catch ( error ) {
        
        throw error;

    }
    
}

const calculateTickerPortfolioOnTradeHistory = async ( tickerSymbol, tradeData, isUpdate=false )=> {
    
    try {

        console.log( `Checking Trade History for Ticker( ${ tickerSymbol } )` );
        const tickerTradeHistory = await TradeHistoryModel.find( { tickerSymbol } );
        console.log( `Checked Trade History for Ticker( ${ tickerSymbol } )` );

        // doing this because I'm not sure about the formula.
        const newPortfolio = {
            sharesQty: 0,
            avgBuyPrice: 0
        }

        console.log( `Calculating portfolio for Ticker( ${ tickerSymbol } ) when isUpdate( ${isUpdate} )` );
        for ( let i=0; i<tickerTradeHistory.length; i++ ) {

            let tickerTrade = tickerTradeHistory[i];
            const { _id } = tickerTrade;

            if ( !isUpdate && _id.toString() === tradeData._id.toString() ) continue;
            if ( isUpdate && _id.toString() === tradeData._id ) tickerTrade = tradeData;

            var tradeResult;
            switch ( tickerTrade.type ) {
                case 'BUY':
                    tradeResult = await buyTrade( newPortfolio, tickerTrade );
                    break;
    
                case 'SELL':
                    if ( tickerTradeHistory.length == 1 ) {
                        console.log( `Fetching Portfolio for Ticker( ${tickerTrade.tickerSymbol} )` );
                        const port = await PortfolioModel.findOne( { tickerSymbol: tickerTrade.tickerSymbol } );
                        console.log( `Fetched Portfolio for Ticker( ${tickerTrade.tickerSymbol} )` );
                        newPortfolio[ 'sharesQty' ] = port.sharesQty;
                        newPortfolio[ 'avgBuyPrice' ] = port.avgBuyPrice;
                    }
                    tradeResult = await sellTrade( newPortfolio, tickerTrade );
                    break;
    
            }
            newPortfolio[ 'sharesQty' ] = tradeResult.sharesQty;
            newPortfolio[ 'avgBuyPrice' ] = tradeResult.avgBuyPrice;
            
        }
        console.log( `Calculated portfolio for Ticker( ${ tickerSymbol } ) when isUpdate( ${isUpdate} )` );

        return newPortfolio;
    
    } catch ( error ) {
        
        throw error;

    }

}

const resetTrade = async ( trade ) => {

    try {

        var response;
        console.log( `Checking Trade( ${ trade } ) exists?` );
        const tradeData = await TradeHistoryModel.findById( trade );

        if ( !tradeData ) {

            console.error( `Trade( ${trade} ) doesn't exists` );
            throw new Error( 'Cannot reset this trade as we have no records of it.' );
        
        }
        console.log( `Trade( ${ trade } ) exists` );

        const { tickerSymbol } = tradeData;
        console.log( `Re-calculating the portfolio if trade( ${trade} ) is resetted` );
        const updatedPortfolioHistory = await calculateTickerPortfolioOnTradeHistory( tickerSymbol, tradeData );
        console.log( `Re-calculated the portfolio if trade( ${trade} ) is resetted` );

        console.log( `Checking if this a valid trade( ${trade} ) to be resetted?` );
        if ( updatedPortfolioHistory.sharesQty < 0 || updatedPortfolioHistory.avgBuyPrice < 0 ) {

            console.error( `Cannot make reset this Trade( ${trade} )` );
            throw new Error( 'Cannot reset this Trade as it is either making shares quantity or avg Buy Price to negative' );       

        }
        console.log( `Trade( ${trade} ) can be resetted` );

        if ( updatedPortfolioHistory.sharesQty == 0 ) {
            
            console.log( `Deleting Ticker( ${ tickerSymbol } ) from Portfolio` );
            const { deletedCount } = await PortfolioModel.deleteOne( { tickerSymbol } );

            if ( !deletedCount ) {

                console.error( `Cannot delete portfolio of this Ticker( ${tickerSymbol} )` );
                throw new Error( 'Unable to delete ticker from the Portfolio' );

            }
            console.log( `Deleted Ticker( ${ tickerSymbol } ) from Portfolio` );

        } else {

            console.log( `Updating Ticker( ${ tickerSymbol } ) from Portfolio` );
            const updatedData = await PortfolioModel.updateOne( { tickerSymbol }, { sharesQty: updatedPortfolioHistory.sharesQty, avgBuyPrice: updatedPortfolioHistory.avgBuyPrice.toFixed(2), updatedAt: moment().unix() } );

            if ( !updatedData ) {

                console.error( `Unable to update the portfolio from this Ticker( ${tickerSymbol} )` );
                throw new Error( 'Unable to update ticker in the Portfolio' );

            }
            console.log( `Updated Ticker( ${ tickerSymbol } ) in Portfolio` );

            console.log( `Deleting Trade( ${ trade } ) history` );
            response = await TradeHistoryModel.deleteOne( { _id: trade } );

            if ( !response.deletedCount ) {

                console.error( `Unable to delete the Trade( ${trade} )` );
                throw new Error( 'Unable to delete the trade' );

            }
            console.log( `Deleted Trade( ${ trade } ) history` );

        }

        return response;
        
    } catch ( error ) {
        
        throw error;

    }
    
}

const updateTrade = async ( id, data ) => {

    try {
        
        console.log( `Checking trade( ${id} ) exists?` );
        const existingTrade = await TradeHistoryModel.findById( id );
        if ( !existingTrade ) {

            console.error( `Trade( ${id} ) doesn't exists to be updated` );
            throw new Error( 'Trade does not exist' );

        }
        console.log( `Trade( ${id} ) exists` );

        console.log( `Re-calculating the portfolio if trade( ${ id } ) is resetted` );
        const updatedPortfolioHistory = await calculateTickerPortfolioOnTradeHistory( data.tickerSymbol, { ...data, _id: id }, true );
        console.log( `Re-calculated the portfolio if trade( ${ id } ) is resetted` );

        console.log( `Checking if this a valid trade( ${ id } ) to be updated?` );
        if ( updatedPortfolioHistory.sharesQty < 0 || updatedPortfolioHistory.avgBuyPrice < 0 ) {

            console.error( `Cannot update this Trade( ${ id } )` );
            throw new Error( 'Cannot update this Trade as it is either making shares quantity or avg Buy Price to negative' );       

        }
        console.log( `Trade( ${ id } ) can be updated` );

        console.log( `Updating Ticker( ${ data.tickerSymbol } ) from Portfolio` );
        console.log(updatedPortfolioHistory)
        const updatedData = await PortfolioModel.updateOne( { tickerSymbol: data.tickerSymbol }, { sharesQty: updatedPortfolioHistory.sharesQty, avgBuyPrice: updatedPortfolioHistory.avgBuyPrice.toFixed(2), updatedAt: moment().unix() } );

        if ( !updatedData ) {

            console.error( `Unable to update the portfolio from this Ticker( ${data.tickerSymbol} )` );
            throw new Error( 'Unable to update ticker in the Portfolio' );

        }
        console.log( `Updated Ticker( ${ data.tickerSymbol } ) in Portfolio` );

        console.log( `Updating Trade( ${ id } ) history` );
        const tradeHistoryData = await TradeHistoryModel.updateOne( { _id: id }, data );

        if ( !tradeHistoryData ) {

            console.error( `Unable to update the Trade( ${id} )` );
            throw new Error( 'Unable to update the trade' );

        }
        console.log( `Updated Trade( ${ id } ) history` );

        return tradeHistoryData;

    } catch ( error ) {
        
        throw error;

    }

}

const getAllTrades = async () => {

    try {

        console.log( `Fetching all trades` );
        const tradesData = await TradeHistoryModel.find();
        
        if ( !tradesData ) {

            console.error( `No Trades exists` );
            throw new Error( 'No Trade exists' );

        }
        console.log( `Fetched all trades` );

        var response = {};
        tradesData.forEach( ( tradeData )=> {

            if ( !response[ tradeData.tickerSymbol ] ) response[ tradeData.tickerSymbol ] = [ tradeData ];
            else response[ tradeData.tickerSymbol ].push( tradeData );

        } );

        return response;
        
    } catch ( error ) {
        
        throw error;

    }
}

const getPortfolio = async () => {

    try {

        console.log( `Fetching Portfolio` );
        const portfolioData = await PortfolioModel.find();
        if ( !portfolioData ) {

            console.error( `No Portfolio exists` );
            throw new Error( 'No Portfolio exists' );

        }
        console.log( `Fetched portfolio` );

        return portfolioData;
        
    } catch ( error ) {
        
        throw error;

    }

}

const getReturns = async () => {

    try {

        var returns = 0;
        const portfolioData = await getPortfolio();
        
        console.log( 'Calculating returns' );
        portfolioData.forEach( ( data )=> {
            returns += ( 100 - data.avgBuyPrice ) * data.sharesQty;
        } );
        console.log( 'Calculated returns' );

        return returns;
        
    } catch ( error ) {
        
        throw error;

    }

}

module.exports = {

    addTrade,
    resetTrade,
    updateTrade,
    getAllTrades,
    getPortfolio,
    getReturns

};