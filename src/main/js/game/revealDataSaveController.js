/**
 * @module control reveal data
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/SKBeInstant/SKBeInstant'
],function(msgBus, SKBeInstant){
	
	var revealData = {
		revealDataSave:'',
		wagerDataSave:'',
		spots:0,
		amount:0
	};
	var ticketId;
	var prizePoint;
	var configArray;
	
	/*function getPrizeTable(){
		for(var i = 0;i<configArray.length;i++){
			if(Number(configArray[i].price) === Number(prizePoint)){
				prizeTable = configArray[i].prizeTable;
				break;
			}
		}
	}*/
	
	function onGameParametersUpdated(){
		configArray = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
		prizePoint = SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault;
		// getPrizeTable();
	}
	
	function onTicketCostChanged(price){
		prizePoint = price;
        // getPrizeTable();
    }
	
	function onStartUserInteraction(data){
		ticketId = data.ticketId||data.scenario;
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var targetData = getRevealDataFromResponse(data);
			if(targetData){
				revealData.revealDataSave = {};
				revealData.revealDataSave[ticketId] = targetData;
				/*if(targetData.prizeTable){
					prizeTable = targetData.prizeTable;
				}*/
				if(targetData.prizePoint){
					prizePoint = targetData.prizePoint;
				}
				return;
			}
		}
		setEmptyRevealDataSave(data);
	}
	
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}
	
	function onReStartUserInteraction(data){
		ticketId = data.ticketId||data.scenario;
		setEmptyRevealDataSave(data);
	}
	
	function setEmptyRevealDataSave(data){
		revealData.revealDataSave = {};
		revealData.revealDataSave[ticketId] = {
			symbols : [],
			picker : {
				animal : undefined,
				photoNum : undefined,
				dayNightNum : undefined
			},
			// prizeTable : [].concat(prizeTable),
			prizePoint: data.prizePoint
		};
		publishMSG();
	}
	
	function onPlayerChosedCATSNDOGS(animal){
		revealData.revealDataSave[ticketId].picker.animal = animal.toLowerCase();
		publishMSG();
	}
	
	function onUpdatePhotoBG(data){
		revealData.revealDataSave[ticketId].picker.photoNum = data.photoNum;
		revealData.revealDataSave[ticketId].picker.dayNightNum = data.dayNightNum;
		publishMSG();
	}
	
	function onRevealedOneSymbol(data){
		revealData.revealDataSave[ticketId].symbols.push({
			position: data.position,
			counter: data.counter
		});
		publishMSG();
	}
	
	function escapeCharacter(revealData){
		var str = JSON.stringify(revealData);
		str = str.replace(/\"/g, '\\"');
		return {revealDataSave: str};
	}
	
	function publishMSG(){
		if(SKBeInstant.config.wagerType === 'TRY'){return;}
		if(SKBeInstant.isSKB()){
			msgBus.publish('jLotteryGame.revealDataSave',revealData);
		}else{
			msgBus.publish('jLotteryGame.revealDataSave',escapeCharacter(revealData));
		}
	}
	
	function getRevealDataFromResponse(data){
		var targetData;
		if(SKBeInstant.isSKB()){
			targetData = data.revealData[ticketId];
		}else{
			if(!data.revealData.replace){return;}
			var responseRevealData = data.revealData.replace(/\\/g, '');
			responseRevealData = JSON.parse(responseRevealData);
			targetData = responseRevealData.revealDataSave[ticketId];
		}
		return targetData;
	}
	
	
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('playerChosedCATSNDOGS',onPlayerChosedCATSNDOGS);
	msgBus.subscribe('updatePhotoBG',onUpdatePhotoBG);
	msgBus.subscribe('revealedOneSymbol',onRevealedOneSymbol);
	
	return {
		getRevealDataFromResponse: getRevealDataFromResponse
	};
});