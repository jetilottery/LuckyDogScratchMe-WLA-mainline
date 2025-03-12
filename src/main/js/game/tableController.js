/**
 * @module tableController
 * @description table control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/componentCRDC/IwGameControllers/gameUtils',
	'game/revealDataSaveController'
], function (msgBus, gr, loader, SKBeInstant, gameUtils, revealDataSaveController) {
    
	var prizeTable = null;
	var configArray = null;
	var defaultPrice = null;
	var counterLetter = null;
	var chosedAnimal = null;
	var scenarioData = null;
	var orignX = null;
	var orientation = null;
	var listAnimationCounter = null;
	var orderArray = ['A','B','C','D','E','F'];
	var strokeColor = {
		dog:{
			'normal':'006600',
			'win':'D34F16'
		},
		cat:{
			'normal':'BD0654',
			'win':'FF3333'
		}
	};
		
    function onGameParametersUpdated(){
		orientation = SKBeInstant.getGameOrientation();
		configArray = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
		defaultPrice = SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault;
		orignX = Number(gr.lib._IW_line._currentStyle._left);
		getPrizeTable(defaultPrice);
		addShadow4IWText();
		cloneIconLightAnimation();
    }
	
	function onTicketCostChanged(prizePoint){
        getPrizeTable(prizePoint);
    }
	
	function onStartUserInteraction(data){
		onReStartUserInteraction(data);
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var revealData = revealDataSaveController.getRevealDataFromResponse(data);
			if(revealData){//&&revealData.prizeTable){
				//prizeTable = revealData.prizeTable;
				initializeIWText(data);
				setIWcentered();
				if(revealData.picker&&revealData.picker.animal){
					chosedAnimal = revealData.picker.animal;
					initializeIWImage();
					initializeListIcon();
					initializeListText();
					updateDataSaveTablePhotoLandscapeBG(revealData);
					if(revealData.symbols&&revealData.symbols.length>0){
						updateDataSaveIconAndTextColor(revealData);
					}
				}
			}
		}
	}
	
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}
	
	function onReStartUserInteraction(data){
		scenarioData = data.scenario.replace('|',',').split(',');
		listAnimationCounter = {'A':-1,'B':-1,'C':-1,'D':-1,'E':-1,'F':-1};
		counterLetter = {'A':-1,'B':-1,'C':-1,'D':-1,'E':-1,'F':-1};
		initializeIWText(data);
		setIWcentered();
	}
	
	function onPlayerChosedCATSNDOGS(data){
		chosedAnimal = data.toLowerCase();
		initializeIWImage();
		initializePhoto();
		initializeListIcon();
		initializeListText();
	}
	
	function onRevealedOneSymbol(data){
		var letter = data.letter;
		if(letter !== 'X'){
			counterLetter[letter]++;
			var orderArray = ['A','B','C','D','E','F'];
			var index = orderArray.indexOf(letter);
			gr.lib['_iconImage'+index+'_'+counterLetter[letter]].show(false);
			gr.lib['_iconLight'+index+'_'+counterLetter[letter]].show(true);
			gr.animMap['_iconLight'+index+'_'+counterLetter[letter]+'WinAnim'].play();
			if(counterLetter[letter]>=2){
				gr.lib['_moneyText'+index].updateCurrentStyle({
					"_text": {
						"_color": "FFFF00",
						"_strokeColor": strokeColor[chosedAnimal].win
					},
					"_font": {
						"_size":28
					}
				});
			}
		}
	}
	
	function symbolLightAnimStart(letter){
		if(letter === 'X'){
			playIWAnimation();
		}else{
			listAnimationCounter[letter]++;
			if(listAnimationCounter[letter]===0){
				playListAnimation(letter);
			}
		}
	}
	
	function playIWAnimation(){
		gr.lib._iconImage6_0.show(false);
		gr.lib._iconLight6_0.show(true);
		gr.lib._IW_anim.show(true);
		if(gr.animMap._IWIcon_Anim.isPlaying){gr.animMap._IWIcon_Anim.stop();}
		gr.animMap._IWIcon_Anim.play();
		gr.animMap._IWIcon_Anim._onComplete = function(){
			gr.lib._iconImage6_0.show(true);
			gr.lib._iconLight6_0.show(false);
		};
		if(gr.lib._IW_anim.playing){gr.lib._IW_anim.stopPlay();}
		gr.lib._IW_anim.gotoAndPlay(chosedAnimal+'InstantWinAnim', 0.8, false);
		gr.lib._IW_anim.onComplete = function(){
			gr.lib._IW_anim.show(false);
		};
	}
	
	function playListAnimation(letter){
		var orderArray = ['A','B','C','D','E','F'];
		var index = orderArray.indexOf(letter);
		stopIconWinAnimInLine(index);
		gr.animMap['_tableIcon'+index+'Anim'].play();
		gr.animMap['_tableIcon'+index+'Anim']._onComplete = function(){
			gr.animMap['_tableIcon'+index+'Anim'].play();
		};
	}
	
	function stopIconWinAnimInLine(index){
		for(var i = 0; i < 3; i++){
			var animSprite = gr.animMap['_iconLight'+index+'_'+i+'WinAnim'];
			if(animSprite.isPlaying){
				animSprite.stop();
				gr.lib['_iconLight'+index+'_'+i].updateCurrentStyle({
					"_opacity": "1",
					"_transform": {
						"_scale": {
							"_x": "1.1",
							"_y": "1.1"
						}
					}
				});
			}
		}
	}
	
	function getPrizeTable(targetPrice){
		if(configArray){
			for(var i = 0;i<configArray.length;i++){
				if(Number(configArray[i].price) === Number(targetPrice)){
					prizeTable = configArray[i].prizeTable;
					break;
				}
			}
		}
	}
	
	function cloneIconLightAnimation(){
		for(var i = 1; i < 6; i++){
			gr.animMap._tableIcon0Anim.clone(['_iconLight'+i+'_0','_iconLight'+i+'_1', '_iconLight'+i+'_2'], '_tableIcon'+i+'Anim');
		}
		for(var m = 0; m < 6; m++){
			for(var n = 0; n < 3; n++){
				if(m===0&&n===0){continue;}
				gr.animMap._iconLight0_0WinAnim.clone(['_iconLight'+m+'_'+n], '_iconLight'+m+'_'+n+'WinAnim');
			}
		}
	}
	
	function setIWcentered(){
		var imageW = Number(gr.lib._IW_image._currentStyle._width);
		var textW = Number(gr.lib._IW_text.pixiContainer.$text.width);
		var totalW = Number(gr.lib._IW_line._currentStyle._width);
		var targetX = orignX + (totalW - imageW - textW)/2;
		gr.lib._IW_line.updateCurrentStyle({"_left": targetX});
	}
	
	function initializeIWText(data){
		var iwLevel = Number(data.scenario.replace('|',',').split(',').pop()),iwText;
		for(var i = 0; i < prizeTable.length; i++){
			if(prizeTable[i].description===('IW'+iwLevel)){
				iwText = prizeTable[i].prize;
				break;
			}
		}
		gr.lib._IW_text.autoFontFitText=true;
		gr.lib._IW_text.setText('= '+SKBeInstant.formatCurrency(iwText).formattedAmount);
	}
	
	function initializeIWImage(){
		gr.lib._iconImage6_0.setImage(chosedAnimal+'IconImage6');
		gr.lib._iconLight6_0.setImage(chosedAnimal==='dog'?'hotDogIconImageLight6':'catIconImageLight6');
		gr.lib._iconImage6_0.show(true);
		gr.lib._iconLight6_0.show(false);
		gr.lib._IW_anim.show(false);
	}
	
	function initializeListIcon(){
		for(var i = 0; i < 6; i++){
			if(gr.animMap['_tableIcon'+i+'Anim'].isPlaying){
				gr.animMap['_tableIcon'+i+'Anim'].stop();
			}
			for(var j = 0; j < 3; j++){
				gr.lib['_iconImage'+i+'_'+j].setImage(chosedAnimal+'IconImage'+i);
				gr.lib['_iconLight'+i+'_'+j].setImage(chosedAnimal+'IconImageLight'+i);
				gr.lib['_iconImage'+i+'_'+j].show(true);
				gr.lib['_iconLight'+i+'_'+j].show(false);
			}
		}
	}
	
	function initializeListText(){
		for(var i = 0; i < 6; i++){
			gr.lib['_moneyText'+i].autoFontFitText = true;
			gr.lib['_moneyText'+i].updateCurrentStyle({
				"_text": {
					"_color": "FFFFFF",
					"_strokeColor": strokeColor[chosedAnimal].normal
				},
				"_font": {
					"_size":26
				}
			});
			gr.lib['_moneyText'+i].setText(SKBeInstant.formatCurrency(prizeTable[i].prize).formattedAmount);
		}
	}
	
	function initializePhoto(){
		var rdmPhotoNum = Math.floor(Math.random()*4);//[0,1,2,3]
		var rdmDayNightNum = Math.round(Math.random()+1);//[1,2]
		var photoNum = rdmPhotoNum;
		var dayNightNum = rdmDayNightNum;
		gr.lib._table.setImage(chosedAnimal+'TableBG'+(orientation==="portrait"?'Portrait':''));
		gr.lib._photo.setImage(chosedAnimal+'_000'+photoNum);
		gr.lib._landscapeBG.setImage(chosedAnimal+orientation.charAt(0).toUpperCase()+orientation.substring(1)+'BG_0'+dayNightNum);
		msgBus.publish('updatePhotoBG',{photoNum: photoNum, dayNightNum: dayNightNum});
	}
	
	function updateDataSaveTablePhotoLandscapeBG(revealData){
		var savedPicker, photoNum, dayNightNum;
		var rdmPhotoNum = Math.floor(Math.random()*4);//[0,1,2,3]
		var rdmDayNightNum = Math.round(Math.random()+1);//[1,2]
		savedPicker = revealData.picker;
		photoNum = /\d/.test(savedPicker.photoNum)? savedPicker.photoNum : rdmPhotoNum;
		dayNightNum = /\d/.test(savedPicker.dayNightNum)? savedPicker.dayNightNum : rdmDayNightNum;
		gr.lib._table.setImage(chosedAnimal+'TableBG'+(orientation==="portrait"?'Portrait':''));
		gr.lib._photo.setImage(chosedAnimal+'_000'+photoNum);
		gr.lib._landscapeBG.setImage(chosedAnimal+orientation.charAt(0).toUpperCase()+orientation.substring(1)+'BG_0'+dayNightNum);
	}
	
	function updateDataSaveIconAndTextColor(revealData){
		for(var i = 0; i < revealData.symbols.length; i++){
			var counterIndex = revealData.symbols[i].counter;
			var thisLetter = scenarioData[counterIndex];
			if(thisLetter !== 'X'){
				counterLetter[thisLetter]++;
				var index = orderArray.indexOf(thisLetter);
				gr.lib['_iconImage'+index+'_'+counterLetter[thisLetter]].show(false);
				gr.lib['_iconLight'+index+'_'+counterLetter[thisLetter]].show(true);
				if(counterLetter[thisLetter]>=2){
					gr.lib['_moneyText'+index].updateCurrentStyle({
						"_text": {
							"_color": "FFFF00",
							"_strokeColor": strokeColor[chosedAnimal].win
						},
						"_font": {
							"_size":28
						}
					});
				}
			}
		}
	}
	
	function addShadow4IWText(){
		gameUtils.setTextStyle(gr.lib._IW_text, {
			padding: 2,
			dropShadow: true,
			dropShadowColor: '#3B2237',
			dropShadowDistance: 4.0
		});
	}
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe("revealedOneSymbol",onRevealedOneSymbol);
	msgBus.subscribe('playerChosedCATSNDOGS',onPlayerChosedCATSNDOGS);
	msgBus.subscribe('symbolLightAnimStart', symbolLightAnimStart);
    return {};
});