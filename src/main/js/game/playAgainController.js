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

    var playAgain, playAgainMTM;
	var showPlayAgainTimer = null;
    function playAgainButton() {
        if (config.audio && config.audio.ButtonGeneric) {
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        }
        gr.lib._buttonPlayAgain.show(false);
        gr.lib._buttonPlayAgainMTM.show(false);
        msgBus.publish('playerWantsPlayAgain');
    }
    
    function onGameParametersUpdated(){
        if (config.style.playAgainText) {
            gameUtils.setTextStyle(gr.lib._playAgainText, config.style.playAgainText);
        }
        if (config.textAutoFit.playAgainText){
            gr.lib._playAgainText.autoFontFitText = config.textAutoFit.playAgainText.isAutoFit;
        }
        
        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._playAgainText.setText(loader.i18n.Game.button_playAgain);
        }else{
            gr.lib._playAgainText.setText(loader.i18n.Game.button_MTMPlayAgain);
        }
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch':true};
        playAgain = new gladButton(gr.lib._buttonPlayAgain, config.gladButtonImgName.buttonPlayAgain, scaleType);
        playAgain.click(playAgainButton);
        gr.lib._buttonPlayAgain.show(false);
        
        if (config.style.playAgainMTMText) {
            gameUtils.setTextStyle(gr.lib._playAgainMTMText, config.style.playAgainMTMText);
        }
        if (config.textAutoFit.playAgainMTMText){
            gr.lib._playAgainMTMText.autoFontFitText = config.textAutoFit.playAgainMTMText.isAutoFit;
        }
        
        gr.lib._playAgainMTMText.setText(loader.i18n.Game.button_MTMPlayAgain);
        playAgainMTM = new gladButton(gr.lib._buttonPlayAgainMTM, config.gladButtonImgName.buttonPlayAgainMTM, scaleType);
        playAgainMTM.click(playAgainButton);
        gr.lib._buttonPlayAgainMTM.show(false);
		
		if (config.dropShadow) {
			gameUtils.setTextStyle(gr.lib._playAgainMTMText, {
				padding: config.dropShadow.padding,
				dropShadow: config.dropShadow.dropShadow,
				dropShadowDistance: config.dropShadow.dropShadowDistance
			});
			gameUtils.setTextStyle(gr.lib._playAgainText, {
				padding: config.dropShadow.padding,
				dropShadow: config.dropShadow.dropShadow,
				dropShadowDistance: config.dropShadow.dropShadowDistance
			});
		}
		
		if(gr.lib._MTMText){
			util.keepSameSizeWithMTMText(gr.lib._playAgainMTMText, gr);
		}
    }
    
    function onReInitialize(){
		if(showPlayAgainTimer){ 
			gr.getTimer().clearTimeout(showPlayAgainTimer);
			showPlayAgainTimer = null;
		}
        gr.lib._playAgainText.setText(loader.i18n.Game.button_playAgain);
        gr.lib._buttonPlayAgain.show(false);
        gr.lib._buttonPlayAgainMTM.show(false);
    }

    function onEnterResultScreenState() {
        if (Number(SKBeInstant.config.jLotteryPhase) === 2) {
            showPlayAgainTimer = gr.getTimer().setTimeout(function(){
                gr.lib._buttonPlayAgain.show(true);
                gr.lib._buttonPlayAgainMTM.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});