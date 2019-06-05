var detailSwitch = {
	init: function(elem){
		//若没有找到指定对象直接终止程序并报错
		if(!elem) throw Error("请指定一个操作对象！");
		//容器
		this.elem = document.getElementById(elem);
		//切屏的两个容器
		this.childs = this.elem.querySelectorAll('.hd-scroller');
		//touch滑动距离，touch结束后应重置为0
		this.startY = 0;
		//是否切屏的状态
	    this.switchView = false;
	    //文字提示元素
		this.tips = document.getElementById("pullText");
		//底部导航高度
		this.footerHeight = document.querySelector('.foot-nav').clientHeight;
		//提示文案
		this.tipsText = ["继续拖动，查看详情", "释放上拉，查看详情", "继续下拉，返回商品简介", "释放下拉，返回商品简介", "正在切换到下一屏"];
		
		//顶部导航（项目所需）
		var _nav = document.querySelector(".goods-detail-nav");
		//顶部导航+图文详情选项切换高度
		var width = document.documentElement.clientWidth;
		if(width > 750) width = 750;
		var fontSize = width / 7.5;
		var topHeight = fontSize * 0.88 * 2;
		
		//设置容器最小高度
		this.childs[0].style.minHeight = window.innerHeight - this.footerHeight - 40 + 'px';
		this.childs[1].style.minHeight = window.innerHeight - topHeight + 'px';
		//设置容器高度
		this.resetHeight(this.childs[0].clientHeight + 40);
		
		var that = this;

		//切屏动画中禁止触屏滑动
		document.addEventListener("touchmove", function(e){
			if(that.pull == true){
	            e.preventDefault();
	        }else{
	            return;
	        }
		}, false);
		
		//切屏动画中禁止鼠标滑轮滚动
		document.addEventListener("mousewheel", function(e){
			if(that.pull == true){
				e.preventDefault();
	            return false;
	        }
		}, false);
		
		//获取触屏其实坐标
		function _start(e){
			that.startY = e.touches[0].pageY;
		}
		
		//触屏移动
		function _move(e){
			if(that.pull == true){ //切屏时阻止touchmove事件
				e.preventDefault();
				return false;
			}
			var slideY = e.touches[0].pageY - that.startY;
			//当第一屏时，scrollTop到最底部后，继续上拉触发上拉滑动效果
			//在第二屏时，scrollTop到达最顶部，继续下拉触发下拉滑动效果
			if(!that.switchView){
				//项目新增效果
				if(document.body.scrollTop > 10){
					_nav.classList.add("follow");
				}else{
					_nav.classList.remove("follow");
				}
				
				var distance = that.childs[0].clientHeight + 40 -  window.innerHeight + that.footerHeight;
				var disparity = Math.abs(document.body.scrollTop - distance);//解决因rem导致的1px的差距
				if(disparity < 2 && slideY < 0){
					e.preventDefault();//scrollTop到最底部后，继续上拉则禁止滚动事件
					that.slideY = slideY / 4;
					that.slideTo(that.slideY, 0);
					that.tips.innerText = that.tipsText[Math.abs(that.slideY) > 40 ? 1 : 0];
				}
			}else{
				if(document.body.scrollTop == 0 && slideY > 0){
					e.preventDefault();//scrollTop到最顶部，继续下拉则禁止滚动事件
					that.slideY = slideY / 4;
					that.slideTo(-that.childs[0].clientHeight - 40 + that.slideY + topHeight, 0);
					that.tips.innerText = that.tipsText[Math.abs(that.slideY) > 40 ? 3 : 2];
				}
			}
		}
		
		function _end(e){
			//切屏时阻止touchmove事件
			if(that.pull == true){
				e.preventDefault();
				return false;
			}
			
			//当滑动距离不满足条件是不进行切换
			if(!that.slideY || Math.abs(that.slideY) < 40){
				if(!that.switchView){
					that.slideTo(0, 200);
				}else{
					that.slideTo(-that.childs[0].clientHeight - 40 + topHeight, 200);
				}
				that.slideY = 0;
				return false;
			}
			that.slideY = 0;
			
			that.tips.innerText = that.tipsText[4];
			
			if(!that.switchView){
				//设置pull为true阻止切屏时触发滑动
				that.pull = true;
				//显示第二屏
				that.childs[1].classList.remove("mui-hidden");
				//重置高度
				that.resetHeight(that.childs[1].clientHeight);
				//滚动到第二屏，减去document.body.scrollTop是为了防止document.body.scrollTop先设为0时会跳到顶部在切到第二屏
				that.slideTo(-that.childs[0].clientHeight - 40 + document.body.scrollTop + topHeight, 300);
				//图文详情导航条显示
				that.setBarAnimate(1);
				setTimeout(function(){ 
					that.tips.innerText = that.tipsText[2];
					//设置document.body.scrollTop为0
					document.body.scrollTop = 0;
					//重新设置正确的slideY
					that.slideTo(-that.childs[0].clientHeight - 40 + topHeight, 0);
					//设置pull为true阻止切屏时触发滑动
					that.pull = false;
					//设置切屏状态
					that.switchView = true;
					
					//项目新增效果
					_nav.setAttribute("data-status", true);
					//项目新增效果，显示图文详情标题
					document.querySelector(".mui-title").classList.add("wipe-up");
				}, 400)
			}else{
				//设置pull为true阻止切屏时触发滑动
				that.pull = true;
				//滚动到第一屏底部，第一屏容器高度 - pulltext高度 + 屏幕高度 - 底部导航高度
				that.slideTo(-that.childs[0].clientHeight - 40 + window.innerHeight - that.footerHeight, 300);
				that.setBarAnimate(0);
				setTimeout(function(){
					that.tips.innerText = that.tipsText[0];
					//设置document.body.scrollTop滚动到第一屏底部
					document.body.scrollTop = that.childs[0].clientHeight - 40;
					that.slideTo(0, 0);
					//重置高度
					that.resetHeight(that.childs[0].clientHeight + 40);
					//隐藏第二屏
					that.childs[1].classList.add("mui-hidden");
					//设置pull为true阻止切屏时触发滑动
					that.pull = false;
					//设置切屏状态
					that.switchView = false;
					
					//项目新增效果
					_nav.removeAttribute("data-status");
					//项目新增效果，隐藏图文详情标题
					document.querySelector(".mui-title").classList.remove("wipe-up");
				}, 300)
			}
		}
		
		this.elem.addEventListener("touchstart", _start, false);
		this.elem.addEventListener("touchmove", _move, false);
		this.elem.addEventListener("touchend", _end, false);
	},
	slideTo: function(y, t){
		this.elem.style.transform = "translate3d(0, " + y + "px, 0)";
		this.elem.style.webkitTransform = 'translateZ(0) translateY(' + y + 'px)';
		this.elem.style.transitionTimingFunction = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
		this.elem.style.transitionDuration = t + "ms";
	},
	setBarAnimate: function(n, t){
		if(n > 1 && n < 0) return false;
		var o = document.getElementById("detail-nav");
		if(n == 1) o.style.display = "block";
		if(n == 0){
			setTimeout(function(){
				o.style.display = "none";
			}, 500)
		}
		o.style.opacity = n;
		o.style.transitionTimingFunction = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
		o.style.transitionDuration = "300ms";
	},
	resetHeight: function(h){
		if(h < window.innerHeight) h = window.innerHeight - this.footerHeight - 40;
		this.elem.style.height = h + "px";
		this.elem.style.transitionDuration = "0ms";
	}
}