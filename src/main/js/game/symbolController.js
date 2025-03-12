/**
 * @module symbolController
 * @description symbol control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'game/revealDataSaveController',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
	'skbJet/componentCRDC/IwGameControllers/gameUtils',
	'game/configController'
], function (msgBus, gr, revealDataSaveController, SKBeInstant, audio, gameUtils, config) {
    
	var scenarioData, match3CounterIndexObj, match3PositionIndexObj, match2CounterIndexObj, match2PositionIndexObj, firstAwardCounterIndex, readyToPlayLightAnim, counterIndex, positionIndex, MTMReinitial, chosedAnimal;
	
	var unRevealedPositionArray = [], revealedPositionArray = [], revealedCounterArray = [], allSymbolsRevealedInGIP, resultData;
	
	var winMap = {}, winValue = 0, winboxErrorPublished = false;
	
	var counter4RevealAudioChannel = 0, counter4MatchAudioChannel = 0, counter4IWAudioChannel = 0;
	
    function onGameParametersUpdated(){
		for(var i = 0; i < 6; i++){
			(function(){
				var thisSprite = gr.lib['_Symbol_'+i];
				thisSprite.reveal = reveal;
				var thisClickSprite = gr.lib['_symbol'+i+'_clickArea'];
				thisClickSprite.on('click',function(){
					thisSprite.reveal();
				});
				thisClickSprite.on('mouseover',function(){
					thisClickSprite.pixiContainer.cursor = "pointer"; 
				});
				//clone light anim
				gr.animMap._winSymbolLightAnim.clone(['_symbol'+i+'_light'], '_winSymbolLightAnim'+i);
			})();
		}
    }
	
	function onStartUserInteraction(data){
		onReStartUserInteraction(data);
		if(SKBeInstant.config.wagerType === 'BUY'&&SKBeInstant.config.gameType === 'ticketReady'&&hasRevealData(data)){
			var revealData = revealDataSaveController.getRevealDataFromResponse(data);
			if(revealData){
				if(revealData.picker&&revealData.picker.animal){
					gr.lib._Logo.gotoAndPlay('logoAnim',0.5,true);
					chosedAnimal = revealData.picker.animal;
					if(revealData.symbols&&revealData.symbols.length>0){
						updateSymbols4GIP(revealData);
					}else{
						initialSymbols();
					}
				}
				updateWinValue4GIP(revealData);
			}
		}
	}
		
	function hasRevealData(data){
		return data.revealData&&data.revealData!=="null";
	}
	
	function onReStartUserInteraction(data){
		winboxErrorPublished = false;
		counter4RevealAudioChannel = 0;
		counter4MatchAudioChannel = 0;
		counter4IWAudioChannel = 0;
		readyToPlayLightAnim = {};
		match3PositionIndexObj = {};
		match2PositionIndexObj = {};
		match3CounterIndexObj = {};
		match2CounterIndexObj = {};
		resultData = data;
		scenarioData = resultData.scenario.replace('|',',').split(',');
		console.log(scenarioData);
		winValue = 0;
		getWinMap(data);
		getMatch2Or3CounterIndex();
		getFirstAwardCounterIndex();
	}
	
	function onPlayerChosedCATSNDOGS(data){
		gr.lib._Logo.gotoAndPlay('logoAnim',0.5,true);
		chosedAnimal = data.toLowerCase();
		initialSymbols();
	}
	
	function initialSymbols(){
		counterIndex = -1;
		gr.lib._Symbols.setImage(chosedAnimal+'SymbolBG');
		for(var k = 0; k < 6; k++){
			gr.lib['_symbol'+k+'_cover'].setImage(chosedAnimal+'SymbolAnim_0000');
			showSymbol(k, 'rotating');
			var rotatingStartFrame = k%2===0?0:5;
			gr.lib['_symbol'+k+'_rotating'].gotoAndPlay(chosedAnimal+'SymbolRotatingAnim',0.25,true,rotatingStartFrame);
		}
		enableSymbolsInteractive();
	}
	
	function updateSymbols4GIP(revealData){
		counterIndex = revealData.symbols.length-1;
		gr.lib._Symbols.setImage(chosedAnimal+'SymbolBG');
		getRevealedAndUnrevealedArray(revealData.symbols);
		enableSymbolsInteractive(unRevealedPositionArray);
		for(var i = 0; i<revealedCounterArray.length; i++){
			var tmpPosisiton = revealedPositionArray[i];
			var tmpCounter = revealedCounterArray[i];
			getMatch2Or3PositionIndex(tmpCounter, tmpPosisiton);
			setResultAndLightDimImages(tmpCounter, tmpPosisiton);
			var resultAnimName = gr.lib['_symbol'+tmpPosisiton+'_result'].getImage();
			resultAnimName = resultAnimName.match(/[a-z]+/ig)+'_0009';
			gr.lib['_symbol'+tmpPosisiton+'_result'].setImage(resultAnimName);
			showSymbol(tmpPosisiton, 'result');
			playHighLightAnim4GIP(tmpCounter, tmpPosisiton);
			if(tmpCounter === 5){
				if(SKBeInstant.config.customBehavior&&SKBeInstant.config.customBehavior.showTutorialAtBeginning === false){
					stopAllAnticipationAnim();
					showDimEffect();
					msgBus.publish("allRevealed", resultData);
					msgBus.publish("lastSymbolClicked");
				}else{
					allSymbolsRevealedInGIP = true;
				}
			}
		}
		for(var j = 0; j< unRevealedPositionArray.length; j++){
			var tmpPosition = unRevealedPositionArray[j];
			gr.lib['_symbol'+tmpPosition+'_cover'].setImage(chosedAnimal+'SymbolAnim_0000');
			showSymbol(tmpPosition, 'rotating');
			var rotatingStartFrame = tmpPosition%2===0?0:5;
			gr.lib['_symbol'+tmpPosition+'_rotating'].gotoAndPlay(chosedAnimal+'SymbolRotatingAnim',0.25,true,rotatingStartFrame);
		}
	}
	
	function onTutorialIsHide(){
		if(allSymbolsRevealedInGIP){
			stopAllAnticipationAnim();
			showDimEffect();
			msgBus.publish("allRevealed", resultData);
			msgBus.publish("lastSymbolClicked");
		}
	}
	
	function onEnterResultScreenState(){
		gr.lib._Logo.stopPlay();
		emptyDataSaveArrays();
	}
	
	function onPlayerWantsPlayAgain(){
		emptyDataSaveArrays();
		for(var i = 0; i < 6; i++){
			gr.animMap['_winSymbolLightAnim'+i].stop();
			showSymbol(i, 'cover');
		}
	}
	
	function onReInitialize(){
		if(MTMReinitial){
			emptyDataSaveArrays();
			for(var i = 0; i < 6; i++){
				gr.animMap['_winSymbolLightAnim'+i].stop();
				showSymbol(i, 'cover');
			}
			MTMReinitial = false;
		}
	}
	
	function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
	
	function emptyDataSaveArrays(){
		unRevealedPositionArray = [];
		revealedPositionArray = [];
		revealedCounterArray = [];
	}
		
	function reveal(){
		(function(_this){
			playRevealAudio();
			counterIndex++;
			if(counterIndex === 5){
				msgBus.publish('disableUI');
				msgBus.publish("lastSymbolClicked");
			}
			positionIndex = Number(_this.data._name.match(/\d/g)[0]);
			disableSymbolsInteractive(positionIndex);
			getMatch2Or3PositionIndex(counterIndex, positionIndex);
			setResultAndLightDimImages(counterIndex, positionIndex);
			gr.lib['_symbol'+positionIndex+'_rotating'].stopPlay();
			showSymbol(positionIndex, 'cover');
			gr.lib['_Symbol_'+positionIndex].revealed = true;
//			msgBus.publish("revealedOneSymbol",{letter:scenarioData[counterIndex], position: positionIndex, counter: counterIndex});
			playResultAnim(positionIndex);
			(function(pI, cI){
				gr.lib['_symbol'+pI+'_result'].onComplete=function(){
					msgBus.publish("revealedOneSymbol",{letter:scenarioData[cI], position: pI, counter: cI});
					gr.lib['_symbol'+pI+'_result'].onComplete=null;
					playWinAudio(cI);
					playHighLightAnim(cI, pI);
					if(winboxErrorPublished){return;}
					if(cI === 5){
						stopAllAnticipationAnim();
						showDimEffect();
						if(winValue !== resultData.prizeValue){
							publishWinBoxError();
						}else{
							msgBus.publish("allRevealed", resultData);
						}
					}
				};
			})(positionIndex, counterIndex);
		})(this);
	}
	
	function publishWinBoxError(){
		msgBus.publish('winboxError',{errorCode:'29000'});
		winboxErrorPublished = true;
		gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
	}
	
	function playHighLightAnim(counterIndex, positionIndex){
		var thisLetter = scenarioData[counterIndex];
		if(firstAwardCounterIndex===counterIndex){
			//首次中奖的第三个symbol或者第一个x
			playFirstHightLightAnim(counterIndex, positionIndex);
			updateWinValue(thisLetter);
		}else if(match3CounterIndexObj[thisLetter]){
			if(match3CounterIndexObj[thisLetter][1]===counterIndex&&thisLetter!=='X'){
				//非首次中奖的第二个symbol
				playAnticipationAnim(counterIndex, positionIndex);
			}else if(match3CounterIndexObj[thisLetter][2]===counterIndex||thisLetter==='X'){
				//非首次中奖的第三个symbol或者任意x
				setReadyToPlayLightAnim(counterIndex, positionIndex);
				updateWinValue(thisLetter);
			}
		}else if(match2CounterIndexObj[thisLetter]&&(match2CounterIndexObj[thisLetter][1]===counterIndex&&counterIndex!==5)){
			//未中奖的第二个symbol，并且不能是最后一个symbol
			playAnticipationAnim(counterIndex, positionIndex);			
		}
	}
	
	function playHighLightAnim4GIP(counterIndex, positionIndex){
		var thisLetter = scenarioData[counterIndex];
		if(firstAwardCounterIndex===counterIndex){
			//首次中奖的第三个symbol或者第一个x
			playFirstHightLightAnim(counterIndex, positionIndex);
		}else if(match3CounterIndexObj[thisLetter]){
			if(match3CounterIndexObj[thisLetter][2]===counterIndex||thisLetter==='X'){
				//非首次中奖的第三个symbol或者任意x
				setReadyToPlayLightAnim(counterIndex, positionIndex);
			}
		}
	}
	
	function playFirstHightLightAnim(counterIndex, positionIndex){
		var letter = scenarioData[counterIndex];
		if(letter === 'X'){
			playFirstXLightAnim(positionIndex);
		}else{
			playFirstSymbolLightAnim(counterIndex, positionIndex);
		}
	}
	
	function playFirstXLightAnim(positionIndex){
		showSymbol(positionIndex,'light');
		msgBus.publish('symbolLightAnimStart', 'X');
		gr.lib['_symbol'+positionIndex+'_sparkles'].gotoAndPlay('sparkles',0.5,true);
		gr.animMap['_winSymbolLightAnim'+positionIndex].play();
		gr.animMap['_winSymbolLightAnim'+positionIndex]._onComplete = function(){
			msgBus.publish('firstLightAnimComplete');
			gr.animMap['_winSymbolLightAnim'+positionIndex].play();
		};
	}
	
	function playFirstSymbolLightAnim(counterIndex){
		var letter = scenarioData[counterIndex];
		var allNeedToPlayPositionIndex = match3PositionIndexObj[letter];
		stopAnticipationAnim(letter);
		for(var i = 0; i < allNeedToPlayPositionIndex.length; i++){
			var targetPositionIndex = allNeedToPlayPositionIndex[i];
			playLoopLightAnim(letter, targetPositionIndex, true);
		}
	}
	
	function playLoopLightAnim(letter, positionIndex, firstAnim){
		showSymbol(positionIndex,'light');
		msgBus.publish('symbolLightAnimStart', letter);
		gr.lib['_symbol'+positionIndex+'_sparkles'].gotoAndPlay('sparkles',0.5,true);
		gr.animMap['_winSymbolLightAnim'+positionIndex].play();
		gr.animMap['_winSymbolLightAnim'+positionIndex]._onComplete = function(){
			if(firstAnim){msgBus.publish('firstLightAnimComplete');}
			gr.animMap['_winSymbolLightAnim'+positionIndex].play();
		};
	}
	
	function setReadyToPlayLightAnim(counterIndex, positionIndex){
		var thisLetter = scenarioData[counterIndex];
		if(!readyToPlayLightAnim[thisLetter]){readyToPlayLightAnim[thisLetter] = [];}
		if(thisLetter==='X'){
			//如果是x，只改变flag表示该index现在准备好播放动画了，等监听第一次结束后再播
			readyToPlayLightAnim.X.push(positionIndex);
		}else{
			//如果是symbol，只改变flag表示该index现在准备好播放动画了，等监听第一次结束后再播
			readyToPlayLightAnim[thisLetter] = readyToPlayLightAnim[thisLetter].concat(match3PositionIndexObj[thisLetter]);
		}
	}
	
	function firstLightAnimComplete(){
		if(Object.keys(readyToPlayLightAnim).length===0){return;}
		var allXReadyToPlayIndex,allSymbolReadyToPlayIndex;
		for(var letter in readyToPlayLightAnim){
			if(letter === 'X'){
				allXReadyToPlayIndex = readyToPlayLightAnim.X;
				for(var i = 0; i<allXReadyToPlayIndex.length; i++){
					var targetPositionIndex = allXReadyToPlayIndex[i];
					playLoopLightAnim(letter, targetPositionIndex, false);
					allXReadyToPlayIndex.splice(i--, 1);
				}
				if(allXReadyToPlayIndex.length === 0){
					delete readyToPlayLightAnim.X;
				}
			}else{
				stopAnticipationAnim(letter);
				allSymbolReadyToPlayIndex = readyToPlayLightAnim[letter];
				for(var i = 0; i<allSymbolReadyToPlayIndex.length; i++){
					var targetPositionIndex = allSymbolReadyToPlayIndex[i];
					playLoopLightAnim(letter, targetPositionIndex, false);
					readyToPlayLightAnim[letter].splice(i--, 1);
				}
				if(allSymbolReadyToPlayIndex.length === 0){
					delete readyToPlayLightAnim[letter];
				}
			}
		}
	}
	
	function playAnticipationAnim(counterIndex, positionIndex){
		var thisLetter = scenarioData[counterIndex];
		//set the second symbol
		showSymbol(positionIndex,'result');
		var animName2 = gr.lib['_symbol'+positionIndex+'_result'].getImage();
		animName2 = animName2.match(/[a-z]+/ig);
		gr.lib['_symbol'+positionIndex+'_result'].gotoAndPlay(animName2,0.3,false);
		//set the first symbol
		var firstPositionIndex = match2PositionIndexObj[thisLetter]?match2PositionIndexObj[thisLetter][0]:match3PositionIndexObj[thisLetter][0];
		showSymbol(firstPositionIndex,'result');
		var animName1 = gr.lib['_symbol'+firstPositionIndex+'_result'].getImage();
		animName1 = animName1.match(/[a-z]+/ig);
		gr.lib['_symbol'+firstPositionIndex+'_result'].gotoAndPlay(animName1,0.3,false);
	}
	
	function stopResultAnimAndGotoLastFrame(targetIndex){
		if(gr.lib['_symbol'+targetIndex+'_result'].gotoAndStop){
			gr.lib['_symbol'+targetIndex+'_result'].gotoAndStop(9);
		}else if(gr.lib['_symbol'+targetIndex+'_result'].pixiContainer.$sprite.gotoAndStop){
			gr.lib['_symbol'+targetIndex+'_result'].pixiContainer.$sprite.gotoAndStop(9);
		}else{
			gr.lib['_symbol'+targetIndex+'_result'].stopPlay();
			var resultAnimName = gr.lib['_symbol'+targetIndex+'_result'].getImage();
			resultAnimName = resultAnimName.match(/[a-z]+/ig)+'_0009';
			gr.lib['_symbol'+targetIndex+'_result'].setImage(resultAnimName);
		}
	}
	
	function stopAnticipationAnim(letter){
		for(var i = 0; i < 2; i++){
			var targetIndex = match2PositionIndexObj[letter]?match2PositionIndexObj[letter][i]:match3PositionIndexObj[letter][i];
			stopResultAnimAndGotoLastFrame(targetIndex);
			showSymbol(targetIndex,'result');
		}
	}
	
	function stopAllAnticipationAnim(){
		if(Object.keys(match2PositionIndexObj).length===0){return;}
		for(var letter in match2PositionIndexObj){
			var currentArray = match2PositionIndexObj[letter];
			currentArray.forEach(function(index){
				stopResultAnimAndGotoLastFrame(index);
				showSymbol(index,'result');
			});
		}
	}	
	
	function showSymbol(index,type){
		var allSymbolChildren = Object.keys(gr.lib['_Symbol_'+index].sprites);
		allSymbolChildren.forEach(function(item){gr.lib[item].show(false);});
		gr.lib['_symbol'+index+'_'+type].show(true);
		if(type === 'rotating'){
			gr.lib['_symbol'+index+'_clickArea'].show(true);
		}
		if(type === 'cover'){
			if(gr.lib['_symbol'+index+'_'+type].gotoAndStop){
				gr.lib['_symbol'+index+'_'+type].gotoAndStop(0);
			}else if(gr.lib['_symbol'+index+'_'+type].pixiContainer.$sprite.gotoAndStop){
				gr.lib['_symbol'+index+'_'+type].pixiContainer.$sprite.gotoAndStop(0);
			}
		}
		if(type === 'dim'){
			gr.lib['_symbol'+index+'_result'].show(true);
		}
		if(type === 'light'){
			gr.lib['_symbol'+index+'_sparkles'].show(true);
		}
	}
	
	function playResultAnim(positionIndex){
		var coverAnimName = chosedAnimal+'SymbolAnim';
		gr.lib['_symbol'+positionIndex+'_cover'].gotoAndPlay(coverAnimName,0.3,false);
		gr.lib['_symbol'+positionIndex+'_cover'].pixiContainer.$sprite.onFrameChange = function(){
			if(this.currentFrame === 7){
				showSymbol(positionIndex,'result');
				gr.lib['_symbol'+positionIndex+'_cover'].show(true);
				var animName = gr.lib['_symbol'+positionIndex+'_result'].getImage();
				animName = animName.match(/[a-z]+/ig);
				gr.lib['_symbol'+positionIndex+'_result'].gotoAndPlay(animName,0.3,false);
			}
			if(this.currentFrame === 10){
				gr.lib['_symbol'+positionIndex+'_cover'].show(false);
			}
		};
	}
	
	function showDimEffect(){
		var winIndex = [];
		for(var letter in match3PositionIndexObj){
			winIndex = winIndex.concat(match3PositionIndexObj[letter]);
		}
		for(var i = 0; i < 6; i++){
			if(winIndex.indexOf(i)===-1){
				var resultAnimName = gr.lib['_symbol'+i+'_result'].getImage();
				resultAnimName = resultAnimName.match(/[a-z]+/ig)+'_0009';
				gr.lib['_symbol'+i+'_result'].setImage(resultAnimName);
				showSymbol(i,'dim');
			}
		}
	}
	
	function getMatch2Or3CounterIndex(){
		var tmpJSON = {};
		scenarioData.forEach(function(letter,index){
			if(tmpJSON[letter]){
				tmpJSON[letter].push(index);
			}else{
				tmpJSON[letter] = [index];
			}			
		});
		for(var letter in tmpJSON){
			if(letter === 'X'){
				match3CounterIndexObj.X = tmpJSON.X;
			}else if(tmpJSON[letter].length === 2){
				match2CounterIndexObj[letter] = tmpJSON[letter];		
			}else if(tmpJSON[letter].length === 3){
				match3CounterIndexObj[letter] = tmpJSON[letter];
			}
		}
	}
	
	function getMatch2Or3PositionIndex(counterIndex, positionIndex){
		var thisLetter = scenarioData[counterIndex];
		if(match3CounterIndexObj[thisLetter]){
			if(!match3PositionIndexObj[thisLetter]){match3PositionIndexObj[thisLetter] = [];}
			match3PositionIndexObj[thisLetter].push(positionIndex);
		}
		if(match2CounterIndexObj[thisLetter]){
			if(!match2PositionIndexObj[thisLetter]){match2PositionIndexObj[thisLetter] = [];}
			match2PositionIndexObj[thisLetter].push(positionIndex);
		}
	}
	
	function getFirstAwardCounterIndex(){
		if(Object.keys(match3CounterIndexObj).length===0){
			firstAwardCounterIndex = -1;
		}else{
			var tmpIndex = [];
			for(var letter in match3CounterIndexObj){
				if(letter === 'X'){
					tmpIndex.push(match3CounterIndexObj[letter][0]);
				}else{
					tmpIndex.push(match3CounterIndexObj[letter][2]);
				}
			}
			tmpIndex.sort(function(a,b){return a-b;});
			firstAwardCounterIndex = tmpIndex[0];
		}
	}
	
	function getResultImage(index){
		var resultImage = '';
		switch(scenarioData[index]){
			case "A":
				resultImage = chosedAnimal==='dog'?"beef":"fish";
				break;
			case "B":
				resultImage = chosedAnimal==='dog'?"ball":"catToilet";
				break;
			case "C":
				resultImage = chosedAnimal==='dog'?"can":"catCan";
				break;
			case "D":
				resultImage = chosedAnimal==='dog'?"food":"catFood";
				break;
			case "E":
				resultImage = chosedAnimal==='dog'?"bone":"catToy";
				break;
			case "F":
				resultImage = chosedAnimal==='dog'?"uga":"wool";
				break;
			case "X":
				resultImage = chosedAnimal==='dog'?"hotdog":"mouse";
				break;
		}
		return resultImage;
	}
	
	function setResultAndLightDimImages(counterIndex, positionIndex){
		var resultImage = getResultImage(counterIndex);
		gr.lib['_symbol'+positionIndex+'_result'].setImage(resultImage+'_0000');
		gr.lib['_symbol'+positionIndex+'_light'].setImage(resultImage+'HighLightAnim');
		gr.lib['_symbol'+positionIndex+'_dim'].setImage(resultImage+'_dim');
	}
	
	function enableSymbolsInteractive(IndexArr){
		for(var i = 0;i<6;i++){
			(function(){
				var thisClickSprite = gr.lib['_symbol'+i+'_clickArea'];
				var thisSprite = gr.lib['_Symbol_'+i];
				if(IndexArr){
					if(IndexArr.indexOf(i)===-1){
						thisSprite.revealed = true;
						thisClickSprite.pixiContainer.interactive = false;
					}else{
						thisSprite.revealed = false;
						thisClickSprite.pixiContainer.interactive = true;
					}
				}else{
					thisSprite.revealed = false;
					thisClickSprite.pixiContainer.interactive = true;
				}
			})();
		}
	}
	
	function disableSymbolsInteractive(positionIndex){
		var thisClickSprite = gr.lib['_symbol'+positionIndex+'_clickArea'];
		thisClickSprite.pixiContainer.interactive = false;
	}
	
	function getRevealedAndUnrevealedArray(revealSaveSymbols){
		revealSaveSymbols.forEach(function(item){
			revealedPositionArray.push(item.position);
			revealedCounterArray.push(item.counter);
		});
		for(var i = 0; i < 6; i++){
			if(revealedPositionArray.indexOf(i)===-1){
				unRevealedPositionArray.push(i);
			}
		}
	}
	
	function getWinMap(data){
		data.prizeTable.forEach(function(item){
			var letter = item.description;
			if(item.description.indexOf('IW')>-1){
				if(item.description==='IW'+data.scenario.slice(-1)){
					winMap.X = item.prize;
				}
			}else{
				winMap[letter] = item.prize;
			}
		});
	}
	
	function updateWinValue(letter) {
        winValue += Number(winMap[letter]);
		if(winValue > resultData.prizeValue){
			publishWinBoxError();
		}else{
			gr.lib._winsValue.setText(SKBeInstant.formatCurrency(winValue).formattedAmount);
		}
        gameUtils.fixMeter(gr);
    }
	
	function updateWinValue4GIP(revealData){
		var letterMap = {}, winLetters = [];
		if(revealData.symbols&&revealData.symbols.length){
			revealData.symbols.forEach(function(item){
				var letter = scenarioData[item.counter];
				if(letterMap[letter]){
					letterMap[letter]++;
				}else{
					letterMap[letter] = 1;
				}
			});
		}else{
			return;
		}
		for(var letter in letterMap){
			if(letter === 'X'){
				for(var i = 0; i<letterMap[letter]; i++){
					winLetters.push('X');
				}
			}else if(letterMap[letter]===3){
				winLetters.push(letter);
			}
		}
		winLetters.forEach(function(letter){
			winValue += Number(winMap[letter]);
		});
		if(winValue > 0){
			gr.lib._winsValue.setText(SKBeInstant.formatCurrency(winValue).formattedAmount);
		}
        gameUtils.fixMeter(gr);
	}
	
	function playWinAudio(counterIndex){
		var thisLetter = scenarioData[counterIndex], audioName, audioChannel;
		if(thisLetter === 'X'){
			audioName = 'InstantWin';
			audioChannel = (counter4IWAudioChannel++)%3+4;//[4,5,6]
			audio.play(audioName, audioChannel);
		}else if(match3CounterIndexObj[thisLetter]&&(firstAwardCounterIndex===counterIndex||match3CounterIndexObj[thisLetter][2]===counterIndex)){
			audioName = chosedAnimal === 'dog'? 'Match2' : 'Match1';
			audioChannel = (counter4MatchAudioChannel++)%2+3;//[3, 4]
			audio.play(audioName, audioChannel);
		}
	}
	
	function playRevealAudio(){
		audio.play(config.audio.Reveal1.name, (counter4RevealAudioChannel++)%2+1);//[1,2]
	}
	
	    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('playerChosedCATSNDOGS',onPlayerChosedCATSNDOGS);
	msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	msgBus.subscribe('firstLightAnimComplete', firstLightAnimComplete);
    return {};
});