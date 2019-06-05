/*
 * 基于H5+、mui开发的app，部分功能依赖H5+和mui.js
 * 涉及到H5+的部分功能在浏览器上无法直接使用，因此请使用手机连接HBuilder调试
 */
var app = (function(document, mui, undefined){
	
	var $ = function(selector, context) {
		return mui(selector, context);
	};
	
	$.uploadStorage = function(path, url, flog){
		path = path.split(".");
		var $file = config;
		for (var key in path) {
			$file = $file[path[key]];
		}
		$file.name = '123'
		console.log(config)
		console.log($file)
	}
	
	/*$.getStorage = function(params, url, flag, callback){
		var data = plus.storage.getItem("");
		if(data){
			
		}
	}*/
	
	//ajax
	$.ajax = function(params){
		var data = {
			timestamp: Date.parse(new Date()),
			//appid: module_config.appid,
			format: 'json'
		}
		var async = (params.async != undefined ? params.async : true);
		mui.extend(data, params.data);
		mui.ajax(module_config.path, {
			data: data,
			async: async,				//false异步，true同步
			dataType: 'json',			//服务器返回json格式数据
			type: params.type || 'get',	//HTTP请求类型，默认get
			timeout: 10000,				//超时时间设置为10秒；              
			success: function(data){
				if(params.success) params.success(data);
			},
			error: function(xhr, type, errorThrown){
				if(params.error){
					params.error(xhr, type, errorThrown);
				}else{
					//异常处理；
					if(type == 'timeout') console.log("请求超时！");
					if(type == 'error') console.log("请求失败！");
					if(type == 'abort') console.log("请求中止！");
					if(type == 'parsererror') console.log("解析失败！");
				}
			}
		});
	}
	
	//网络诊断
	$.networkCondition = function(){
		//API地址http://www.html5plus.org/doc/zh_cn/device.html#plus.networkinfo
		var condition = [];
		condition[plus.networkinfo.CONNECTION_UNKNOW] = "未知网络"; 
		condition[plus.networkinfo.CONNECTION_NONE] = "无网络"; 
		condition[plus.networkinfo.CONNECTION_ETHERNET] = "以太网连接"; 
		condition[plus.networkinfo.CONNECTION_WIFI] = "WiFi连接"; 
		condition[plus.networkinfo.CONNECTION_CELL2G] = "移动2G网络"; 
		condition[plus.networkinfo.CONNECTION_CELL3G] = "移动3G网络"; 
		condition[plus.networkinfo.CONNECTION_CELL4G] = "移动4G网络";
		return condition[plus.networkinfo.getCurrentType()];
	}
	
	//图片压缩、裁剪、缩放、旋转
	$.compressImage = function(opts){
		/*opts = {
			photoUpload: false,//是否拍照上传，默认false从相册添加文件上传
			handle: {
				width: '200px', // 图片缩放，支持‘100px’或百分比‘50%’，默认auto
				clip: { top: "25%", left: "25%", width: "50%", height: "50%" },//裁剪图片，此示例是裁剪中心区域
				rotate: 90, //旋转角度，默认0
				quality: 20, //图片质量压缩，默认50
				format: 'png' //格式转换，支持"jpg"、"png"
			},
			callback: function(ret){}
		}*/
		
		if(opts.photoUpload){
			//拍照添加文件
			plus.camera.getCamera().captureImage(function(path){
				imagesHandle(path);
			});	
		}else{
			//从相册添加文件
			plus.gallery.pick(function(path){
			    imagesHandle(path);
			});
		}
		
		function imagesHandle(path){
			var name = path.split("/");
			name = name[name.length - 1];
			var handle = {};
			mui.extend(handle, opts.handle);
			handle.src = path;
			handle.dst = name;
			handle.overwrite = true;
			plus.zip.compressImage(handle, function(result){
				if(typeof opts.callback == 'function'){
					opts.callback(result);
				}
			}, function(){
				console.log("图片压缩失败！");
			});
		}
	}
	
	$.imageUpload = function(file, callback){
		plus.nativeUI.showWaiting('图片上传中...');
		var task = plus.uploader.createUpload(module_config.path, {
			method: "POST",
			blocksize: 204800,
			priority: 100
		},
		function(t, status){
			// 上传完成
			if(status == 200){
				if(typeof callback == 'function'){
					callback(t);
				}
			}else{
				mui.toast("上传失败~");
			}
			plus.nativeUI.closeWaiting();
		});
		task.addFile(file, {key: 'newfile'});
		task.addData("method", "api.module.attachment.attachment.upload");
		task.addData("token", plus.storage.getItem("token"));
		task.addData("format", "json");
		task.addData("timestamp", JSON.stringify(Date.parse(new Date())));
		task.addData("file", 'newfile');
		task.start();
	}
	
	/*
	 * 校验图片缓存，已缓存直接返回图片本地路径，未缓存先下载再返回
	 * 
	 * 依赖vk.js的MD5功能
	 */
	$.checkImageCache = function(url, callback){
		
		var filename = vk.md5(url);
		var format = url.match(/.png|.jpg|.gif|.jpeg/g);
		if(!format) return false;
		filename += format.toString();
		
		var dtask = plus.downloader.createDownload(url, {
			filename: 'image/'+ filename
		}, function ( d, status ) {
			// 下载完成
			if ( status == 200 ) { 
				//console.log(JSON.stringify(d))
				if(typeof callback == 'function') callback(d);
			} else {
				console.log( "Download failed: " + status ); 
			}  
		});
		//dtask.addEventListener( "statechanged", onStateChanged, false );
		dtask.start();
	}
	
	//通过URL参数获取目录对象或文件对象
	$.getLocalFileSystemURL = function(url){
		var fullPath = '';
		var self = this;
		plus.io.resolveLocalFileSystemURL(url, function(entry){
			entry.file(function(file){
				fullPath = file.fullPath;
				self.fullPath = file.fullPath;
			})
		}, function(){
			console.log("获取文件路径失败~");
		});
		//this.call(fullPath);
	}
	
	//打开新窗口
	$.openWindow = function(opts){
		var options = {
			url: '',
			id: '',
			styles: {},
			extras: {},
			createNew: false,
			show: {
				autoShow: false
			},
			waiting: {
	  			autoShow: true
	  		}
		}
		mui.extend(options, opts);
		if(!options.url){
			console.log("请指定打开窗口的路径！");
			return false;
		}
		if(!options.id){
			console.log("请指定窗口的ID！");
			return false;
		}
		mui.openWindow(options);
	}
	
	//校验登录状态
	$.checkLogin = function(){
		var token = plus.storage.getItem("token");
		if(!token){
			mui.toast("请您先登录~");
			return false;
		}
		return true;
	}
	
	return $;
	
})(document, mui);

mui.ready(function(){
	
	mui(document).on('tap', "[data-href]", function(){
		var url = this.getAttribute('data-href');
		var id = this.getAttribute('data-vid') || vk.transformPageUrl(url);//窗口id
		var top = this.getAttribute('data-top') || 0;
		var bottom = this.getAttribute('data-bottom') || 0;
		var value = this.getAttribute('data-value') || undefined;//多个值用分隔符分开，自己在打开的页面里用split分割
		if(id == 'index' || id == 'goods-classify' || id == 'order-cart' || id == 'member-index'){
			var wv = plus.webview.getWebviewById(id);
			if(!wv){
				app.openWindow({
					url: url,
					id: id,
					styles: {
						background: 'transparent'
					}
				})
			}else{
				turnAppointPage(id);
			}
			return false;
		}
		app.openWindow({
			url: url,
			id: id,
			styles: {
				top: top,
				bottom: bottom
			},
			extras:{
		    	value: value
		   	}
		})
	})
	
})