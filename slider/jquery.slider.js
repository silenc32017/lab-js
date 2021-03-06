/*
* jQuery Form Plugin:jquery.slider.js 
* 是一款支持移动端的响应式jQuery焦点图插件。该焦点图插件支持flexible布局，支持移动触摸事件，支持IE8+浏览器
*
* author:  damys
* version: 1.1
* url:     https://github.com/damys/lab-js/tree/master/slider
* Date:    2017/5/25

example:
    $('.slider').slider();

    <div class="slider">
        <div class="slider-item"></div>
        <div class="slider-item"></div>
        <div class="slider-item"></div>
        <div class="slider-item"></div>
    </div>
*/

;(function($){
    function Slider($container, options){
        this.$container = $container;
        this.options = $.extend({
            startSlide: 0,                     //开始索引 0开始
            item: '.slider-item',            //子元素选择器
            isFullScreen: false,               //是否全屏
            isFlexible: false,                 //是否自适应
            isSupportTouch: '__proto__' in {}, //是否支持触摸 html5 transform:
            isHover:true,                       // 是否hover 停止
            isShowPage: true,                  //是否显示分页按钮
            isShowTitle: false,                //是否显示标题栏
            titleAttr: 'data-title',           //标题文本存放的属性 或者回调函数(需要返回值)
            isShowControls: true,              //是否显示左右控制按钮
            isAuto: true,                      //是否自动播放
            intervalTime: 5000,                //自动播放间隔时间
            affectTime: 300,                   //特效时间 
            mode: 'move',                      //特效类型 string : fade || move
            direction: 'left',                 //方向 string: left || top
            onSwipeStart: $.noop,              //开始滑动回调
            onSwipeMove: $.noop,               //滑动中回调
            minSwipeLength: 30,                //正常滑动的最小值
            onSwipeCancel: $.noop,             //滑动取消回调 和 minSwipeLength值有关
            onSwipeEnd: $.noop,                //触摸结束回调 (正常触摸) 
            onSwipeLeft: $.noop,               //向左滑动回调
            onSwipeRight: $.noop,              //向右滑动回调
            onSwipeTop: $.noop,                //向上滑动回调
            onSwipeBottom: $.noop,             //向下滑动回调
            onInited:  $.noop,                 //初始化后回调
            onMoveBefore: $.noop,              //运动前回调
            onMoveAfter: $.noop,               //运动后回调
            onSelected: $.noop                 //分页选中回调
        }, options);
        this.init();
    }

    Slider.prototype = {
        init: function(){
            this.$item    = this.$container.find(this.options.item);
            this.size     = this.$item.size();
            this.curIndex = this.options.startSlide;
            this.setLayout();
            this.playTimer = null;
            this.options.isAuto && this.autoPlay();
            this.options.isFlexible && $(window).on('resize.slider', $.proxy(this, 'resize'));
            this.options.isSupportTouch && this.touch();
            this.onHover();
        },
        touch: function(){
            var self  = this;
            var touch = {};
            var opt   = this.options;
            var min   = opt.minSwipeLength;
            this.$container.on('touchstart', function(e){
                var touches = e.originalEvent.touches[0];
                touch.x1 = touches.pageX;
                touch.y1 = touches.pageY;
                opt.onSwipeStart.call(this, touch);
            }).on('touchmove', function(e){
                var touches = e.originalEvent.touches[0];
                touch.x2 = touches.pageX;
                touch.y2 = touches.pageY;
                opt.onSwipeMove.call(this, touch);
            }).on('touchend', function(e){
                if((touch.x2 && Math.abs(touch.x1 - touch.x2) > min) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > min)){
                    var dir = self.swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
                    opt['onSwipe'+dir].call(this, touch);
                    self.moveTo(dir);
                    opt.onSwipeEnd.call(this, touch);
                }else{
                    opt.onSwipeCancel.call(this, touch);
                }
                touch = {};
            });
        },
        moveTo: function(dir){
            var self      = this;
            var direction = self.options.direction;
            if(direction == 'top'){
                if(dir == 'Bottom'){
                    self[self.options.mode+'Prev']();
                }else if(dir == 'Top'){
                    self[self.options.mode]();
                }
            }else if(direction == 'left'){
                if(dir == 'Right'){
                    self[self.options.mode+'Prev']();
                }else if(dir == 'Left'){
                    self[self.options.mode]();
                }
            }
        },
        swipeDirection: function (x1, x2, y1, y2){
            var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
            return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Top' : 'Bottom')
        },
        move: function(){
            var self = this, cidx;
            self.options.isAuto && self.autoPlay();
            if(++self.curIndex == self.size){
                self.curIndex = 0;
                self.$container.css(self.getMove());
                self.curIndex++;
            }
            self.setTitle();
            self.setPages();
            cidx = self.curIndex == self.size - 1 ? 0 : self.curIndex;
            self.options.onMoveBefore.call(self.$container, self.$item, cidx);
            self.$container.stop(false, true).animate(self.getMove(), self.options.affectTime, function(){
                self.options.onMoveAfter.call(this, self.$item, cidx)
            });
        },
        movePrev: function(flag){
            var self = this; 
            if(flag != true){
                if(self.options.mode == 'move'){
                    if(self.curIndex == 0){
                        self.curIndex = (self.size - 1);
                        self.$container.css(self.getMove());
                    }
                }else{
                    (self.curIndex == 0) && (self.curIndex = self.size);
                }
                self.curIndex--;
            }
            
            self.options.isAuto && self.autoPlay();
            self.setTitle();
            self.setPages();
            self.options.onMoveBefore.call(self.$container, self.$item, self.curIndex);
            self.$container.stop(false, true).animate(self.getMove(), self.options.affectTime, function(){
                self.options.onMoveAfter.call(this, self.$item, self.curIndex)
            });
        },
        getMove: function(flag){
            var move = {};
            var size = this.getSize();
            var dir  = this.options.direction;
            if(dir == 'top'){
                move.top  = -this.curIndex*size.height;
                flag && (move.width = size.width);
            }else{
                move.left = -this.curIndex*size.width;
                flag && (move.height = size.height);
            }
            return move;
        },
        fade: function(){
            var self = this;
            self.options.isAuto && self.autoPlay();
            self.curIndex++;
            (self.curIndex > self.size - 1) && (self.curIndex = 0);
            self.setTitle();
            self.setPages();
            self.options.onMoveBefore.call(self.$container, self.$item, self.curIndex);
            self.$item.fadeOut(self.options.affectTime)
            .eq(self.curIndex).fadeIn(self.options.affectTime, function(){
                self.options.onMoveAfter.call(this, self.$item, self.curIndex)
            });
        },
        fadePrev: function(flag){
            var self = this;
            if(flag != true){
                if(self.options.mode == 'move'){
                    if(self.curIndex == 0){
                        self.curIndex = (self.size - 1);
                        self.$container.css(self.getMove());
                    }
                }else{
                    if(self.curIndex == 0){
                        self.curIndex = self.size;
                    }
                }
                self.curIndex--;
            }
            self.options.isAuto && self.autoPlay();
            self.setTitle();
            self.setPages();
            self.options.onMoveBefore.call(self.$container, self.$item, self.curIndex);
            self.$item.fadeOut(self.options.affectTime)
            .eq(self.curIndex).fadeIn(self.options.affectTime, function(){
                self.options.onMoveAfter.call(this, self.$item, self.curIndex)
            });
        },
        setPages: function(){
            if(!this.options.isShowPage || !this.$pages)return;
            var idx = this.curIndex;
            (idx == this.size - 1 && this.options.mode == 'move')  && (idx = 0);
            $('span', this.$pages).eq(idx).addClass('active').siblings().removeClass('active');
        },
        setTitle: function(){
            if(!this.options.isShowTitle || !this.$title)return;
            var $curItem = this.$item.eq(this.curIndex);
            this.$title.html($.isFunction(this.options.titleAttr) ? this.options.titleAttr.call($curItem, this.curIndex) : $curItem.attr(this.options.titleAttr) );
        },
        setLayout: function(){
            var opt = this.options;
            var css = this.getSetCss();
            this.$item.css(css.item)
            this.$container.css(css.container).wrap('<div class="slider-wrap"/>');
            this.$wrap = this.$container.parent();
            this.$wrap.css(css.wrap);
            if(this.options.isShowTitle){
                this.$title = $('<div class="slider-title"/>').insertAfter(this.$container);
                this.setTitle();
            }
            if(this.options.isShowPage){
                this.$pages = $('<div class="slider-pages">'+this.getPages()+'</div>').insertAfter(this.$container);
                this.pagesSwitch();
            }
            if(this.options.isShowControls){
                this.$prev = $('<div class="slider-btn slider-btn-prev"></div>');
                this.$next = $('<div class="slider-btn slider-btn-next"></div>');
                this.$container.after(this.$prev.add(this.$next));
                this.controlsSwitch();
            }
            if(this.options.mode == 'move'){
                this.$container.append(this.$item.eq(0).clone().addClass('item-clone'));
                this.$item = this.$container.find(this.options.item);
                this.size  = this.$item.size();
            }else{
                this.setFade();
            }
            this.options.onInited.call(this.$container, this.$item, this.options.startSlide);
        },
        resize: function(){
            var timer, self = this;
            clearTimeout(timer);
            timer = setTimeout(function(){
                self.$wrap.add(self.$item).css(self.getSize(self.options.direction));
                self.$container.css(self.getMove(true));
            }, 300);
        },
        setFade: function(){
            this.$item.hide().eq(this.curIndex).show();
        },
        getSetCss: function(){
            var size  = this.getSize(), css = {};
            var start = Math.min(this.options.startSlide, this.size);
            if(this.options.mode == 'fade'){
                size.position = 'absolute';
                css.height = size.height;
                css.width = size.width;
            }else{
                if(this.options.direction == 'top'){
                    css.height = (this.size+1)*100 + '%';
                    css.width = size.width;
                    css.top = -(start*size.height);
                }else{
                    css.height = size.height;
                    css.width = (this.size+1)*100 + '%';
                    css.left = -(start*size.width);
                    size.float = 'left';
                }
                css.position = 'relative';
            }
            return {
                item: size,
                container: css,
                wrap: {'overflow': 'hidden', 'position': 'relative', 'width': size.width, 'height': size.height}
            }
        },
        autoPlay: function(){
            var self = this;
            clearTimeout(self.playTimer);
            self.playTimer = setTimeout($.proxy(self, self.options.mode), self.options.intervalTime);
        },
        
        onHover: function(){
            var self = this;
            if(this.options.isHover){
                $(this.$wrap).hover(function(){
                    clearTimeout(self.playTimer);
                },function(){
                    self.options.isAuto && self.autoPlay();
                })
            }
        },
        
        controlsSwitch: function(){
            var self = this;
            this.$next.on('click', $.proxy(self, self.options.mode));
            this.$prev.on('click', $.proxy(self, self.options.mode+'Prev'));
        },
        pagesSwitch: function(){
            if(!this.options.isShowPage || !this.$pages)return;
            var self = this;
            $('span', this.$pages).on('click', function(){
                self.curIndex = $(this).index();
                self.options.onSelected.call(this, self.curIndex);
                self[self.options.mode+'Prev'](true);
            })
        },
        getPages: function(){
            var arr      = [];
            var curIndex = this.curIndex;
            $(this.$item).each(function(idx){
                var cls = idx == curIndex ? 'class="active"' : '';
                arr.push('<span '+cls+'>'+(idx+1)+'</span>');
            });
            return arr.join('');
        },
        getSize: function(){
            var $elem = this.$item.eq(0), size;
            if(this.options.isFullScreen){
                size = {width: $(window).width(), height: $(window).height()}
            }else{
                if(this.options.isFlexible){
                    var $elem = this.$wrap ? this.$wrap.parent() : this.$container.parent();
                    size = this.options.direction == 'top' ? {height: $elem.height()} : {width: $elem.width()}
                }
            }
            return size || {width: $elem.width(), height: $elem.height()}
        }
    }

    $.fn.slider = function(options){
        this.each(function(){
            $(this).data('.slider', new Slider($(this), options));
        });
                
        return this;
    }
}(window.jQuery))
