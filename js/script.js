var Modules = (function(self){
    // Check if width sutisfiable for mobile device
    self.isMobail = function(winwidth) {
        if(!winwidth) winwidth = 768;
        var check = true;
        if($(window).width() > winwidth) check = false;

        return check;
    };

    return self; 
}(Modules || {}));

Modules.PubSub = (function(self, $){
    var _events = {};

    self.subscribe = function(eventName, fn){
        _events[eventName] = _events[eventName] || [];
        _events[eventName].push(fn);

        return self;
    }

    self.unsubscribe = function(eventName, fn) {
        if (_events[eventName]) {
            for (var i = 0; i < _events[eventName].length; i++) {
                if (_events[eventName][i] === fn) {
                    _events[eventName].splice(i, 1);
                    break;
                }
            }
        }

        return self;
    }

    self.publish = function(eventName, data){
        if (_events[eventName]) {
            _events[eventName].forEach(function(fn) {
                fn(data);
            });
        }

        return self;
    }

    return {
        subscribe: function(eventName, fn){
            return self.subscribe(eventName, fn);
        },
        unsubscribe: function(eventName, fn){
            return self.unsubscribe(eventName, fn);
        },
        publish: function(eventName, data){
            return self.publish(eventName, data);
        }
    }
}(Modules.PubSub || {}, jQuery));

// Vertical swipe slider
Modules.VertSlider = (function(self, $){

    var _settings = {
        pagesItemClass: '',
        scrollButtonItemClass: '',
        scrollLogoItemClass: '',
        swipePagesItemClass: '',
        swipeSlidesItemClass: '',
        swipeActiveItemClass: '',
        swipeUpItemClass: '',
        swipeDownItemClass: ''
    },
    _data = {
        $bodyItem: '',
        $scrollButtonItem: '',
        $scrollLogoItem: '',
        $pagesItem: ''
    },
    _mobile = false,
    _listening = true,
    _checkDelta = false,
    _active = 0;
        
    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$bodyItem = $( 'body' );
        _data.$scrollButtonItem = $( _settings.scrollButtonItemClass );
        _data.$scrollLogoItem = $( _settings.scrollLogoItemClass );
        _data.$pagesItem = $( _settings.pagesItemClass );
        _mobile = Modules.isMobail('1023');
        if(!_mobile) self._checkActive()._onSwipe();

        self._onResize()._onScrollButtonClick()._onScrollLogoClick();

        Modules.PubSub.subscribe('personClick', self.down);
        Modules.PubSub.subscribe('navClick', self.down);

        return self;
    }

    // Move up
    self._goUp = function(){
        if(_active > 0){
            _data.$pagesItem.removeClass(_settings.swipeUpItemClass).removeClass(_settings.swipeDownItemClass);
            _data.$pagesItem.eq(_active).addClass(_settings.swipeDownItemClass).removeClass(_settings.swipeActiveItemClass);
            _active--;
            _data.$pagesItem.eq(_active).addClass(_settings.swipeActiveItemClass);
        }

        return self;
    }

    // Move down
    self._goDown = function(){
        if(_active < _data.$pagesItem.length - 1){
            _data.$pagesItem.removeClass(_settings.swipeUpItemClass).removeClass(_settings.swipeDownItemClass);
            _data.$pagesItem.eq(_active).addClass(_settings.swipeUpItemClass).removeClass(_settings.swipeActiveItemClass);
            _active++;
            _data.$pagesItem.eq(_active).addClass(_settings.swipeActiveItemClass);
        }

        return self;
    }

    // Move down on scroll button click
    self._onScrollButtonClick = function(){
        $(document).on('click', _settings.scrollButtonItemClass, function(){
            ga('send', 'event', 'screen-1', 'click-down', (Modules.OwlHorSlider.getActive() + 1).toString());
            self.down();

            return false;
        });

        return self;
    }

    // Move up on logo click
    self._onScrollLogoClick = function(){
        $(document).on('click', _settings.scrollLogoItemClass, function(){

            _mobile = Modules.isMobail('1023');
            if(!_mobile) self._goUp();
            else $('body,html').animate({ scrollTop: _data.$pagesItem.eq(0).offset().top }, 500);

            return false;
        });

        return self;
    }

    self.down = function(){
        _mobile = Modules.isMobail('1023');
        if(!_mobile) self._goDown();
        else $('body,html').animate({ scrollTop: _data.$pagesItem.eq(_data.$pagesItem.length - 1).offset().top }, 500);
    }

    // Swipe pseudo listener
    self._checkSwipe = function(event){
      if(_listening == true){
        if(_checkDelta == false) {
          setTimeout(function(){
            _listening = false;
            _checkDelta = true;
          },10);
        }
      } else {
        if(_checkDelta == true) {
          if((event.originalEvent.wheelDeltaY ? (event.originalEvent.wheelDeltaY > 0) : (event.originalEvent.detail) < 0)) {
            if(_active > 0){
                self._goUp();
                ga('send', 'event', 'screen-2', 'scroll-up');
            }
          } else {
            if(_active < _data.$pagesItem.length - 1){
                self._goDown();
                ga('send', 'event', 'screen-1', 'scroll-down', (Modules.OwlHorSlider.getActive() + 1).toString());
            }
          }
          _checkDelta = false;
          setTimeout(function(){
            _listening = true;
          }, 100);
        }
      }

      return self;
    }

    // Time delay
    self._throttle = function(fn, threshhold, scope) {
      threshhold || (threshhold = 50);

      var _last,
          _deferTimer;
      return function () {
        var _context = scope || this;

        var _now = +new Date,
            _args = arguments;
        if (_last && _now < _last + threshhold) {
          // hold on to it
          clearTimeout(_deferTimer);
          _deferTimer = setTimeout(function () {
            _last = _now;
            fn.apply(_context, _args);
          }, threshhold);
        } else {
          _last = _now;
          fn.apply(_context, _args);
        }
      }
        return self;
    }

    // Bind swipe event
    self._onSwipe = function(){
        $(window).on('mousewheel', self._throttle(self._checkSwipe, 50));
        $(window).on('DOMMouseScroll', self._throttle(self._checkSwipe, 50));
        _data.$bodyItem.addClass(_settings.swipePagesItemClass);
        _data.$pagesItem.addClass(_settings.swipeSlidesItemClass);
        _data.$pagesItem.removeClass(_settings.swipeActiveItemClass);
        _data.$pagesItem.eq(_active).addClass(_settings.swipeActiveItemClass);
        $(window).scrollTop(0);

        return self;
    }

    // Unbind swipe event
    self._offSwipe = function(){ 
        $(window).off('mousewheel');
        $(window).off('DOMMouseScroll');
        _data.$pagesItem.removeClass(_settings.swipeSlidesItemClass);
        _data.$pagesItem.removeClass(_settings.swipeActiveItemClass);
        _data.$bodyItem.removeClass(_settings.swipePagesItemClass);

        return self;
    }

    // Refresh on resize
    self._onResize = function(){     
        $(window).on('resize', function(){
            _mobile = Modules.isMobail('1023');
            console.log('mobile ' + _mobile)
            console.log($(window).width())
            if(!_mobile) self._offSwipe()._onSwipe();
            else self._offSwipe();

            self._checkActive();
        });

        return self;
    }

    // Find current active page index
    self._checkActive = function(){
        _active = Math.floor($(window).scrollTop()/$(window).width());

        return self;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.VertSlider || {}, jQuery));

Modules.OwlHorSlider = (function(self, $){

    var _settings = {
        topPersonItemClass: '',
        bottomPersonItemClass: '',
        bottomActiveItemClass: '',
        bottomIcoItemClass: '',
        bottomActiveIcoItemClass: '',
        messagesItemClass: '',
        messageItemClass: '',
        imagesItemClass: '',
        imageItemClass: '',
        textsItemClass: '',
        textItemClass: '',
        messageActiveClass: '',
        imageActiveClass: '',
        textActiveClass: '',
        textsActiveClass: '',
        imagesActiveClass: '',
        prevImageActiveClass: '',
        topMessagesItemClass: '',
        topMessageItemClass: '',
        topMessageActiveClass: '',
        topMessagesActiveClass: '',
        showMobileButtonItemClass: '',
        phoneMobileItemClass: '',
        phoneMobileActiveClass: '',
        rightArrowItemClass: '',
        leftArrowItemClass: '',
        mobilePersonItemClass: '',
        bgOneItemClass: '',
        bgTwoItemClass: '',
        bgThreeItemClass: '',
        owlObject: '',
    },
    _data = {
        $topPersonItem: '',
        $bottomPersonItem: '',
        $bottomIcoItem: '',
        $messagesItem: '',
        $messageItem: '',
        $imagesItem: '',
        $imageItem: '',
        $textsItem: '',
        $textItem: '',
        $topMessagesItem: '',
        $phoneMobileItem: '',
        $showMobileButtonItem: '',
        $mobilePersonItem: '',
        $bodyhtml: '',
        persons: {}
    },
    _prevMessageIndex = 0,
    _prevActive = 0,
    _active = 0,
    _position = 0,
    _mobile = false;

    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$bodyhtml = $('html, body');
        _data.$topPersonItem = $( _settings.topPersonItemClass );
        _data.$bottomPersonItem = $( _settings.bottomPersonItemClass );
        _data.$bottomIcoItem = $( _settings.bottomIcoItemClass );
        _data.$messagesItem = $( _settings.messagesItemClass );
        _data.$messageItem = $( _settings.messageItemClass );
        _data.$imagesItem = $( _settings.imagesItemClass );
        _data.$imageItem = $( _settings.imageItemClass );
        _data.$textsItem = $( _settings.textsItemClass );
        _data.$textItem = $( _settings.textItemClass );
        _data.$topMessagesItem = $( _settings.topMessagesItemClass );
        _data.$phoneMobileItem = $( _settings.phoneMobileItemClass );
        _data.$showMobileButtonItem = $( _settings.showMobileButtonItemClass );
        _data.$mobilePersonItem = $( _settings.mobilePersonItemClass );


        $.each(_data.$topPersonItem, function(i,v){
            _data.persons[i] = _data.persons[i] || [];
            _data.persons[i] = {messageIndex: 0};
            self._setActiveMessage(i, _data.persons[i].messageIndex);
        });

        self._onBottomItemClick()._onTopItemClick()._setBottomActiveItem()._onMessageClick()
        ._onRightArrowClick()._onLeftArrowClick()._onShowMobileButtonClick();

        Modules.PubSub.subscribe('navClick', self._subscribeAction);
        Modules.PubSub.subscribe('randomPerson', self._setRandomPerson);
        Modules.PubSub.subscribe('getPerson', self._subscribeAction);

        return self;
    }

    self._setRandomPerson = function(){
        _prevActive = _active;
        _active = Math.floor(Math.random() * (_data.$topPersonItem.length - 0) + 0);
        _position = _active * 200 - 200;
        self._setBottomActiveItem()._owlChangeSlide(_active)._showCurrentInfo()._setActiveMessage();

        return self;
    }

    self._setActiveMessage = function(personIndex, messageIndex){
        if(!personIndex) personIndex = _active;
        if(!messageIndex) messageIndex = _data.persons[personIndex].messageIndex;

        _data.$messagesItem.eq(personIndex).find(_settings.messageItemClass).removeClass(_settings.messageActiveClass);   
        _data.$messagesItem.eq(personIndex).find(_settings.messageItemClass).eq(messageIndex).addClass(_settings.messageActiveClass); 

        _data.$imagesItem.removeClass(_settings.imagesActiveClass);   
        _data.$imagesItem.eq(_active).addClass(_settings.imagesActiveClass); 

        if(_prevMessageIndex != messageIndex){
            _data.$imagesItem.eq(personIndex).find(_settings.imageItemClass).removeClass(_settings.prevImageActiveClass);   
            _data.$imagesItem.eq(personIndex).find(_settings.imageItemClass).eq(_prevMessageIndex).addClass(_settings.prevImageActiveClass); 
        }

        _data.$imagesItem.eq(personIndex).find(_settings.imageItemClass).removeClass(_settings.imageActiveClass);   
        _data.$imagesItem.eq(personIndex).find(_settings.imageItemClass).eq(messageIndex).addClass(_settings.imageActiveClass); 

        _data.$textsItem.removeClass(_settings.textsActiveClass);   
        _data.$textsItem.eq(_active).addClass(_settings.textsActiveClass); 

        _data.$textsItem.eq(personIndex).find(_settings.textItemClass).removeClass(_settings.textActiveClass);   
        _data.$textsItem.eq(personIndex).find(_settings.textItemClass).eq(messageIndex).addClass(_settings.textActiveClass);

        _data.$topMessagesItem.removeClass(_settings.topMessagesActiveClass);   
        _data.$topMessagesItem.eq(_active).addClass(_settings.topMessagesActiveClass); 

        _data.$topMessagesItem.eq(personIndex).find(_settings.topMessageItemClass).removeClass(_settings.topMessageActiveClass);   
        _data.$topMessagesItem.eq(personIndex).find(_settings.topMessageItemClass).eq(messageIndex).addClass(_settings.topMessageActiveClass);

        _mobile = Modules.isMobail('1023');
        if(_mobile){
            _data.$mobilePersonItem.removeClass(_settings.mobilePersonActiveClass);  
            _data.$mobilePersonItem.eq(personIndex).addClass(_settings.mobilePersonActiveClass);
        }

        return self;
    }

    self._bgAnimation = function(){
        $(_settings.bgOneItemClass).css({'background-position': '-' + _position + 'px 0'});

        //setTimeout(function(){
            $(_settings.bgTwoItemClass).css({'background-position': (_position + 50) + 'px 0'});
        //}, 150);

        // setTimeout(function(){
            $(_settings.bgThreeItemClass).css({'background-position': '-' + (_position + 100) + 'px 0'});
        // }, 300);

        // setTimeout(function(){
            _position = _position + 200;
        // }, 500);

        return self;
    }

    self._onRightArrowClick = function(){
        $(document).on('click', _settings.rightArrowItemClass, function(e){
            _prevMessageIndex = _data.persons[_active].messageIndex;
            if(_data.persons[_active].messageIndex + 1 > _data.$messagesItem.eq(_active).find(_settings.messageItemClass).length - 1) _data.persons[_active].messageIndex = 0;
            else _data.persons[_active].messageIndex = _data.persons[_active].messageIndex + 1;

            self._setActiveMessage();

            ga('send', 'event', 'screen-2', 'click-sub', (_active + 1) + " - " + (_data.persons[_active].messageIndex + 1));

            return false;
        });

        return self;
    }

    self._onLeftArrowClick = function(){
        $(document).on('click', _settings.leftArrowItemClass, function(e){
            _prevMessageIndex = _data.persons[_active].messageIndex;
            if(_data.persons[_active].messageIndex - 1 < 0) _data.persons[_active].messageIndex = _data.$messagesItem.eq(_active).find(_settings.messageItemClass).length - 1;
            else _data.persons[_active].messageIndex = _data.persons[_active].messageIndex - 1;
            console.log('_data.persons[_active].messageIndex');
            console.log(_data.persons[_active].messageIndex);
            self._setActiveMessage();

            ga('send', 'event', 'screen-2', 'click-sub', (_active + 1) + " - " + (_data.persons[_active].messageIndex + 1));

            return false;
        });
                
        return self;
    }

    self._onShowMobileButtonClick = function(){
        $(document).on('click', _settings.showMobileButtonItemClass, function(e){
            if(_data.$phoneMobileItem.hasClass(_settings.phoneMobileActiveClass)){
                _data.$phoneMobileItem.removeClass(_settings.phoneMobileActiveClass);
                _data.$showMobileButtonItem.text(_data.$showMobileButtonItem.data('notactive'));
            }else{
                _data.$phoneMobileItem.addClass(_settings.phoneMobileActiveClass);
                _data.$showMobileButtonItem.text(_data.$showMobileButtonItem.data('active'));
            }

            return false;
        });
                
        return self;
    }

    self._onMessageClick = function(){
        $(document).on('click', _settings.messageItemClass, function(e){
            _prevMessageIndex = _data.persons[_active].messageIndex;
            _data.persons[_active].messageIndex = $(this).index();
            if(_prevMessageIndex !== _data.persons[_active].messageIndex){
                self._showCurrentInfo()._setActiveMessage();
                ga('send', 'event', 'screen-2', 'click-sub', (_active + 1) + " - " + (_data.persons[_active].messageIndex + 1));
            }

            return false;
        });

        return self;
    }

    self._showCurrentInfo = function(){
        _data.$imagesItem.removeClass(_settings.imagesActiveClass);
        _data.$imagesItem.eq(_active).addClass(_settings.imagesActiveClass);
        _data.$textsItem.removeClass(_settings.textsActiveClass);
        _data.$textsItem.eq(_active).addClass(_settings.textsActiveClass);

        return self;
    }

    self._setBottomActiveItem = function(){
        _data.$bottomPersonItem.removeClass(_settings.bottomActiveItemClass);
        _data.$bottomPersonItem.eq(_active).addClass(_settings.bottomActiveItemClass);
        var _left = _data.$bottomPersonItem.eq(_active).offset().left + _data.$bottomPersonItem.eq(_active).width();
        // _data.$bottomIcoItem.removeClass(_settings.bottomActiveIcoItemClass + _prevActive).addClass(_settings.bottomActiveIcoItemClass + _active);
        _data.$bottomIcoItem.removeClass(_settings.bottomActiveIcoItemClass).addClass(_settings.bottomActiveIcoItemClass);

        return self;
    }

    self._subscribeAction = function(index){
        if(index){
            _prevActive = _active;
            _active = index;
            _position = _active * 300 - 300;
        }

        self._setBottomActiveItem()._owlChangeSlide(_active)._showCurrentInfo()._setActiveMessage();

        return self;
    }

    self._scrollToTop = function(){
        _data.$bodyhtml.animate({ 
            scrollTop: _data.$mobilePersonItem.eq(_active).parent().offset().top
        }, 500);

        return self;
    }

    self._onBottomItemClick = function(){
        $(document).on('click', _settings.bottomPersonItemClass, function(e){
            _prevActive = _active;
            _active = $(this).index();

            if(_prevActive != _active){
                ga('send', 'event', 'screen-2', 'click-character', (_active + 1).toString());
                self._setBottomActiveItem()._owlChangeSlide(_active)._showCurrentInfo()._bgAnimation()._setActiveMessage();

                if(_mobile){
                    self._scrollToTop();
                }
            }

            return false;
        });

        return self;
    }

    self._owlChangeSlide = function(index){
        if(!index) index = _active;
        _settings.owlObject.trigger("to.owl.carousel", index);

        return self
    }

    self._onTopItemClick = function(){
        $(document).on('click', _settings.topPersonItemClass, function(e){
            _prevActive = _active;
            _active = $(this).index();
            if(_prevActive != _active){
                ga('send', 'event', 'screen-1', 'click-character', (_active + 1).toString());
                self._setBottomActiveItem()._owlChangeSlide(_active)._showCurrentInfo()._bgAnimation()._setActiveMessage();
            }

            Modules.PubSub.publish('personClick', _active);

            return false;
        });

        return self;
    }

    self.getActive = function(){
        return _active;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        },
        getActive: function(){
            return self.getActive();
        }

    }
}(Modules.OwlHorSlider || {}, jQuery));

Modules.FixedHeader = (function(self, $){

    var _settings = {
        mobileHeaderItemClass: '',
        mobileHeaderActiveClass: '',
        sectionItemClass: ''
    },
    _data = {
        $mobileHeaderItem: '',
        $sectionItem: ''
    },
    _mobile = false,
    _top = 0;
        
    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$mobileHeaderItem = $( _settings.mobileHeaderItemClass );
        _data.$sectionItem = $( _settings.sectionItemClass );
       
        _top = _data.$sectionItem.offset().top + _data.$mobileHeaderItem.height();
        _mobile = Modules.isMobail('1023');
        if(_mobile) self._onScroll();
        else self._offScroll();

        self._onResize();

        return self;
    }

    // Bind swipe event
    self._onScroll = function(){
        $(window).on('scroll', self._setFixed);

        return self;
    }

    // Unbind swipe event
    self._offScroll = function(){ 
        $(window).off('scroll');

        return self;
    }

    self._setFixed = function(){
        if($(window).scrollTop() >= _top){
            _data.$mobileHeaderItem.addClass(_settings.mobileHeaderActiveClass);
        }else{
            _data.$mobileHeaderItem.removeClass(_settings.mobileHeaderActiveClass);
        }

        return self;
    }

    // Refresh on resize
    self._onResize = function(){     
        $(window).on('resize', function(){
            _mobile = Modules.isMobail('1023');
            _top = _data.$sectionItem.offset().top + _data.$mobileHeaderItem.height();
            if(_mobile) self._onScroll();
            else self._offScroll();
        });

        return self;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.FixedHeader || {}, jQuery));

Modules.MobileMenu = (function(self, $){
    
    var _settings = {
        menuOverlayItemClass: '',
        openCloseClickItemClass: '',
        mobileMenuItemClass: '',
        openCloseClickActiveClass: '',
        htmlOverflowActiveClass: '',
        menuOverlayActiveClass: '',
        menuOverlayNonActiveClass: '',
        navMenuLinkItemClass: ''
    },
    _data = {
        $menuOverlayItem: '',
        $openCloseClickElement: '',
        $mobileMenuItem: '',
        $navMenuLinkItem: '',
        $body: '',
        $bodyhtml: '',
        trigger: false,
        scroll : 0
    }
        
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$bodyhtml = $('html, body');
        _data.$body = $('body');
        _data.$menuOverlayItem = $( _settings.menuOverlayItemClass );
        _data.$openCloseClickItem = $( _settings.openCloseClickItemClass );
        _data.$mobileMenuItem = $( _settings.mobileMenuItemClass );
        _data.$navMenuLinkItem = $( _settings.navMenuLinkItemClass );

        _data.$menuOverlayItem.addClass(_settings.menuOverlayNonActiveClass)

        _mobile = Modules.isMobail('1023');
        if(_mobile) self._onOpenCloseMenuEvent()._onNavMenuLinkClick();
        else self._offOpenCloseMenuEvent();

        return self;
    }
    
    self._onNavMenuLinkClick = function(){
        $(document).on('click', _settings.navMenuLinkItemClass, function(e){
            e.stopPropagation();
            var _obj = $(this);
            self._closeMenu();

            // _data.$menuOverlayItem.one('webkitAnimationEnd oAnimationEnd animationend', function(e){
                Modules.PubSub.publish('navClick', _obj.parent().index());
            // });

            return false;
        });
        
        return self;
    }

    self._onOpenCloseMenuEvent = function(){
        $(document).on('click', _settings.openCloseClickItemClass, function(){
            if(_data.trigger == false){
                self._openMenu();
            } else {
                self._closeMenu();
            }

            return false;
        });
        
        return self;
    }

    self._offOpenCloseMenuEvent = function(){
        $(document).off('click', _settings.openCloseClickItemClass);
        
        return self;
    }

    self._openMenu = function(){
        _data.$menuOverlayItem.addClass(_settings.menuOverlayActiveClass).removeClass(_settings.menuOverlayNonActiveClass);
        _data.trigger = true;
        _data.scroll = $(document).scrollTop();

        _data.$bodyhtml.addClass(_settings.htmlOverflowActiveClass);
        _data.$openCloseClickItem.addClass(_settings.openCloseClickActiveClass);

        _data.$bodyhtml.animate({ 
            scrollTop: 0
        }, 0);

        if(_data.$body.height() < _data.$mobileMenuItem.height()){
            _data.$mobileMenuItem.height(_data.$body.height()).css({'position': 'absolute', 'overflow-y': 'scroll', 'overflow-x': 'hidden'});
        }

        return self;
    }

    self._closeMenu = function(){
        _data.$bodyhtml.removeClass(_settings.htmlOverflowActiveClass);

        _data.$bodyhtml.animate({ 
          scrollTop: _data.scroll 
        }, 0);

        _data.$openCloseClickItem.removeClass('open');

        _data.$menuOverlayItem.removeClass(_settings.menuOverlayActiveClass).addClass(_settings.menuOverlayNonActiveClass);
        _data.trigger = false;

        return self;
    }

    // Refresh on resize
    self._onResize = function(){     
        $(window).on('resize', function(){
            _mobile = Modules.isMobail('1023');
            if(_mobile) self._onOpenCloseMenuEvent()._onNavMenuLinkClick();
            else self._offOpenCloseMenuEvent();
        });

        return self;
    }
    
    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.MobileMenu || {}, jQuery));

Modules.FontSize = (function(self, $){
    
    var _settings = {
    },
    _data = {
        $body: ''
    }
        
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$body = $('body');

        _mobile = Modules.isMobail('1023');
        if(!_mobile) self._resizeFont();
        
        self._onResize();

        return self;
    }
    
    self._resizeFont = function(){
        if($(window).innerWidth() > 1023) {
            var e = 2550;
            var i = 10;
            if($(window).innerWidth() < 900) {
                if ($(window).innerHeight() < $(window).innerWidth()) e = 840;
                else if ($(window).innerHeight() / $(window).innerWidth() > .7) e = 568;

                var n = $(window).innerWidth(),
                  t = n / e,
                  o = i * t;
                document.body.style.fontSize = o + "px";
            }
            else {
              i = 40;
              var n = $(window).innerWidth(),
                  t = n / e,
                  o = i * t;
              _data.$body.css("font-size", o + "px");
            }
        }
        
        return self;
    }

    // Refresh on resize
    self._onResize = function(){     
        $(window).on('resize', function(){
            _mobile = Modules.isMobail('1023');
            if(!_mobile) self._resizeFont();
        });

        return self;
    }
    
    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.FontSize || {}, jQuery));

Modules.Preloader = (function(self, $){

    var _settings = {
        sectionItemClass: '',
        logoItemId: '',
        logoItemActiveClass: '',
        bodyItemActiveClass: ''
    },
    _data = {
        $sectionItem: '',
        $body: '',
        $logoItem: ''
    };
    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$body = $('body');
        _data.$sectionItem = $( _settings.sectionItemClass );
        _data.$logoItem = $( _settings.logoItemId );

        self._startAnimation();

        return self;
    }

    self._startAnimation = function(){
        $('html').css({});
        _data.$logoItem.addClass(_settings.logoItemActiveClass);

        setTimeout(function() {
            _data.$sectionItem.fadeOut(700, function() {
                _data.$sectionItem.remove();
                Modules.PubSub.publish('preloaderEnd', 0);
            });

            _data.$body.removeClass(_settings.bodyItemActiveClass);
        }, 1600);


        return self;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.Preloader || {}, jQuery));

Modules.GetUrl = (function(self, $){

    var _settings = {
    },
    _data = {

    },
    _active = 0;

    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);

        self._getUrlPerson('char');

        return self;
    }

    self._getUrlPerson = function(param){
        var _pageUrl = decodeURIComponent(window.location.search.substring(1)),
            _urlVar = _pageUrl.split('&'),
            _paramName,
            i;

        for (i = 0; i < _urlVar.length; i++) {
            _paramName = _urlVar[i].split('=');

            if (_paramName[0] === param) {
                if(_paramName[1]){
                    _active = $('*[data-' + param + '="' + _paramName[1] + '"]').index();
                    Modules.PubSub.publish('getPerson', _active);
                }
            }else Modules.PubSub.publish('randomPerson', _active);
        }

        return self;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.GetUrl || {}, jQuery));

Modules.Animations = (function(self, $){

    var _settings = {
        logoItemClass: '',
        bodyAnimationClass: '',
        activeSvgClass: '',
        bgItemsItemClass: '',
        logoImageItemClass: ''
    },
    _data = {
        $logoItem: '',
        $bgItemsItem: '',
        $logoImageItem: '',
        $body: ''

    },
    _active = 0,
    _pulseIndex = 0;

    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$body = $('body');
        _data.$logoItem = $(_settings.logoItemClass);
        _data.$bgItemsItem = $(_settings.bgItemsItemClass);
        _data.$logoImageItem = $(_settings.logoImageItemClass);

        Modules.PubSub.subscribe('preloaderEnd', self._logoAnimation);
        Modules.PubSub.subscribe('preloaderEnd', self._bgItemsAnimation);

        // setTimeout(function(){
        //     setInterval(function(){
        //         _active = 0;
        //         self._pulseIteration();
        //     }, 4500);
        // },1800);

        return self;
    }

    self._logoAnimation = function(param){
        _data.$logoImageItem.hide();
        _data.$logoItem.addClass(_settings.activeSvgClass);
        var tmax_optionsGlobal = {
          repeat: 0,
          repeatDelay: 0.65,
          yoyo: true
        };

        CSSPlugin.useSVGTransformAttr = true;

        var tl = new TimelineMax(tmax_optionsGlobal),
            path = 'svg *',
            stagger_val = 0.0125,
            duration = 0.65;

        $.each($(path), function(i, el) {
          tl.set($(this), {
            x: '+=' + self._getRandom(-500, 500),
            y: '+=' + self._getRandom(-500, 500),
            rotation: '+=' + self._getRandom(-720, 720),
            scale: 0,
            opacity: 0
          });
        });

        var stagger_opts_to = {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          ease: Power4.easeInOut
        };

        tl.staggerTo(path, duration, stagger_opts_to, stagger_val);

        // var $svg = $(_settings.logoItemClass);
        // $svg.hover(
        //   function() {
        //     tl.timeScale(0.15);
        //   },
        //   function() {
        //     tl.timeScale(1);
        //   });

        setTimeout(function(){
            _data.$body.addClass(_settings.bodyAnimationClass);
            setTimeout(function(){
                _data.$logoImageItem.show();
                _data.$logoItem.hide()
            }, 200);
        }, 1000);

        return self;
    }

    self._getRandom = function(min, max) {
      return Math.random() * (max - min) + min;
    }

    self._bgItemsAnimation = function(){
        $.each(_data.$bgItemsItem, function(){
            $(this).css({'animation': 'fadeInUp .5s ease-in-out both', 'animation-delay': self._getRandom(0, 3) + 's'});
        });
    }

    self._pulseIteration = function(){
        if(_active <= $('.person-i').length - 1){
                var _obj = $('.person-i').eq(_active);
                _obj.addClass('_person-i-active');

                setTimeout(function(){
                    _obj.removeClass('_person-i-active');
                    _active++;
                    self._pulseIteration();
                }, 500);            
        }else _active = 0;

        return self;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.Animations || {}, jQuery));

Modules.GaAdditional = (function(self, $){

    var _settings = {
        linkItemClass: ''
    },
    _data = {
        $linkItem: ''

    };

    // Module constructor
    self._construct = function(params){
        $.extend(_settings, params);
        _data.$linkItem = $(_settings.linkItemClass);

        self._onLinkClick();

        return self;
    }

    self._onLinkClick = function(param){
        $(document).on('click', _settings.linkItemClass, function(e){
            ga('send', 'event', 'screen-2', 'click-out');
        });
        
        return self;
    }

    return {
        init: function(params){
            self._construct(params);

            return self;
        }
    }
}(Modules.Animations || {}, jQuery));

(function($){
    $(function(){
        var owlSlider = $('.mans-list.owl-carousel').owlCarousel({
            loop: false,
            items: 1,
            nav: true,
            touchDrag: false,
            mouseDrag: false,
            smartSpeed: 250
        });

        var vertSlider = new Modules.VertSlider.init({
            scrollButtonItemClass: '.arrowToBottom',
            scrollLogoItemClass: '.logo',
            pagesItemClass: '.outer-wrap',
            swipePagesItemClass: 'swipe-pages',
            swipeSlidesItemClass: 'swipe-pages__slide',
            swipeActiveItemClass: '_active',
            swipeUpItemClass: '_up',
            swipeDownItemClass: '_down'
        });

        var owlHorSlider = new Modules.OwlHorSlider.init({
            topPersonItemClass: '.person-i',
            bottomPersonItemClass: '.face',
            bottomActiveItemClass: '_person-active',
            bottomIcoItemClass: '.jackdaw',
            bottomActiveIcoItemClass: '_bottom-person-active',
            messagesItemClass: '.messages-list',
            messageItemClass: '.message',
            imagesItemClass: '.image-array',
            imageItemClass: 'img',
            textsItemClass: '.text-wrap',
            textItemClass: '.paragraphList',
            messageActiveClass: '_message-active',
            prevImageActiveClass: '_prev-image-active',
            imageActiveClass: '_image-active',
            textActiveClass: '_text-active',
            textsActiveClass: '_texts-active',
            imagesActiveClass: '_images-active',
            topMessagesItemClass: '.top-message-list-wrap',
            topMessageItemClass: 'li',
            topMessagesActiveClass: '_top-messages-active',
            topMessageActiveClass: '_top-message-active',
            showMobileButtonItemClass: '.show-hide',
            phoneMobileItemClass: '.phone-wrap',
            phoneMobileActiveClass: '_phone-active',
            rightArrowItemClass: '.top-arrow-right',
            leftArrowItemClass: '.top-arrow-left',
            mobilePersonItemClass: '.first .basement-person',
            mobilePersonActiveClass: '_basement-person-active',
            bgOneItemClass: '.b-big-bg-1',
            bgTwoItemClass: '.b-big-bg-2',
            bgThreeItemClass: '.b-big-bg-3',
            owlObject: owlSlider
        });

        var fixedHeader = new Modules.FixedHeader.init({
            mobileHeaderItemClass: '.top-second',
            mobileHeaderActiveClass: 'mobile_header-fixed',
            sectionItemClass: '.second'
        });

        var mobileMenu = new Modules.MobileMenu.init({
            menuOverlayItemClass: '.nav-menu',
            menuOverlayActiveClass: 'pt-page-from-left-to-right',
            menuOverlayNonActiveClass: 'pt-page-from-right-to-left',
            openCloseClickItemClass: '.nav-toggle',
            mobileMenuItemClass: '.top-menu',
            openCloseClickActiveClass: 'open',
            htmlOverflowActiveClass: 'html_noscroll',
            navMenuLinkItemClass: '.nav-menu a'
        });

        var fontSize = new Modules.FontSize.init({
        });

        var getUrl = new Modules.GetUrl.init({
        });

        var gaAdditional = new Modules.GaAdditional.init({
            linkItemClass: '.basement .link a'
        });

        var preloader = new Modules.Preloader.init({
            sectionItemClass: '.section--first',
            logoItemId: '#voka',
            logoItemActiveClass: 'pt-page-bounceIn',
            bodyItemActiveClass: 'body_noscroll'
        });

        var animations = new Modules.Animations.init({
            logoItemClass: '.voka-svg',
            bodyAnimationClass: '_body-anim-active',
            activeSvgClass: '_svg-active',
            bgItemsItemClass: '.background-items img',
            logoImageItemClass: '.voka__end'
        });
    });
})(jQuery);