const { TradeHistoryModel, PortfolioModel } = require( "../model" );
const moment = require( 'moment' );
const { response } = require("express");

module.exports = {

    buyTrade: async ( prevPortfolio, currTrade )=> {

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
        
    },

    sellTrade: async ( prevPortfolio, currTrade )=> {

        try {

            const result = {};
            result[ 'sharesQty' ] = prevPortfolio.sharesQty - Number.parseInt( currTrade.sharesQty );
            result[ 'avgBuyPrice' ] = prevPortfolio.avgBuyPrice;
            return result;

        } catch ( error ) {
            
            throw error;

        }
        
    },

    addTrade: async ( data )=> {

        try {
            
            const { tickerSymbol, type } = data;
            var responseTrade;

            // Checking existing portfolio for particular tickerSymbol
            console.log( `Portfolio for Ticker( ${tickerSymbol} ) exists?` );
            const existingTickerPortfolio = await PortfolioModel.findOne( { tickerSymbol } );

            if ( existingTickerPortfolio ) {

                console.log( `Portfolio for Ticker( ${tickerSymbol} ) already exists` );

                // calculate and shouldn't be -ve
                console.log( `Checking impact on portfolio, if Ticker( ${tickerSymbol} ) trade happens` );
                const tradeImpact = await this.tradeResult( existingTickerPortfolio, data );
            
                if ( !tradeImpact.isValidTrade ) {
                
                    console.error( `Ticker( ${tickerSymbol} ) trade is not valid` );
                    throw new Error( 'Invalid trade' );

                } 

                // save in trade history
                console.log( `Adding trade history of ticker( ${tickerSymbol} )` );
                responseTrade = await TradeHistoryModel.insert( { ...data, createdAt: moment().unix(), updatedAt: moment().unix() } );
                console.log( `Added trade history of ticker( ${tickerSymbol} )` );

                // save in portfolio
                console.log( `Updating portfolio after the trade of ticker( ${tickerSymbol} )` );
                await PortfolioModel.updateOne( { tickerSymbol }, { 
                    sharesQty: tradeImpact.sharesQty, 
                    avgBuyPrice: tradeImpact.avgBuyPrice 
                } );
                console.log( `Updated portfolio after the trade of ticker( ${tickerSymbol} )` );
            

            } else if ( !existingTickerPortfolio && type === 'BUY' ) {

                console.log( `Portfolio for Ticker( ${tickerSymbol} ) doesn't exists` );

                // calculate and shouldn't be -ve
                console.log( `Checking impact on portfolio, if Ticker( ${tickerSymbol} ) trade happens` );
                const tradeImpact = await this.tradeResult( {
                    sharesQty: 0,
                    avgBuyPrice: 0
                }, data );
            
                if ( !tradeImpact.isValidTrade ) {
                
                    console.error( `Ticker( ${tickerSymbol} ) trade is not valid` );
                    throw new Error( 'Invalid trade' );

                } 

                // save in trade history
                console.log( `Adding trade history of ticker( ${tickerSymbol} )` );
                responseTrade = await TradeHistoryModel.insert( { ...data, createdAt: moment().unix(), updatedAt: moment().unix() } );
                console.log( `Added trade history of ticker( ${tickerSymbol} )` );

                // save in portfolio 
                console.log( `Adding portfolio after the trade of ticker( ${tickerSymbol} )` );
                await PortfolioModel.insert( { 
                    tickerSymbol, 
                    sharesQty: tradeImpact.sharesQty, 
                    avgBuyPrice: tradeImpact.avgBuyPrice, 
                    createdAt: moment().unix(), 
                    updatedAt: moment().unix() 
                } );
                console.log( `Added portfolio after the trade of ticker( ${tickerSymbol} )` );

            } else if ( !existingTickerPortfolio && type === 'SELL' ) {

                throw new Error( 'Nothing to sell any shares for this Ticker' );

            }
        
            return responseTrade;

        } catch (error) {
            
            throw error;

        }
        
    },

    tradeResult: async ( prevPortfolio, currTrade )=> {

        try {

            const { type, tickerSymbol } = currTrade;
            var tradeResult;
            var isValidTrade = true;
            
            console.log( `Checking trade validity for Ticker ( ${tickerSymbol} ) of type( ${type} )` );
            switch ( type ) {

                case 'BUY':
                    tradeResult = await this.buyTrade( prevPortfolio, currTrade );
                    break;

                case 'SELL':
                    tradeResult = await this.sellTrade( prevPortfolio, currTrade );
                    break;

            }
            console.log( `Checked trade validity for Ticker ( ${tickerSymbol} ) of type( ${type} )` );

            if ( tradeResult.sharesQty < 0 || tradeResult.avgBuyPrice < 0 ) isValidTrade = false;

            return { ...tradeResult, isValidTrade };

        } catch (error) {
            
            throw error;

        }
               
    },

    calculateTickerPortfolioOnTradeHistory: async ( tickerSymbol, tradeData, isUpdate=false )=> {
        
        try {

            console.log( `Checking Trade History for Ticker( ${ tickerSymbol } )` );
            const tickerTradeHistory = await TradeHistoryModel.find( { tickerSymbol } );
            console.log( `Checked Trade History for Ticker( ${ tickerSymbol } )` );

            // doing this because I'm not sure about the formula.
            const newPortfolioAfterReset = {
                sharesQty: 0,
                avgBuyPrice: 0
            }

            console.log( `Calculating portfolio for Ticker( ${ tickerSymbol } ) when isUpdate( ${isUpdate} )` );
            tickerTradeHistory.forEach( ( tickerTrade )=> {

                const { type, _id } = tickerTrade;

                if ( !isUpdate && _id === tradeid.toString() ) continue;
                if ( isUpdate && _id === tradeData._id.toString() ) tickerTrade = tradeData;


                var tradeResult;
                switch ( type ) {
                    case 'BUY':
                        tradeResult = await this.buyTrade( newPortfolioAfterReset, tickerTrade );
                        break;
        
                    case 'SELL':
                        tradeResult = await this.sellTrade( newPortfolioAfterReset, tickerTrade );
                        break;
        
                }
                newPortfolioAfterReset[ 'sharesQty' ] = tradeResult.sharesQty;
                newPortfolioAfterReset[ 'avgBuyPrice' ] = tradeResult.avgBuyPrice;
                
            } );
            console.log( `Calculated portfolio for Ticker( ${ tickerSymbol } ) when isUpdate( ${isUpdate} )` );

            return newPortfolioAfterReset;
        
        } catch ( error ) {
            
            throw error;

        }

    },

    resetTrade: async ( trade ) => {

        try {

            var response;
            console.log( `Checking Trade( ${ trade } ) exists?` );
            const tradeData = await TradeHistoryModel.findById( trade );

            if ( !trade ) {
                console.error( `Trade( ${trade} ) doesn't exists` );
                throw new Error( 'Cannot reset this trade as we have no records of it.' );
            }
            console.log( `Trade( ${ trade } ) exists` );

            const { tickerSymbol } = tradeData;
            console.log( `Re-calculating the portfolio if trade( ${trade} ) is resetted` );
            const updatedPortfolioHistory = await this.calculateTickerPortfolioOnTradeHistory( tickerSymbol, tradeData );
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
                const updatedData = await PortfolioModel.updateOne( { tickerSymbol }, { sharesQty, avgBuyPrice, updatedAt: moment().unix() } );

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
        
    },

    updateTrade: async ( id, data ) => {

        try {
            
            console.log( `Checking trade( ${id} ) exists?` );
            const existingTrade = await TradeHistoryModel.findById( id );
            if ( !existingTrade ) {

                console.error( `Trade( ${id} ) doesn't exists to be updated` );
                throw new Error( 'Trade does not exist' );

            }
            console.log( `Trade( ${id} ) exists` );

            console.log( `Re-calculating the portfolio if trade( ${trade} ) is resetted` );
            const updatedPortfolioHistory = await this.calculateTickerPortfolioOnTradeHistory( data.tickerSymbol, tradeData, true );
            console.log( `Re-calculated the portfolio if trade( ${trade} ) is resetted` );

            console.log( `Checking if this a valid trade( ${trade} ) to be updated?` );
            if ( updatedPortfolioHistory.sharesQty < 0 || updatedPortfolioHistory.avgBuyPrice < 0 ) {

                console.error( `Cannot update this Trade( ${trade} )` );
                throw new Error( 'Cannot update this Trade as it is either making shares quantity or avg Buy Price to negative' );       

            }
            console.log( `Trade( ${trade} ) can be updated` );

            console.log( `Updating Ticker( ${ data.tickerSymbol } ) from Portfolio` );
            const updatedData = await PortfolioModel.updateOne( { tickerSymbol: data.tickerSymbol }, { sharesQty, avgBuyPrice, updatedAt: moment().unix() } );

            if ( !updatedData ) {

                console.error( `Unable to update the portfolio from this Ticker( ${tickerSymbol} )` );
                throw new Error( 'Unable to update ticker in the Portfolio' );

            }
            console.log( `Updated Ticker( ${ tickerSymbol } ) in Portfolio` );

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

    },

    getAllTrades: async () => {

        try {

            console.log( `Fetching all trades` );
            const tradesData = await TradeHistoryModel.find();
            
            if ( !tradesData ) {

                console.error( `No Trades exists` );
                throw new Error( 'No Trade exists' );

            }
            console.log( `Fetched all trades` );

            const response = {};
            tradesData.forEach( ( tradeData )=> {

                response[ tradesData.tickerSymbol ] = ( !response[ tradeData.tickerSymbol ] ) ? [ tradeData ] : response[ tradeData.tickerSymbol ].push( tradeData );

            } );

            return response;
            
        } catch ( error ) {
            
            throw error;

        }
    },

    getPortfolio: async () => {

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

    },

    getReturns: async () => {

        try {

            var returns = 0;
            const portfolioData = await this.getPortfolio();
            
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


};