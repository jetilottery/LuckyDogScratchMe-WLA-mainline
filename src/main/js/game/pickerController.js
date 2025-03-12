/**
 * @module pickerController
 * @description picker dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/configController',
	'game/revealDataSaveController'
], function (msgBus, SKBeInstant, audio, gr, loader, gladButton, config, revealDataSaveController) {
    var buttonDog, buttonCat;
	var MTMReinitial = false;
	var beforeChoose = true;
	var afterClickBuy = false;
	
    function onGameParametersUpdated() {
		showPickerDialog();
        initialButtons();
		initialText();
		disablePickerBtns();
    }
	
	function onStartUserInteraction(data){
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var revealData = revealDataSaveController.getRevealDataFromResponse(data);
			if(revealData&&revealData.picker&&revealData.picker.animal){
				beforeChoose = false;
				afterClickBuy = true;
				stopPickerAnims();
				gr.lib._choosePlaque.show(false);
				gr.lib._buttonDim.show(true);
				return;
			}
		}
		onReStartUserInteraction();
	}
		
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}
	
	function onReStartUserInteraction(){
		enablePickerBtns();
		gr.lib._buttonDim.show(false);
		afterClickBuy = true;
	}
	
	function onPlayerWantsPlayAgain(){
		afterClickBuy = false;
		beforeChoose = true;
		showPickerDialog();
	}
	
	function onReInitialize(){
		if(MTMReinitial){
			MTMReinitial = false;
			afterClickBuy = false;
			beforeChoose = true;
			showPickerDialog();
		}
	}
	
	function onPlayerWantsToMoveToMoneyGame(){
		MTMReinitial = true;
	}
	
	function showPickerDialog(){
		gr.lib._choosePlaque.show(true);
		gr.lib._choosePlaqueLogo.gotoAndPlay('logoAnim',0.4,true);
		playDogAnim();
		playCatAnim();
	}
	
	function playDogAnim(){
		var speed = 0.5, counter = 0;
		gr.lib._dogAnim.gotoAndPlay('dogWindow', speed, false);
		gr.lib._dogAnim.onComplete = function(){
			counter++;
			if(counter%6===0){
				gr.lib._dogAnim.gotoAndPlay('dogWindowEye', speed, false);
			}else{
				gr.lib._dogAnim.gotoAndPlay('dogWindow', speed, false);
			}
		};
	}
	
	function playCatAnim(){
		gr.lib._catAnim.gotoAndPlay('catWindow',0.2,true);
	}
	
	function stopPickerAnims(){
		gr.lib._dogAnim.onComplete = null;
		gr.lib._dogAnim.stopPlay();
		gr.lib._catAnim.stopPlay();
		gr.lib._choosePlaqueLogo.stopPlay();
	}
	
	function hidePickerDialog(){
		gr.animMap._choosePlaqueAnim.play();
		gr.animMap._choosePlaqueAnim._onComplete = function(){
			gr.lib._choosePlaque.show(false);
			gr.lib._choosePlaque.updateCurrentStyle({"_opacity":1});
			msgBus.publish('choosePlaqueAnimComplete');
		};
	}
	
	function initialButtons(){
        buttonDog = new gladButton(gr.lib._choosePlaqueDog, "choosePlaque_dog");
        buttonCat = new gladButton(gr.lib._choosePlaqueCat, "choosePlaque_cat");
		buttonDog.click(function () {
			onButtonCatAndDogClicked('DOG');
        });
        buttonCat.click(function () {
            onButtonCatAndDogClicked('CAT');
        });
		gr.lib._choosePlaque.on('click',function(event){
			event.stopPropagation();
		});
	}
	
	function onButtonCatAndDogClicked(animal){
		if(beforeChoose){
			beforeChoose = false;
			audio.play('Select'+(animal==='CAT'?1:2),5);
			disablePickerBtns();
			stopPickerAnims();
			hidePickerDialog();
			gr.lib._buttonDim.show(true);
			msgBus.publish('playerChosedCATSNDOGS',animal);
			audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
		}
	}
	
	function initialText(){
		gr.lib._choosePlaqueText.autoFontFitText = true;
		gr.lib._choosePlaqueText.setText(loader.i18n.Game.choosePlaqueText);
	}
	
	function enablePickerBtns(){
		gr.lib._choosePlaqueDog.pixiContainer.interactive = true;
		gr.lib._choosePlaqueCat.pixiContainer.interactive = true;
	}
	
	function disablePickerBtns(){
		gr.lib._choosePlaqueDog.pixiContainer.interactive = false;
		gr.lib._choosePlaqueCat.pixiContainer.interactive = false;
	}
	
	function onTutorialIsHide(){
		if(beforeChoose){
			if(afterClickBuy){
				gr.lib._buttonDim.show(false);
			}else{
				gr.lib._buttonDim.show(true);
			}
		}else{
			gr.lib._buttonDim.show(true);
		}
	}
	
	function onTutorialIsShown(){
		gr.lib._buttonDim.show(false);
	}
	    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
	msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    return {};
});
