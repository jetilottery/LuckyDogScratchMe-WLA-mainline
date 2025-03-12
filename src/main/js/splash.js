define([
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/componentCRDC/splash/splashLoadController'
], function(resLib, splashLoadController) {

	var loadDiv, progressBarDiv, progressDiv, logoDiv, photoDiv, copyRightDiv;
	var scaleRate = 1;
	var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
    var showCopyRight = false;
	var percentLoadedStr = null;
    if(softId){
        if(softId[1].split('-')[2].charAt(0) !== '0'){
            showCopyRight = true;
        }   
    }
	var predefinedDataLandScape = {
		loadDiv:{
			width:960,
			height:600,
			landscapeMargin:0
		},
		progressBarDiv:{
			width:562,
			height:54,
			padding:0,
			top:437
		},
		logoDiv:{
			width:588,
			height:126,
			top:57
		},
		photoDiv: {
			width: 560,
			height: 328,
			top: 142
		},
		copyRightDiv:{
			height:30,
			lineHeight:30,
			bottom:20,
			fontSize:20
		}
	};

	var predefinedDataPortrait = {
		loadDiv:{
			width:600,
			height:960,
			landscapeMargin:0
		},
		progressBarDiv:{
			width:562,
			height:54,
			padding:0,
			top:677
		},
		logoDiv:{
			width:588,
			height:126,
			top:224
		},
		photoDiv: {
			width: 560,
			height: 328,
			top: 380
		},
		copyRightDiv:{
			height:30,
			lineHeight:30,
			bottom:20,
			fontSize:20
		}
	};

	var predefinedData = predefinedDataLandScape,screenMode = 'landscape', winW, winH;
	
	function scale(defaultValue){
		return Math.round(defaultValue*scaleRate)+'px';
	}
	
	function initDom(){
        loadDiv = document.getElementById("loadDiv");
        progressBarDiv = document.getElementById("progressBarDiv");
        progressDiv = document.getElementById("progressDiv");
		logoDiv = document.getElementById("logoDiv");
		photoDiv = document.getElementById("photoDiv");
		copyRightDiv = document.getElementById("copyRightDiv");
		if(showCopyRight){
			copyRightDiv.innerHTML = resLib.i18n.splash.splashScreen.footer.shortVersion;
		}
	}
	
	function updateWinSize(){
		winW = Math.floor(Number(window.innerWidth));
		winH = Math.floor(Number(window.innerHeight));
		document.documentElement.style.width = winW + 'px';
		document.documentElement.style.height = winH + 'px';
		document.body.style.width = winW + 'px';
		document.body.style.height = winH + 'px';
	}
	
	function getInitialScreenMode(){
		if (winW >= winH){
			predefinedData = predefinedDataLandScape;
			screenMode = 'landscape';
		}else {
			predefinedData = predefinedDataPortrait;
			screenMode = 'portrait';
		}
	}
	
	function initBGImages(){
		document.body.style.backgroundSize = 'cover';
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundImage = 'url(' + resLib.splash[screenMode+'Loading'].src + ')';
        progressBarDiv.style.backgroundImage = 'url(' + resLib.splash.loadingBarBack.src + ')';
        progressDiv.style.backgroundImage = 'url(' + resLib.splash.loadingBarFront.src + ')';
        logoDiv.style.backgroundImage = 'url(' + resLib.splash.logo.src + ')';
		photoDiv.style.backgroundImage = 'url(' + resLib.splash.photo.src + ')';
	}
	
	function initDomStyles(){
		renderStyle(loadDiv,predefinedData.loadDiv);
		renderStyle(progressDiv,predefinedData.progressDiv);
		renderStyle(progressBarDiv,predefinedData.progressBarDiv);
		renderStyle(logoDiv,predefinedData.logoDiv);
		renderStyle(photoDiv,predefinedData.photoDiv);
	}
	
	function renderStyle(el,styleObj){
		for(var prop in styleObj){
			if(typeof styleObj[prop] === 'number'){
				el.style[prop] = scale(styleObj[prop]);
			}else{
				el.style[prop] = styleObj[prop];
			}
		}
	}

	function onWindowResized(){
		updateWinSize();
		var defaultW = predefinedData.loadDiv.width+(winW>winH?(2*predefinedData.loadDiv.landscapeMargin):0);//winW > winH?1920:1040;
		var defaultH = predefinedData.loadDiv.height;//winW > winH?1080:760;
		var whRate = defaultW/defaultH;//'landscape' : 'portrait'
		var loadDivWidth, loadDivHeight, loadDivLeft, loadDivTop;
		if(winW/winH>whRate){
			loadDivWidth = Math.floor(winH*whRate);
			loadDivHeight = winH;
			loadDivLeft = Math.floor((winW-loadDivWidth)/2);
			loadDivTop = 0;
		}else{
			loadDivWidth = winW;
			loadDivHeight = Math.floor(winW/whRate);
			loadDivLeft = 0;
			loadDivTop = Math.floor((winH-loadDivHeight)/2);
		}
		loadDiv.style.width = loadDivWidth+'px';
		loadDiv.style.height = loadDivHeight+'px';
		loadDiv.style.left = loadDivLeft+'px';
		loadDiv.style.top = loadDivTop+'px';
		scaleRate = loadDivWidth/defaultW;
		loadDiv.style.margin = '0 '+scale(winW>winH?predefinedData.loadDiv.landscapeMargin:0);
		
		progressBarDiv.style.top = scale(predefinedData.progressBarDiv.top);
		progressBarDiv.style.left = scale((predefinedData.loadDiv.width-predefinedData.progressBarDiv.width)/2);
		progressBarDiv.style.width = scale(predefinedData.progressBarDiv.width);
		progressBarDiv.style.height = scale(predefinedData.progressBarDiv.height);
		
		progressDiv.style.width = (percentLoadedStr === null)? 0 : percentLoadedStr+'%';
        progressDiv.style.height = scale(predefinedData.progressBarDiv.height);
        progressDiv.style.left = 0;
		
        logoDiv.style.width = scale(predefinedData.logoDiv.width);
        logoDiv.style.height = scale(predefinedData.logoDiv.height);
        logoDiv.style.top = scale(predefinedData.logoDiv.top);
        logoDiv.style.left = scale((predefinedData.loadDiv.width-predefinedData.logoDiv.width)/2);
		
		photoDiv.style.width = scale(predefinedData.photoDiv.width);
        photoDiv.style.height = scale(predefinedData.photoDiv.height);
        photoDiv.style.top = scale(predefinedData.photoDiv.top);
		photoDiv.style.left = scale((predefinedData.loadDiv.width-predefinedData.photoDiv.width)/2);

		copyRightDiv.style.height = scale(predefinedData.copyRightDiv.height);
		copyRightDiv.style.lineHeight = scale(predefinedData.copyRightDiv.lineHeight);
		copyRightDiv.style.bottom = scale(predefinedData.copyRightDiv.bottom);
		copyRightDiv.style.fontSize = scale(predefinedData.copyRightDiv.fontSize);
	}
	
	function onMessage(e){
		percentLoadedStr = e.data.loaded || null;
		if (percentLoadedStr !== null) {
			progressDiv.style.width = percentLoadedStr + '%';
		}
	}

    function onLoadDone() {
		initDom();
		updateWinSize();
		getInitialScreenMode();
		initBGImages();
		initDomStyles();
		onWindowResized();
		window.addEventListener('resize', onWindowResized);
		window.addEventListener('message', onMessage, false);
        window.postMessage('splashLoaded', window.location.origin);
    }

	splashLoadController.load(onLoadDone);

    return {};
});