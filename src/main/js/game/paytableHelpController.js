define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
        'skbJet/component/pixiResourceLoader/pixiResourceLoader',
		'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
        'skbJet/component/SKBeInstant/SKBeInstant',
        'game/configController'
	], function(msgBus, gr, loader, audio, SKBeInstant, config){
    var headerHeight = 48;
    var buttonHeight = 27;
    var buttonBottom = 3;
    function onSystemInit(){
        var articles=document.getElementsByTagName('article');
        for(var i=0;i<articles.length;i++){
            articles[i].addEventListener('mousedown',preventDefault,false);
        }
        document.addEventListener('mousemove',preventDefault,false);
	}

    function preventDefault(e){
        var ev=e||window.event;
        ev.returnValue=false;
        ev.preventDefault();
    }

    function onGameInit(){
        registerConsole();   
    }

    function onBeforeShowStage(){
        fillHeaders();
        fillContent();
        fillCloseBtn();
        if(config.helpClickList){
            registerHelpList();
        }
        setStyle();
        window.addEventListener('resize',onWindowResize);
    }
    
	function setStyle(){
        var height = window.innerHeight;

        document.getElementById("gameRulesHeader").style.height = headerHeight+'px';
        document.getElementById("paytableHeader").style.height = headerHeight+'px';
        var bodyHeight = height - (headerHeight + buttonHeight + 2*buttonBottom);
        document.getElementById("gameRulesArticle").style.height = bodyHeight+'px';
        document.getElementById("gameRulesArticle").style.top = headerHeight+'px';
        document.getElementById("paytableArticle").style.height = bodyHeight+'px';
        document.getElementById("paytableArticle").style.top = headerHeight+'px';

        var buttons = document.getElementsByClassName("closeBtn");
        for(var i=0; i< buttons.length; i++){
            buttons[i].style.height = buttonHeight + 'px';
            buttons[i].style.bottom = buttonBottom + 'px';
        }
    }

    function onWindowResize(){
        var height = window.innerHeight;
        var bodyHeight = height - (headerHeight + buttonHeight + 2*buttonBottom);
        document.getElementById("gameRulesArticle").style.height = bodyHeight+'px';
        document.getElementById("paytableArticle").style.height = bodyHeight+'px';
    }
    
    function onStartUserInteraction(){
        //disableConsole();
        enableConsole();       
    }
    
    function onReStartUserInteraction(){
        //disableConsole();   
        enableConsole();     
    }
    
    function onReInitialize(){
         enableConsole();  
    }

    function registerConsole(){
        var paytableText, howToPlayText;
        if(SKBeInstant.isWLA()){
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        }else{
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'paytable',
                    text:paytableText,
                    enabled:1
                }]
            }
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'howToPlay',
                    text:howToPlayText,
                    enabled:1
                }]
            }
        });
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[1]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[1]}
        });
    }  
    
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[0]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[0]}
        });
    }

    function fillHeaders(){
        var gameRulesHeader = document.getElementById('gameRulesHeader');
        var payTableHeader = document.getElementById('paytableHeader');
        var paytableText, howToPlayText;
        if (SKBeInstant.isWLA()) {
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        } else {
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        gameRulesHeader.innerHTML = howToPlayText;
        payTableHeader.innerHTML = paytableText;
    }

    function fillContent(){
        //fill paytable
        var paytableText = loader.i18n.paytableHTML.replace(/\"/g,"'");
		paytableText = paytableText.replace('{name}','<section><h1>'+ loader.i18n.title+ '</h1></section>');
		var tHead = '';
        var tBody = '';
        
        var showOddsPerTier = true;
        var additionalText = "";
        var links = "";
		if (SKBeInstant.isWLA()) {
            if (SKBeInstant.config.customBehavior) {
                if (SKBeInstant.config.customBehavior.paytableShow_OddsPerTier !== undefined ) {
                    showOddsPerTier = SKBeInstant.config.customBehavior.paytableShow_OddsPerTier;
                }
                if (SKBeInstant.config.customBehavior.paytable_AdditionalText !== undefined ) {
                    if(SKBeInstant.config.customBehavior.paytable_AdditionalText.trim().length > 0){
                        additionalText = SKBeInstant.config.customBehavior.paytable_AdditionalText;
                    }
                }
                if (SKBeInstant.config.customBehavior.paytable_Links !== undefined ) {
                    if(SKBeInstant.config.customBehavior.paytable_Links.trim().length >0){
                        links = SKBeInstant.config.customBehavior.paytable_Links;
                    }
                }
            } else if (loader.i18n.gameConfig) {
                if (loader.i18n.gameConfig.paytableShow_OddsPerTier !== undefined ) {
                    showOddsPerTier = loader.i18n.gameConfig.paytableShow_OddsPerTier;
                }
                if (loader.i18n.gameConfig.paytable_AdditionalText !== undefined ) {
                    if(loader.i18n.gameConfig.paytable_AdditionalText.trim().length > 0){
                        additionalText = loader.i18n.gameConfig.paytable_AdditionalText;
                    }
                }
                if (loader.i18n.gameConfig.paytable_Links !== undefined ) {
                    if(loader.i18n.gameConfig.paytable_Links.trim().length >0){
                        links = loader.i18n.gameConfig.paytable_Links;
                    }
                }
            }
            tHead = '<table><thead><th>'+ loader.i18n.MenuCommand.WLA.prizeDivision + '</th><th>' + loader.i18n.MenuCommand.WLA.prizeValue + '</th><th>' + loader.i18n.MenuCommand.WLA.approximatePrize + '</th>';
            tHead += showOddsPerTier ? '<th>' + loader.i18n.MenuCommand.WLA.oddsPerPlay + '</th></thead>': '</thead>';
        } else {
            tHead = '<table><thead><th>'+ loader.i18n.Game.prizeLevel + '</th><th>' + loader.i18n.Game.prizeValue + '</th></thead>';
        }
		
        var revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        var i, j;
        
		if (SKBeInstant.isWLA()) {
            tBody += '<section><p style=\"font-size:14px;\">'+loader.i18n.MenuCommand.WLA.availablePrices+'</p></section>';
            var availablePrices = "";
			for (i = 0; i < revealConfigurations.length; i++) {
                var numberOfRemainingWinners = 0;
                var price = SKBeInstant.formatCurrency(revealConfigurations[i].price).formattedAmount;
                availablePrices += i === 0 ?  price : " ,"+ price; 
				tBody += '<section><h2>' + loader.i18n.Game.paytableWager +"" +price + '</h2><p> </p>';
				// tBody += '<p>' + loader.i18n.MenuCommand.WLA.overAllOdds.replace('{oddNum}', (SKBeInstant.config.gameConfigurationDetails.numberOfUnsoldWagers/SKBeInstant.config.gameConfigurationDetails.numberOfRemainingWinners).toFixed(2)) + '</p><p> </p>';
				tBody += '<p>' + loader.i18n.MenuCommand.WLA.overAllOdds + '</p><p> </p>';
				tBody += tHead;
				tBody += '<tbody>';
				var prizeStructure = revealConfigurations[i].prizeStructure;
				var prizeDivision, prizeValue, prizeRemaining, perPlay;
				for(j=0; j< prizeStructure.length-1; j++){
					prizeDivision = prizeStructure[j].division;
					prizeValue = SKBeInstant.formatCurrency(prizeStructure[j].prize).formattedAmount;
                    prizeRemaining = prizeStructure[j].numberOfRemainingWinners;
                    numberOfRemainingWinners += prizeStructure[j].numberOfRemainingWinners;
                    if(showOddsPerTier){
                        perPlay = '1:' + (prizeStructure[j].numberOfUnsoldWagers/prizeStructure[j].numberOfRemainingWinners).toFixed(2);
                        tBody += '<tr><td nowrap="nowrap">' + prizeDivision + '</td><td nowrap="nowrap">' + prizeValue + '</td><td nowrap="nowrap">' + prizeRemaining + '</td><td nowrap="nowrap">' + perPlay + '</td></tr>';                
                    }else{
                        tBody += '<tr><td nowrap="nowrap">' + prizeDivision + '</td><td nowrap="nowrap">' + prizeValue + '</td><td nowrap="nowrap">' + prizeRemaining + '</td></tr>';                
                    }
                }
                tBody = tBody.replace('{oddNum}', (SKBeInstant.config.gameConfigurationDetails.numberOfUnsoldWagers/numberOfRemainingWinners).toFixed(2));
				tBody += '</tbody></table></section>';            
            }
            tBody = tBody.replace('{prices}', availablePrices);
            if(additionalText.length > 0){
                tBody += additionalText;
            }      
            if(links.length > 0){
                tBody += links;
            }      
		} else {
			for (i = 0; i < revealConfigurations.length; i++) {
				tBody += '<h2>' + loader.i18n.Game.paytableWager + SKBeInstant.formatCurrency(revealConfigurations[i].price).formattedAmount + '</h2><p> </p>';
				tBody += tHead;
				tBody += '<tbody>';
				var prizeTable = revealConfigurations[i].prizeTable;
				for(j=0; j< prizeTable.length; j++){
					var prizeLevel = j<6? (j+1) : loader.i18n.Game.InstantWin+(j-5);
					var description = covertToSymbolText(prizeTable[j].description);
					var symbol = convertToSymbolImage(prizeTable[j].description);
					var prizeValue = SKBeInstant.formatCurrency(prizeTable[j].prize).formattedAmount;
					tBody += '<tr><td>' + prizeLevel + '</td><td>'+description+'</td><td>' +symbol+ '</td><td><together>' + prizeValue + '</together></td></tr>';                
				}
				tBody += '</tbody></table>';            
			}       
		}
        
		paytableText = paytableText.replace('{paytableBody}',tBody);
        
        var paytableBox = document.getElementById('paytableArticle');
        paytableBox.innerHTML = paytableText;
        
        var howToPlayText = loader.i18n.helpHTML.replace(/\"/g,"'");
        
         if(SKBeInstant.isWLA()){
             howToPlayText = howToPlayText.replace('{payback}','').replace(/{REVEALALL}/g, loader.i18n.MenuCommand.WLA.button_autoPlay).replace(/{RevealAll}/g,loader.i18n.MenuCommand.WLA.button_autoPlay_title);
         }else{
            var minRTP = SKBeInstant.config.gameConfigurationDetails.minRTP;
            var maxRTP = SKBeInstant.config.gameConfigurationDetails.maxRTP;
            var paybackRTP = "";
			//RGS5.2 doesn't support RTP value, so hard-code RTP for game rules.
			if(!minRTP || !maxRTP){
                paybackRTP = loader.i18n.Paytable.hardCodeRTP;
			}else{
				if(minRTP === maxRTP){
					loader.i18n.Paytable.RTPvalue = loader.i18n.Paytable.RTPvalue.replace('{@minRTP}',minRTP);
					paybackRTP = loader.i18n.Paytable.RTPvalue;
				}else{
					loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@minRTP}',minRTP);
					loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@maxRTP}',maxRTP);
					paybackRTP = loader.i18n.Paytable.RTPrange;
				}	
			}
            loader.i18n.Paytable.paybackBody = loader.i18n.Paytable.paybackBody.replace('{RTP}',paybackRTP);
            var payback = '<h3>'+ loader.i18n.Paytable.paybackTitle +'</h3><p>'+loader.i18n.Paytable.paybackBody+'</p>';
            
            howToPlayText = howToPlayText.replace('{payback}',payback).replace(/{REVEALALL}/g,loader.i18n.MenuCommand.Commercial.button_autoPlay).replace(/{RevealAll}/g,loader.i18n.MenuCommand.Commercial.button_autoPlay_title);
         }
        
        
        var howToPlayBox = document.getElementById('gameRulesArticle');
        howToPlayBox.innerHTML = howToPlayText;
    }
	
	function covertToSymbolText(data){
		var resultString = '';
		switch(data){
			case 'A':
			case 'B':
			case 'C':
			case 'D':
			case 'E':
			case 'F':
				resultString = loader.i18n.Game['Description'+data];
				break;
			case 'IW1':
			case 'IW2':
			case 'IW3':
			case 'IW4':
			case 'IW5':
			case 'IW6':
				resultString = loader.i18n.Game['DescriptionIW'];
				break;
			default:
				resultString = '';
				break;
		}
		return resultString;
	}
	
	function convertToSymbolImage(data){
		var resultString = '';
		switch(data){
			case 'A':
			case 'B':
			case 'C':
			case 'D':
			case 'E':
			case 'F':
				resultString = '3 '+getImgTag(data)[0]+' '+loader.i18n.Game.or+' 3 '+getImgTag(data)[1];
				break;
			case 'IW1':
			case 'IW2':
			case 'IW3':
			case 'IW4':
			case 'IW5':
			case 'IW6':
				resultString = getImgTag("IW")[0]+' '+loader.i18n.Game.or+' '+getImgTag("IW")[1];
				break;
			default:
				resultString = '';
				break;
		}
		return resultString;
	}
	
	function getImgTag(symbolName){
		var resultTagStringArray = [],imgNameArray = [];
		switch(symbolName){
			case 'A':
				imgNameArray = ['fish_0009.png', 'beef_0009.png'];
				break;
			case 'B':
				imgNameArray = ['catToilet_0009.png', 'ball_0009.png'];
				break;
			case 'C':
				imgNameArray = ['catCan_0009.png', 'can_0009.png'];
				break;
			case 'D':
				imgNameArray = ['catFood_0009.png', 'food_0009.png'];
				break;
			case 'E':
				imgNameArray = ['catToy_0009.png', 'bone_0009.png'];
				break;
			case 'F':
				imgNameArray = ['wool_0009.png', 'uga_0009.png'];
				break;
			case 'IW':
				imgNameArray = ['mouse_0009.png', 'hotdog_0009.png'];
				break;
			default:
				break;
		}
		imgNameArray.forEach(function(item){
			resultTagStringArray.push(loader.getImgObj(item).outerHTML);
		});
		return resultTagStringArray;
	}
    
    function fillCloseBtn(){
        var buttons=document.getElementsByClassName('closeBtn');
        Array.prototype.forEach.call(buttons,function(item){
            item.innerHTML = loader.i18n.Game.buttonClose;
            item.onclick=function(){showOne('game');};
        });
    }
	
	function registerHelpList(){
        var titleList;
        var helpClickTitle = [];
        var gameRulesSection = document.getElementsByTagName("section")[0];
        var backToTop = document.getElementsByClassName("top");
		function gameRulsTitle(index){
			return function(){
				gameRulesSection.scrollTop = helpClickTitle[index].offsetTop - helpClickTitle[index].offsetHeight*4;
			};
		}
		function topBackUp(){
			return function(){
				gameRulesSection.scrollTop = 0;
			};
        }
        
        if(config.helpClickList.titleList){
            titleList = document.getElementById("titleList").getElementsByTagName("li");
        }else{
            titleList = document.getElementsByTagName("li");
        }
        if(config.helpClickList.titleContent){
            var content = config.helpClickList.titleContent;
            for(var key in content){
				var currentNode = document.getElementById(content[key]);
                helpClickTitle.push(currentNode);
            }
        }
        
        for (var i = 0; i < titleList.length; i++) {
			titleList[i].onclick = gameRulsTitle(i);
        }
        for (i = 0; i < backToTop.length; i++) {  
			backToTop[i].onclick = topBackUp();
        }
    }

    function showOne(id){
        var tabs=document.getElementsByClassName('tab');
        for(var i=0;i<tabs.length;i++){
            tabs[i].style.display='none';
        }
		if(config.audio && config.audio.ButtonGeneric){
			audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);                
		}
        document.getElementById(id).style.display='block';
    }

    //retrigger clickbtn
    function onGameControl(data){
        if(data.option==='paytable'||data.option==='howToPlay'){
            var id = data.option==='howToPlay'? 'gameRules' : 'paytable';
            if(document.getElementById(id).style.display==='block'){
                showOne('game');
            }else{
                showOne(id);
            }
        }
    }

    function onAbortNextStage(){
        disableConsole();
    }

    function onResetNextStage(){
        enableConsole();
    }
    
    function onEnterResultScreenState(){
        enableConsole();
    }

    msgBus.subscribe('disableUI', disableConsole);
    msgBus.subscribe('enableUI', enableConsole);
 	msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('onAbortNextStage', onAbortNextStage);
    msgBus.subscribe('onResetNextStage', onResetNextStage);
    msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onGameControl);
       
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	return {};
});

