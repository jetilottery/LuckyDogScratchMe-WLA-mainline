/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
    style: {
        "ticketCostLevelIcon": {
            "_width": "22",
            "_height": "4",
            "_top": "82"
        }
    },
    textAutoFit: {
        "autoPlayText": {
            "isAutoFit": true
        },
        "autoPlayMTMText": {
            "isAutoFit": true
        },
        "buyText": {
            "isAutoFit": true
        },
        "tryText": {
            "isAutoFit": true
        },
        "warningExitText": {
            "isAutoFit": true
        },
        "warningContinueText": {
            "isAutoFit": true
        },
        "warningText": {
            "isAutoFit": true
        },
        "errorExitText": {
            "isAutoFit": true
        },
        "errorTitle": {
            "isAutoFit": true
        },
        "errorText": {
            "isAutoFit": false
        },
        "exitText": {
            "isAutoFit": true
        },
        "playAgainText": {
            "isAutoFit": true
        },
        "playAgainMTMText": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        },
        "win_Text": {
            "isAutoFit": true
        },
        "win_Try_Text": {
            "isAutoFit": true
        },
        "win_Value": {
            "isAutoFit": true
        },
        "closeWinText": {
            "isAutoFit": true
        },
        "nonWin_Text": {
            "isAutoFit": true
        },
        "closeNonWinText": {
            "isAutoFit": true
        },
        "win_Value_color": {
            "isAutoFit": true
        },
        "ticketCostText": {
            "isAutoFit": true
        },
        "ticketCostValue": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        },
        "winBoxErrorText":{
            "isAutoFit": true
        },
        "winBoxErrorExitText":{
            "isAutoFit": true
        }
    },
    audio: {
        "gameLoop": {
            "name": "BaseMusicLoop",
            "channel": "0"
        },
        "gameWinCat": {
            "name": "BaseMusicLoopTermWin1",
            "channel": "0"
        },
        "gameWinDog": {
            "name": "BaseMusicLoopTermWin2",
            "channel": "0"
        },
        "gameNoWin": {
            "name": "BaseMusicLoopTermLose",
            "channel": "0"
        },
        "ButtonGeneric": {
            "name": "ButtonGeneric",
            "channel": "2"
        },
        "HelpPageOpen": {
            "name": "HelpPageOpen",
            "channel": "1"
        },
        "HelpPageClose": {
            "name": "HelpPageClose",
            "channel": "2"
        },
        "ButtonBetMax": {
            "name": "ButtonBetMax",
            "channel": "3"
        },
		"Reveal1": {
            "name": "Reveal1",
            "channel": "1"
        }
    },
    gladButtonImgName: {
        //audioController
        "buttonAudioOn": "buttonAudioOn",
        "buttonAudioOff": "buttonAudioOff",
        //buyAndTryController
        "buttonTry": "buttonCommon",
        "buttonBuy": "buttonCommon",
        //errorWarningController
        "warningContinueButton": "buttonCommon",
        "warningExitButton": "buttonCommon",
        "errorExitButton": "buttonCommon",
        //exitAndHomeController
        "buttonExit": "buttonCommon",
        "buttonHome": "buttonHome",
        //playAgainController
        "buttonPlayAgain": "buttonCommon",
        "buttonPlayAgainMTM": "buttonCommon",
        //playWithMoneyController
        "buttonMTM": "buttonCommon",
        //ticketCostController
        "ticketCostPlus": "ticketCostPlus",
        "ticketCostMinus": "ticketCostMinus"
    },
	gameParam: {
		popUpDialog: true
	},
	predefinedStyle:{
		landscape:{
			loadDiv:{
				width:960,
				height:600,
				left: "50%",
				top: "50%",
				position:"absolute",
				backgroundSize:"cover"
			},
			progressDiv:{
				width:0,
				height:54,
				left:0,
				position:"absolute",
				backgroundRepeat:"no-repeat",
				backgroundSize:'cover'
			},
			progressBarDiv:{
				width:562,
				height:54,
				top:437,
				left:199,
				position:"absolute",
				backgroundRepeat:"no-repeat",
				backgroundSize:'cover'
			},
			gameLogoDiv:{
				width:588,
				height:126,
				top:57,
				left: 186,
				position:"absolute",
				backgroundSize:"contain",
				backgroundRepeat:"no-repeat"
			},
			photoDiv:{
				width: 560,
				height: 328,
				top: 142,
				left: 200,
				position:"absolute",
				backgroundSize:"contain",
				backgroundRepeat:"no-repeat"
			}
		},
		portrait: {
			loadDiv:{
				width:600,
				height:960,
				left: "50%",
				top: "50%",
				position:"absolute",
				backgroundSize:"cover"
			},
			progressDiv:{
				width:0,
				height:54,
				left:0,
				position:"absolute",
				backgroundRepeat:"no-repeat",
				backgroundSize:'cover'
			},
			progressBarDiv:{
				width:562,
				height:54,
				top:677,
				left:19,
				position:"absolute",
				backgroundRepeat:"no-repeat",
				backgroundSize:'cover'
			},
			gameLogoDiv:{
				width:588,
				height:126,
				top:224,
				left:6,
				position:"absolute",
				backgroundSize:"contain",
				backgroundRepeat:"no-repeat"
			},
			photoDiv:{
				width: 560,
				height: 328,
				top: 380,
				left: 20,
				position:"absolute",
				backgroundSize:"contain",
				backgroundRepeat:"no-repeat"
			}
		}
	}
});