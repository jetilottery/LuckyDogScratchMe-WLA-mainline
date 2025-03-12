/**
 * @module tutorialController
 * @description tutorial dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController'
], function (msgBus, audio, gr, loader, gladButton, SKBeInstant, gameUtils, config) {
    var buttonInfo;
    var shouldShowTutorialWhenReinitial = false;
	var startUserInteractionCounter = 0;
    var isGameFlowFinish = false;
	var showTutorialAtBeginning = true;

    function showTutorial() {
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        gr.animMap._tutorialAnim.play();
        msgBus.publish('tutorialIsShown');
        audio.play(config.audio.HelpPageOpen.name, config.audio.HelpPageOpen.channel);
    }

    function hideTutorial() {
        gr.animMap._tutorialUP._onComplete = function(){
			gr.lib._tutorial.show(false);
			gr.lib._BG_dim.updateCurrentStyle({"_opacity":0.8});
            if (!isGameFlowFinish){gr.lib._BG_dim.show(false);}
            buttonInfo.show(true);
            msgBus.publish('tutorialIsHide');
        };
        gr.animMap._tutorialUP.play();
		audio.play(config.audio.HelpPageClose.name, config.audio.HelpPageClose.channel);
    }

    function onGameParametersUpdated() {
        initialButtons();
		setTutorialText();
		showTutorialAtBegin();
    }
	
	function initialButtons(){
		var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        buttonInfo = new gladButton(gr.lib._buttonInfo, "buttonInfo", scaleType);
        var buttonClose = new gladButton(gr.lib._buttonCloseTutorial, "buttonClose", scaleType);
		buttonInfo.click(function () {
            showTutorial();
        });
        buttonClose.click(function () {
            hideTutorial();
        });
		gr.lib._BG_dim.on('click',function(event){
			event.stopPropagation();
		});
	}
	
	function setTutorialText(){
		gr.lib._versionText.autoFontFitText = true;
        gr.lib._tutorialTitleText.autoFontFitText = true;
        gr.lib._closeTutorialText.autoFontFitText = true;
        // gr.lib._versionText.setText('1.0.0');
        gr.lib._versionText.setText(window._cacheFlag.gameVersion+".CL"+window._cacheFlag.changeList+"_"+window._cacheFlag.buildNumber);
        gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);
        gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
		setVerticalCenterTxt("_tutorialPage_00_Text_00", loader.i18n.Game.tutorial_00);
		setVerticalCenterTxt("_tutorialPage_00_Text_01", loader.i18n.Game.tutorial_01);
		setVerticalCenterTxt("_tutorialPage_00_Text_02", loader.i18n.Game.tutorial_02);
	}
	
	function showTutorialAtBegin(){
		if(SKBeInstant.config.customBehavior&&SKBeInstant.config.customBehavior.showTutorialAtBeginning === false){
			showTutorialAtBeginning = false;
			buttonInfo.show(true);
			gr.lib._BG_dim.show(false);
			gr.lib._tutorial.show(false);
        }
	}

    function onReInitialize() {
        isGameFlowFinish = false;
        if(shouldShowTutorialWhenReinitial){
            shouldShowTutorialWhenReinitial = false;
			if (showTutorialAtBeginning) {
                showTutorial();
            }else{
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }

    function onDisableUI() {
        buttonInfo.show(false);
    }
    
    function onEnableUI() {
        buttonInfo.show(true);
    }
    
    function showTutorialOnInitial(){
		gr.lib._tutorialPage_00_Text_00.show(true);
		gr.lib._tutorialPage_00_Text_01.show(true);
		gr.lib._tutorialPage_00_Text_02.show(true);
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }
    
    function onInitialize(){
        isGameFlowFinish = false;
		if(showTutorialAtBeginning){
            showTutorialOnInitial();
        }else{
            msgBus.publish('tutorialIsHide');
        }
    }
    function onReStartUserInteraction(){
        buttonInfo.show(true);
    }
    function onStartUserInteraction(){
		startUserInteractionCounter++;
        if(SKBeInstant.config.gameType === 'ticketReady'&&startUserInteractionCounter===1){
            if (showTutorialAtBeginning) {
                showTutorialOnInitial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }
    
    function onEnterResultScreenState() {       
        gr.getTimer().setTimeout(function () {
            buttonInfo.show(true);
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);     
        isGameFlowFinish = true;
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        shouldShowTutorialWhenReinitial = true;
    }

    function onPlayerWantsPlayAgain(){
        isGameFlowFinish = false;
    }

    function onCloseResultPlaqueHandler(){
        isGameFlowFinish = false;
    }
	
	function setVerticalCenterTxt(spriteName,txtValue){
		gr.lib[spriteName].setText(txtValue);
		var fontSize = parseInt(gr.lib[spriteName]._currentStyle._font._size);
		var txtWidth = Number(gr.lib[spriteName].pixiContainer.$text.width);
		var boxWidth = Number(gr.lib[spriteName]._currentStyle._width);
		while(txtWidth>boxWidth){
			fontSize--;
			if(fontSize<10) {break;}
			gr.lib[spriteName].updateCurrentStyle({'_font':{'_size':fontSize}});
			txtWidth = Number(gr.lib[spriteName].pixiContainer.$text.width);
		}
		var txtHeight = Number(gr.lib[spriteName].pixiContainer.$text.height);
		var boxHeight = Number(gr.lib[spriteName]._currentStyle._height);
		while(txtHeight>boxHeight){
			fontSize--;
			if(fontSize<10) {break;}
			gr.lib[spriteName].updateCurrentStyle({'_font':{'_size':fontSize}});
			txtHeight = Number(gr.lib[spriteName].pixiContainer.$text.height);
		}
		//var orignTop = Number(gr.lib[spriteName]._currentStyle._top);
		// var targetTop = orignTop + Math.floor((boxHeight-txtHeight)/2);
		// gr.lib[spriteName].updateCurrentStyle({'_top':targetTop});
	}
    
    msgBus.subscribe('jLotterySKB.reset', onEnableUI);
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('closeResultPlaque', onCloseResultPlaqueHandler);
    return {
		showTutorial:showTutorial
	};
});
