/*
 * 全局通用文件，每个页面必须引入
 */

//设置页面字体
function setRootFontSize(){
	var width = document.documentElement.clientWidth;
	if(width > 750) width = 750;
	var fontSize = width / 7.5;
	document.getElementsByTagName("html")[0].style['font-size'] = fontSize + 'px';
}

setRootFontSize();

window.addEventListener('resize', function(){
	setRootFontSize();
}, false);

//显示当前窗口
function showCurrentWebview(animate, wait) {
	//显示当前页面
	plus.webview.currentWebview().show(animate);
	//关闭等待框
	plus.nativeUI.closeWaiting();
}

//跳转至指定页面
function turnAppointPage(id){
	var ids = ['goods-classiyf', 'order-cart', 'member-index']
	var all = plus.webview.all();
	for(var i = 1; i < all.length; i++){
		var flog = false;
		all[i].hide();
		for(var k = 0; k < ids.length; k++){
			if(all[i].id == ids[k]) flog = true;
		}
		if(!flog){
			all[i].close();
		}
	}
	if(id == 'index'){
		plus.webview.getLaunchWebview().show();
	}else{
		plus.webview.getWebviewById(id).show();
	}
}

//通知指定页面刷新
function reloadAppointPage(id){
	var wv = plus.webview.getWebviewById(id);
	if(wv){
		wv.reload();
	}else{
		console.log('窗口未找到!窗口未创建或请检查窗口ID:'+ id +'是否输入有误！')
	}
}
