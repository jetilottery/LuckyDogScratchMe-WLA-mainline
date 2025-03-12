define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController',
    'game/util'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config,util) {
    var count = 0;
    var buttonMTM;
    var inGame = false;
	var showPlayWithMoneyTimer = null;

    function enableButton() {
        if ((SKBeInstant.config.wagerType === 'BUY') || (Number(SKBeInstant.config.jLotteryPhase) === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
        } else {
            //0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
            //1..N: number of demo wagers before showing Move-To-Money-Button.
            //(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
            //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
            if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)){
                gr.lib._buy.show(false);
                gr.lib._try.show(true);
                if(!showPlayWithMoneyTimer){
                    gr.lib._buttonMTM.show(true);
                }
            }else{
                gr.lib._buy.show(true);
                gr.lib._try.show(false);
            }
        }
    }

    function onStartUserInteraction() {
		inGame = true;
        if(SKBeInstant.config.gameType === 'normal'){
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
        }
    }

    function onReStartUserInteraction() {
		if(showPlayWithMoneyTimer){ 
			gr.getTimer().clearTimeout(showPlayWithMoneyTimer);
			showPlayWithMoneyTimer = null;
		}
		inGame = true;
        gr.lib._buy.show(true);
        gr.lib._try.show(false);

    }

    function onDisableUI() {
        gr.lib._buttonMTM.show(false);
    }
    
    function onGameParametersUpdated(){
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        buttonMTM = new gladButton(gr.lib._buttonMTM, config.gladButtonImgName.buttonMTM, scaleType);
        buttonMTM.show(false);
        if (config.textAutoFit.MTMText){
            gr.lib._MTMText.autoFontFitText = config.textAutoFit.MTMText.isAutoFit;
        }

        gr.lib._MTMText.setText(loader.i18n.Game.button_move2moneyGame);
        if (config.style.MTMText) {
            gameUtils.setTextStyle(gr.lib._MTMText, config.style.MTMText);
        }
		if (config.dropShadow) {
			gameUtils.setTextStyle(gr.lib._MTMText, {
				padding: config.dropShadow.padding,
				dropShadow: config.dropShadow.dropShadow,
				dropShadowDistance: config.dropShadow.dropShadowDistance
			});
		}        
        
		if(gr.lib._tryText){
            util.keepSameSizeWithMTMText(gr.lib._tryText, gr);
		}
		if(gr.lib._playAgainMTMText){
            util.keepSameSizeWithMTMText(gr.lib._playAgainMTMText, gr);
		}
        function clickMTM() {
            gr.lib._try.show(false); 
            SKBeInstant.config.wagerType = 'BUY';
            msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        }
		buttonMTM.click(clickMTM);
    }
    
    function onEnterResultScreenState(){
        count++;
        inGame = false;
        showPlayWithMoneyTimer = gr.getTimer().setTimeout(function () {
            gr.getTimer().clearTimeout(showPlayWithMoneyTimer);
            showPlayWithMoneyTimer = null;
			if(gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible){
				enableButton();
			}				
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
            
    }
    
    function onReInitialize(){
        inGame = false;
        if(gr.lib._tutorial.pixiContainer.visible){return;}
		enableButton();        
    }
    
    function onTutorialIsShown(){
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
    }
    
    function onTutorialIsHide(){
		if (inGame) {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
        } else {
            enableButton();
        }
    }
    
    function onDisableButton(){
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
    }
    
    msgBus.subscribe('jLotterySKB.reset', function(){
		inGame = false;
        enableButton();
	});
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);

    msgBus.subscribe('disableButton', onDisableButton);

    return {};
});