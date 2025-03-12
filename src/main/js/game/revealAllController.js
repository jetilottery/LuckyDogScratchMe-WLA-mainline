/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/componentCRDC/gladRenderer/gladButton',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
	'game/revealDataSaveController'
], function (msgBus, gr, loader, audio, gladButton, SKBeInstant, config, revealDataSaveController) {

    var autoPlay, stopPlay, scenarioData, intervalTime, timer, unrevealedArray;
	
	var autoPlayText, stopPlayText;
    
    function onGameParametersUpdated() {
		initialButtons();
		setButtonText();
		setIntervalTime();
    }
	
	function initialButtons(){
		var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        autoPlay = new gladButton(gr.lib._buttonAutoPlay, "buttonCommon", scaleType);
		stopPlay = new gladButton(gr.lib._buttonStop, "buttonCommon", scaleType);
        autoPlay.click(function () {
            audio.play('ButtonGeneric', 7);
            autoPlay.show(false);
			stopPlay.show(true);
            revealAll();
        });
		stopPlay.click(function () {
			audio.play('ButtonGeneric', 2);
			autoPlay.show(true);
            stopPlay.show(false);
            stopRevealAll();
		});
        hideAutoPlayAndStopPlayBtns();
	}
	
	function setButtonText(){
		gr.lib._autoPlayText.autoFontFitText = true;
		gr.lib._stopText.autoFontFitText = true;
		if(SKBeInstant.isWLA()){
			autoPlayText = loader.i18n.MenuCommand.WLA.button_autoPlay;
		}else{
			autoPlayText = loader.i18n.MenuCommand.Commercial.button_autoPlay;
		}
		stopPlayText = loader.i18n.Game.button_stop;
        gr.lib._autoPlayText.setText(autoPlayText);
		gr.lib._stopText.setText(stopPlayText);
	}
	
	function setIntervalTime(){
		if(SKBeInstant.config.customBehavior){
           intervalTime = SKBeInstant.config.customBehavior.symbolRevealInterval || 1000;
        }else{
           intervalTime = 1000;
        }
	}
	
	function revealAll(){
		unrevealedArray = [];
		for(var i = 0; i < 6; i++){
			if(gr.lib['_Symbol_'+i].revealed){
				continue;
			}else{
				unrevealedArray.push(i);
				gr.lib['_symbol'+i+'_clickArea'].pixiContainer.interactive = false;
			}
		}
		startRevealAll(unrevealedArray);
        msgBus.publish('disableUI');
	}
	
	function startRevealAll(){
		if(timer){gr.getTimer().clearInterval(timer);timer=null;}
		timer = gr.getTimer().setInterval(revealAllFn, intervalTime);
		revealAllFn();
	}
	
	function revealAllFn(){
		if(unrevealedArray.length){
			var index = unrevealedArray.shift();
			var curSymbol = gr.lib['_Symbol_'+index];
			curSymbol.revealed = true;
			curSymbol.reveal();
		}
	}
	
	function stopRevealAll(){
		unrevealedArray = [];
		if(timer){gr.getTimer().clearInterval(timer);timer=null;}
		for(var i = 0; i < 6; i++){
			if(!gr.lib['_Symbol_'+i].revealed){
				gr.lib['_symbol'+i+'_clickArea'].pixiContainer.interactive = true;
			}
		}
        msgBus.publish('enableUI');
	}

    function onStartUserInteraction(data) {
		onReStartUserInteraction(data);
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var enable = SKBeInstant.config.autoRevealEnabled === false? false: true;
			var revealData = revealDataSaveController.getRevealDataFromResponse(data);
			if(enable&&scenarioData&&revealData&&revealData.picker&&revealData.picker.animal){
				autoPlay.show(true);
			}else{
				autoPlay.show(false);
			}
		}
    }
			
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}
	
	function onReStartUserInteraction(data){
		if(data.scenario){
			scenarioData = data.scenario.replace('|',',').split(',');
			scenarioData.pop();
		}
	}
	
	function onChoosePlaqueAnimComplete(){
		var enable = SKBeInstant.config.autoRevealEnabled === false? false: true;
		if(enable&&scenarioData){
			autoPlay.show(true);
		}else{
			autoPlay.show(false);
		}
	}

    function hideAutoPlayAndStopPlayBtns() {
        autoPlay.show(false);
		stopPlay.show(false);
    }
	
	function onErrorAndWarn(){
		if(timer){gr.getTimer().clearInterval(timer);timer=null;}
	}
	
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('choosePlaqueAnimComplete', onChoosePlaqueAnimComplete);
    msgBus.subscribe('jLottery.reInitialize', hideAutoPlayAndStopPlayBtns);
    msgBus.subscribe('reset', hideAutoPlayAndStopPlayBtns);
    msgBus.subscribe('lastSymbolClicked', hideAutoPlayAndStopPlayBtns);
    msgBus.subscribe('jLottery.enterResultScreenState', hideAutoPlayAndStopPlayBtns);
	msgBus.subscribe('playerWantsPlayAgain', hideAutoPlayAndStopPlayBtns);
	msgBus.subscribe('jLottery.error', onErrorAndWarn);
	msgBus.subscribe('jLottery.playingSessionTimeoutWarning', onErrorAndWarn);
	msgBus.subscribe('winboxError', onErrorAndWarn);
    return {};
});