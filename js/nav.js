mui.plusReady(function(){
	
	var mainView = plus.webview.getLaunchWebview();
	
	//tab bar切换
	mui(".foot-nav").on('tap', '.mui-tab-item', function(){
		var href = this.getAttribute("href");
		/*var wb = plus.webview.currentWebview();
		if(!href){
			return false;
		}
		if(href != 'index.html'){
			var vid = vk.transformPageUrl(href);
			plus.webview.show(plus.webview.getWebviewById(vid));
		}
		if(mainView != wb){
			mui.later(function(){
				plus.webview.hide(wb);
			}, 300);
		}*/
		if(!href) return false;
		var id = vk.transformPageUrl(href);
		if(id == 'index'){
			mui.each(plus.webview.all(), function(i, item){
				if(i != 0) item.hide();
			});
			return false;
		}
		var ws = plus.webview.getWebviewById(id);
		if(ws){
			ws.show('fade-in');
		}else{
			mui.openWindow({
				url: href,
				id: id,
				styles: {
					background: 'transparent'
				},
				createNew: false
			});
		}
	});
	
	//打开店铺帮助弹窗页
	document.getElementById("shopHelp").addEventListener("tap", function(){
		var wb = plus.webview.currentWebview();
		var url = 'shop/novice_help.html';
		if(mainView != wb) url = '../shop/novice_help.html';
		mui.openWindow({
			url: url,
			id: 'novice_help',
			styles: {
				background: 'transparent'
			},
			createNew:false,
			show: {
				autoShow: false
			},
			waiting: {
	  			autoShow: true
	  		}
		});
	})
	
})
