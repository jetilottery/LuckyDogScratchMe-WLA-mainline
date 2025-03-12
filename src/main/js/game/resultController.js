define([
	'com/pixijs/pixi',
    'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/Sprite',
	'skbJet/componentCRDC/pixiCoinShower/PixiCoinShower',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController',
	'game/revealDataSaveController'
], function (PIXI, msgBus, Sprite, CoinShower, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config, revealDataSaveController) {
    var catWinClose, dogWinClose, catNonWinClose, dogNonWinClose;
	var chosedAnimal = null;
    var resultData = null;
    var resultPlaque = null;
	var playResult = null;
	var catCoinShower = null;
	var dogCoinShower = null;
	var catCoinShowerTimer = null;
	var dogCoinShowerTimer = null;
	var catCoinFrames = [];
	var dogCoinFrames = [];
	
    function onGameParametersUpdated() {
        initialButtons();
		initialTexts();
		initialCoins();
        hideDialog();
    }
	
	function initialButtons(){
		var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        dogWinClose = new gladButton(gr.lib._dogButtonWinClose_clickArea, 'winPlaqueButton', scaleType);
        dogNonWinClose = new gladButton(gr.lib._dogNonWinButtonWinClose_clickArea, 'winPlaqueButton', scaleType);
        catWinClose = new gladButton(gr.lib._catButtonWinClose_clickArea, 'winPlaqueButton', scaleType);
        catNonWinClose = new gladButton(gr.lib._catNonWinButtonWinClose_clickArea, 'winPlaqueButton', scaleType);
        
        dogWinClose.click(closeResultPlaque);
		dogNonWinClose.click(closeResultPlaque);
		catWinClose.click(closeResultPlaque);
        catNonWinClose.click(closeResultPlaque);
	}
	
	function initialTexts(){
		setAutoFontFit();
        if(SKBeInstant.config.wagerType === 'TRY'){
            if(Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1) {
                gr.lib._dogWinTryText.setText(loader.i18n.Game.message_anonymousTryWin);
                gr.lib._catWinTryText.setText(loader.i18n.Game.message_anonymousTryWin);
            }else{
                gr.lib._dogWinTryText.setText(loader.i18n.Game.message_tryWin);
                gr.lib._catWinTryText.setText(loader.i18n.Game.message_tryWin);
            }
        }
        gr.lib._dogWinText.setText(loader.i18n.Game.message_buyWin);
		gr.lib._catWinText.setText(loader.i18n.Game.message_buyWin);
        gr.lib._dogCloseWinText.setText(loader.i18n.Game.message_close);
        gr.lib._catCloseWinText.setText(loader.i18n.Game.message_close);
        gr.lib._dogNonWin_Text.setText(loader.i18n.Game.message_nonWin);
        gr.lib._catNonWin_Text.setText(loader.i18n.Game.message_nonWin);
        gr.lib._dogCloseNonWinText.setText(loader.i18n.Game.message_close);
        gr.lib._catCloseNonWinText.setText(loader.i18n.Game.message_close);
	}
	
	function setAutoFontFit(){
		gr.lib._dogWinText.autoFontFitText = true;
		gr.lib._catWinText.autoFontFitText = true;
		gr.lib._dogWinTryText.autoFontFitText = true;
		gr.lib._catWinTryText.autoFontFitText = true;
		gr.lib._dogWinValue.autoFontFitText = true;
		gr.lib._catWinValue.autoFontFitText = true;
		gr.lib._dogCloseWinText.autoFontFitText = true;
		gr.lib._catCloseWinText.autoFontFitText = true;
		gr.lib._dogNonWin_Text.autoFontFitText = true;
		gr.lib._catNonWin_Text.autoFontFitText = true;
        gr.lib._dogCloseNonWinText.autoFontFitText = true;
		gr.lib._catCloseNonWinText.autoFontFitText = true;
	}
        
	function closeResultPlaque(){
		gr.lib._BG_dim.show(false);
		if (config.audio && config.audio.ButtonGeneric) {
			audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
		}
		var resultName = resultData.playResult === 'WIN'? 'Win' : 'NonWin';
		var closeAnimName = '_'+chosedAnimal+resultName+'PlaqueAnimDisappear';
		gr.animMap[closeAnimName]._onComplete = function(){
			msgBus.publish('closeResultPlaque');
			hideDialog();
		};
		gr.animMap[closeAnimName].play();
		stopCoinShower();
	}

    function hideDialog() {
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
    }

    function showDialog() {
        gr.lib._BG_dim.show(true);
        if (resultData.playResult === 'WIN') {
			gr.lib._winPlaque.show(false);
            gr.lib._nonWinPlaque.show(false);
            if (SKBeInstant.config.wagerType === 'BUY') {
                gr.lib['_'+chosedAnimal+'WinTryText'].show(false);
                gr.lib['_'+chosedAnimal+'WinText'].show(true);
            }else{
                gr.lib['_'+chosedAnimal+'WinTryText'].show(true);
                gr.lib['_'+chosedAnimal+'WinText'].show(false);                
            }            
            gr.lib['_'+chosedAnimal+'WinValue'].setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
			var allChildNodes4WinPlaque = gr.lib._winPlaque.sprites;
			for(var name in allChildNodes4WinPlaque){
				allChildNodes4WinPlaque[name].show(false);
			}
            gr.lib._winPlaque.show(true);
			gr.lib['_'+chosedAnimal].show(true);
			gr.lib['_'+chosedAnimal+'WinPlaque'].show(true);
			gr.animMap['_'+chosedAnimal+'WinPlaqueAnim'].play();
			gr.animMap['_'+chosedAnimal+'WinPlaqueAnim']._onComplete = function(){
				startCoinShower();
			};
        } else {
            gr.lib._winPlaque.show(false);
            gr.lib._nonWinPlaque.show(false);
			var allChildNodes4NonWinPlaque = gr.lib._nonWinPlaque.sprites;
			for(var name in allChildNodes4NonWinPlaque){
				allChildNodes4NonWinPlaque[name].show(false);
			}
            gr.lib._nonWinPlaque.show(true);
			gr.lib['_'+chosedAnimal+'NonWin'].show(true);
			gr.lib['_'+chosedAnimal+'NonWinPlaque'].show(true);
			gr.animMap['_'+chosedAnimal+'NonWinPlaqueAnim'].play();
        }
    }

    function onStartUserInteraction(data) {
        onReStartUserInteraction(data);
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
	
	function onReStartUserInteraction(data){
		resultData = data;
		playResult = data.playResult;
		hideDialog();
	}
	
	function onPlayerChosedCATSNDOGS(data){
		chosedAnimal = data.toLowerCase();
	}

    function onAllRevealed(data) {
		resultData = resultData || data;
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
			tierPrizeShown: resultData.prizeDivision,
			formattedAmountWonShown: resultData.prizeValue
		});
    }

    function onEnterResultScreenState() {
		hideTutorialInCaseTutorailIsShown();
        showDialog();
    }
	
	function hideTutorialInCaseTutorailIsShown(){
		if(gr.lib._tutorial.pixiContainer.visible){
			gr.lib._tutorial.show(false);
			gr.lib._buttonDim.show(true);
			gr.lib._buy.show(true);
			gr.lib._try.show(true);
		}
	}
    
    function onPlayerWantsPlayAgain(){
        gr.lib._BG_dim.show(false);
		stopCoinShower();
        hideDialog();
    }
	
	function onPlayerWantsToMoveToMoneyGame(){
		gr.lib._BG_dim.show(false);
		stopCoinShower();
        hideDialog();
	}
	
	function initialCoins(){
		var dogAnimationFrameNameArray = Sprite.getSpriteSheetAnimationFrameArray('dogFoodAnim');
		var catAnimationFrameNameArray = Sprite.getSpriteSheetAnimationFrameArray('catFoodAnim');
		dogAnimationFrameNameArray.forEach(function(picName){
			dogCoinFrames.push(PIXI.Texture.fromFrame(picName + '.png'));
		});
        catAnimationFrameNameArray.forEach(function(picName){
			catCoinFrames.push(PIXI.Texture.fromFrame(picName + '.png'));
		});
		dogCoinShower = new CoinShower({
			'parentContain': gr.lib._dogFoodPanel.pixiContainer,
			'frames': dogCoinFrames, 
			'ticker': gr.getTicker(),
			'visibleRange': [0,gr.lib._dogFoodPanel._currentStyle._width,0,gr.lib._dogFoodPanel._currentStyle._height],
			'initScale': 0.2,
			'coinPerTime': 20,
			'coinAnimatSpeed': [0.1,0.3]
		});
		catCoinShower = new CoinShower({
			'parentContain': gr.lib._catFoodPanel.pixiContainer,
			'frames': catCoinFrames, 
			'ticker': gr.getTicker(),
			'visibleRange': [0,gr.lib._catFoodPanel._currentStyle._width,0,gr.lib._catFoodPanel._currentStyle._height],
			'initScale': 0.2,
			'coinPerTime': 20,
			'coinAnimatSpeed': [0.1,0.3]
		});
	}
	
	function startCoinShower(){
		if(chosedAnimal === 'dog'){
			gr.lib._dogFoodPanel.show(true);
			gr.lib._catFoodPanel.show(false);
			dogCoinShower.start();
			dogCoinShowerTimer = setTimeout(function(){
				dogCoinShower.stop();
				dogCoinShowerTimer =null;
				gr.lib._dogFoodPanel.show(false);
				gr.lib._catFoodPanel.show(false);
			},1500);
		}else{
			gr.lib._catFoodPanel.show(true);
			gr.lib._dogFoodPanel.show(false);
			catCoinShower.start();
			catCoinShowerTimer = setTimeout(function(){
				catCoinShower.stop();
				catCoinShowerTimer =null;
				gr.lib._dogFoodPanel.show(false);
				gr.lib._catFoodPanel.show(false);
			},1500);
		}
	}
	
	function stopCoinShower(){
		gr.lib._dogFoodPanel.show(false);
		gr.lib._catFoodPanel.show(false);
		if(chosedAnimal === 'dog'){
			if(dogCoinShowerTimer){gr.getTimer().clearTimeout(dogCoinShowerTimer);dogCoinShowerTimer=null;}
			dogCoinShower.stop();
		}else{
			if(catCoinShowerTimer){gr.getTimer().clearTimeout(dogCoinShowerTimer);catCoinShowerTimer=null;}
			catCoinShower.stop();
		}
	}
    
    function onTutorialIsShown(){
        if(gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible){            
            resultPlaque = gr.lib._winPlaque.pixiContainer.visible? gr.lib._winPlaque: gr.lib._nonWinPlaque;
            hideDialog();
            gr.lib._BG_dim.show(true);
        }
    }
    
    function onTutorialIsHide(){
        if(resultPlaque){
            resultPlaque.show(true);
            resultPlaque = null;
        }        
    }
    
    msgBus.subscribe('jLottery.reInitialize', hideDialog);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('playerChosedCATSNDOGS',onPlayerChosedCATSNDOGS);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('allRevealed', onAllRevealed);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
        
    return {};
});