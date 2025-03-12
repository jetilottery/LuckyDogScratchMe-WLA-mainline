define([
    'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/channelAudioPlayer/channelAudioPlayerHelper',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/configController',
	'game/revealDataSaveController'
], function (msgBus, channelAudioPlayerHelper, audio, gr, SKBeInstant, gladButton, config, revealDataSaveController) {
    var audioDisabled = false;
    var audioOn, audioOff;
    var MTMReinitial = false;
	var hidden = false;
    var playResultAudio = false;			
	var resultData = null;
	var playResult = null;
	var chosedAnimal = null;
	
    function audioSwitch() {
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);
            audioDisabled = false;
        } else {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
            audioDisabled = true;
        }
        audio.muteAll(audioDisabled);
        audio.gameAudioControlChanged(audioDisabled);
		audio.play("ButtonGeneric",2);
    }

    function onConsoleControlChanged(data) {
        if (data.option === 'sound') {
            var isMuted = audio.consoleAudioControlChanged(data);
            if (isMuted) {
                gr.lib._buttonAudioOn.show(false);
                gr.lib._buttonAudioOff.show(true);
                audioDisabled = true;
            } else {
                gr.lib._buttonAudioOn.show(true);
                gr.lib._buttonAudioOff.show(false);
                audioDisabled = false;
            }
            audio.muteAll(audioDisabled);
        }
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        audioDisabled = SKBeInstant.config.soundStartDisabled;
		if( SKBeInstant.config.assetPack !== 'desktop'){
			audioDisabled = true;
		}
        audioOn = new gladButton(gr.lib._buttonAudioOn, config.gladButtonImgName.buttonAudioOn, scaleType);
        audioOff = new gladButton(gr.lib._buttonAudioOff, config.gladButtonImgName.buttonAudioOff, scaleType);
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
        }else{
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);            
        }
		audio.muteAll(audioDisabled);
        audioOn.click(audioSwitch);
        audioOff.click(audioSwitch);
    }

    function onStartUserInteraction(data) {
		resultData = data;
		playResult = data.playResult;
		if(SKBeInstant.config.gameType === 'ticketReady'){
            return;
        }else{
			if (config.audio && config.audio.gameLoop) {
                gr.getTimer().setTimeout(function() {
					audio.play(config.audio.gameLoop.name, config.audio.gameLoop.channel, true);
                }, 0);
			}
		}
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var revealData = revealDataSaveController.getRevealDataFromResponse(data);
			if(revealData&&revealData.picker&&revealData.picker.animal){
				chosedAnimal = revealData.picker.animal;
			}
		}
    }
	
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}

    function onReStartUserInteraction(data) {
		resultData = data;
		playResult = data.playResult;
		if (config.audio && config.audio.gameLoop) {
			audio.play(config.audio.gameLoop.name, config.audio.gameLoop.channel, true);
		}
    }
	
	function onEnterResultScreenState() {
		audio.stopChannel(0);
		if (hidden) {
            playResultAudio = true;
        } else {
            playResultAudio = false;
			if (playResult === 'WIN') {
				if(resultData.scenario.toLowerCase().indexOf('x')>-1){
					var iwAudioName = chosedAnimal === 'dog'? 'InstantWin2' : 'InstantWin1';
					audio.play(iwAudioName,7);
				}
				var termAudioName = 'gameWin'+chosedAnimal.charAt(0).toUpperCase()+chosedAnimal.substring(1);
				if (config.audio && config.audio[termAudioName]) {
					audio.play(config.audio[termAudioName].name, config.audio[termAudioName].channel);
				}
			}else{
				if (config.audio && config.audio.gameNoWin) {
					audio.play(config.audio.gameNoWin.name, config.audio.gameNoWin.channel);
				}
			}
		}
    }
	
	function onPlayerChosedCATSNDOGS(data){
		chosedAnimal = data.toLowerCase();
	}

    function reset() {
        audio.stopAllChannel();
    }
    
    function onReInitialize(){
        audio.stopAllChannel();
        if(MTMReinitial){
            if (config.audio && config.audio.gameInit) {
                audio.play(config.audio.gameInit.name, config.audio.gameInit.channel);
            }
            MTMReinitial = false;
        }
    }
    
    function onInitialize(){
		if (SKBeInstant.config.screenEnvironment !== 'desktop'){
			return;
		}else{
			// this for screenEnvironment device and tablet
			if (config.audio && config.audio.gameInit) {
                gr.getTimer().setTimeout(function() {
                    audio.play(config.audio.gameInit.name, config.audio.gameInit.channel);
                }, 0);
			}
		}
    }
    
    function onPlayerSelectedAudioWhenGameLaunch(data){
        // retreve the rgs sound config parameter for desktop.		
		if(config.gameParam.popUpDialog){
			audioDisabled = data;
			audioSwitch();
		}else{
			audio.muteAll(audioDisabled);
		}
        
        if (SKBeInstant.config.gameType === 'ticketReady') {
            if (config.audio && config.audio.gameLoop) {
                gr.getTimer().setTimeout(function () {
                    audio.play(config.audio.gameLoop.name, config.audio.gameLoop.channel, true);
                }, 0);
            }
        }else{
            if (config.audio && config.audio.gameInit) {
                gr.getTimer().setTimeout(function () {
                    audio.play(config.audio.gameInit.name, config.audio.gameInit.channel);
                }, 0);
            }			
        }
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
	
	function onAllRevealed(data) {
		resultData = resultData || data;
	}
    
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
	msgBus.subscribe('playerChosedCATSNDOGS',onPlayerChosedCATSNDOGS);
	msgBus.subscribe('allRevealed', onAllRevealed);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLotterySKB.reset', reset);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	
	msgBus.subscribe('resourceLoaded', function(){
		channelAudioPlayerHelper.enableAudioDialog(true);
	});
	
	document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            hidden = true;
        } else {
            hidden = false;
            if(playResultAudio){
                onEnterResultScreenState();
            }
        }
    });															
    
    return {};
});