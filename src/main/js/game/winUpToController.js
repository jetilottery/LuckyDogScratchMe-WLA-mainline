/**
 * @module winUpToController
 * @description WinUpTo control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
	'game/revealDataSaveController'
], function (msgBus, gr, loader, SKBeInstant, revealDataSaveController) {
	
	var boughtTicket = false, MTMReinitial = false, chosedAnimal;
    
    function onGameParametersUpdated(){
		gr.lib._winUpTo.show(true);
		gr.lib._winUpTo.autoFontFitText = true;
		gr.lib._centerWinUpTo.show(true);
		gr.lib._centerWinUpToText.autoFontFitText = true;
		gr.lib._centerWinUpToValue.autoFontFitText = true;
		gr.lib._centerWinUpToText.setText(loader.i18n.Game.win_up_to);
    }
    
    function onTicketCostChanged(prizePoint){
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (var i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                var ps = rc[i].prizeStructure;
                var maxPrize = 0;
                for (var j = 0; j < ps.length; j++) {
                    var prize = Number(ps[j].prize);
                    if (maxPrize < prize) {
                        maxPrize = prize;
                    }
                }
                gr.lib._winUpTo.setText(loader.i18n.Game.win_up_to+ ' ' + SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
				gr.lib._centerWinUpToValue.setText(SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                break;
            }
        }        
    }
	
	function onStartUserInteraction(data){
		onReStartUserInteraction();
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var revealData = revealDataSaveController.getRevealDataFromResponse(data);
			if(revealData&&revealData.picker&&revealData.picker.animal){
				chosedAnimal = revealData.picker.animal;
				var color = chosedAnimal === 'dog'? '005100':'CF4763';
				gr.lib._winUpTo.updateCurrentStyle({"_text":{"_strokeColor":color}});
			}
		}
	}
	
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}
	
	function onReStartUserInteraction(){
		gr.lib._centerWinUpTo.show(false);
		boughtTicket = true;
	}
	
	function onPlayerChosedCATSNDOGS(data){
		chosedAnimal = data.toLowerCase();
		var color = chosedAnimal === 'dog'? '005100':'CF4763';
		gr.lib._winUpTo.updateCurrentStyle({"_text":{"_strokeColor":color}});
	}
	
	function onTutorialIsShown(){
        if(!boughtTicket){
            gr.lib._centerWinUpTo.show(false);
        }
    }
    function onTutorialIsHide(){
        if(!boughtTicket){
            gr.lib._centerWinUpTo.show(true);
        }
    }
	
	function onInitialize(){
		gr.lib._centerWinUpTo.show(false);
	}
	
	function onReInitialize(){
		if(MTMReinitial){
			gr.lib._centerWinUpTo.show(false);
			MTMReinitial = false;
		}else{
			gr.lib._centerWinUpTo.show(true);
		}
		boughtTicket = false;
	}
	
	function onReset(){
		gr.lib._centerWinUpTo.show(true);
		boughtTicket = false;
	}
	
	function onPlayerWantsPlayAgain(){
		gr.lib._centerWinUpTo.show(true);
		boughtTicket = false;
	}
	
	function onPlayerWantsToMoveToMoneyGame(){
		MTMReinitial = true;
	}
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
	msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLotterySKB.reset', onReset);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('playerChosedCATSNDOGS',onPlayerChosedCATSNDOGS);
	msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    return {};
});