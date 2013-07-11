Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Base',
	alias: 'widget.reader-content',
	requires: [
		'NextThought.proxy.JSONP',
		'NextThought.util.Base64',
		'NextThought.view.ResourceNotFound',
		'NextThought.view.content.PageWidgets',
		'NextThought.view.content.reader.Content',
		'NextThought.view.content.reader.IFrame',
		'NextThought.view.content.reader.Location',
		'NextThought.view.content.reader.Scroll',
        'NextThought.view.content.reader.Touch',
		'NextThought.view.content.reader.ResourceManagement',
		'NextThought.view.content.reader.ComponentOverlay',
		'NextThought.view.content.reader.Assessment',
		'NextThought.view.content.reader.Annotations',
		'NextThought.view.content.reader.NoteOverlay'
	],

	cls: 'x-reader-pane',

	overflowX: 'hidden',
	overflowY: 'scroll',
	ui: 'reader',
	layout: 'auto',
	prefix: 'default',

	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble(
			'finished-restore'
		);

		this.buildModule('annotations');
		this.buildModule('locationProvider');
		this.buildModule('iframe');
		this.buildModule('scroll');
		this.buildModule('content',{reader:this});
		this.buildModule('componentOverlay');
		this.buildModule('assessment');
		this.buildModule('resourceManager');
		this.buildModule('noteOverlay');
        this.buildModule('touch');

		this.mon(this.getAnnotations(),'rendered','fireReady',this);
		this.getIframe().on('iframe-ready', 'bootstrap', this, {single: true});

		this.on({
			scope: this,
			//beforeNavigate: 'onBeforeNavigate',
			beginNavigate: 'onBeginNavigate',
            navigateAbort: 'onNavigationAborted',
			navigateComplete: 'onNavigateComplete'
		});
	},


	bootstrap: function(loc){
		//differed reader startup. State restore will not do anything on an un-rendered reader...so start it after the
		// reader is rendered.
		var l = loc || this.getLocation().NTIID,
			cb = null,
			silent = true;

		if(!Ext.isString(l)){
			silent = l[2];
			cb = Ext.isFunction(l[1])? l[1] : null;
			l = l[0];
		}

		this.setLocation(l,cb,silent);
	},


	buildModule: function(name,config,relay){
		var m = Ext.createByAlias('reader.'+name,Ext.apply({reader:this},config)),
			getterName = 'get'+Ext.String.capitalize(name);

		if(this[getterName]){
			console.error('Module getter name taken: '+getterName);
			return;
		}


		this[getterName] = function(){return m;};
	},


	primeReadyEvent: function(){
		this.readyEventPrimed = true;
	},


	needsWaitingOnReadyEvent: function(){
		return Boolean(this.readyEventPrimed);
	},


	fireReady: function(){
		if(this.navigating){
			console.warn('fired ready while navigating');
			return;
		}

		if(!this.readyEventPrimed){return;}

		delete this.readyEventPrimed;
		console.warn('should-be-ready fired');
		this.fireEvent('should-be-ready',this);
	},


	afterRender: function(){
		this.callParent(arguments);
		var DH = Ext.DomHelper,
			el = this.getTargetEl();


		this.splash = DH.doInsert(el,{cls:'no-content-splash initial'},true,'beforeEnd');
		this.splash.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.floatingItems.add(
				Ext.widget({xtype:'content-page-widgets', renderTo: this.el, reader: this}));

		this.floatingItems.add(
				Ext.widget({xtype:'notfound', renderTo:this.splash, hideLibrary:true}));
	},


	activating: function(){
		delete this.annotationOffsetsCache;
	},


	setSplash: function(){
		this.getScroll().to(0, false);
		this.getIframe().update(false);
		this.meta = {};
		this.splash.dom.parentNode.appendChild(this.splash.dom);
		this.splash.show();
	},


	calculateNecessaryAnnotationOffsets: function(){
		var cache =  this.annotationOffsetsCache || {},
			windowSizeStatics = cache.windowSizeStatics || {},
			scrollStatics = cache.scrollStatics || {},
			currentWindowSize = Ext.dom.Element.getViewSize(),
			f = this.getIframe().get(),
			scrollPosition = this.body.getScroll().top;

		//Other things are based on the windowSize. left and height
		if(   !windowSizeStatics.hasOwnProperty('windowSize')
		   || !windowSizeStatics.windowSize.width
		   || windowSizeStatics.windowSize.width !== currentWindowSize.width){

			windowSizeStatics.windowSize = currentWindowSize;
			windowSizeStatics.left = f.getX();
		}

		cache.windowSizeStatics = windowSizeStatics;

		//some are based on scroll position
		if(   !scrollStatics.hasOwnProperty('lastScroll')
		   || !scrollStatics.top
		   || scrollStatics.lastScroll !== scrollPosition){
			scrollStatics.lastScroll = scrollPosition;
			scrollStatics.top = f.getY();
		}

		cache.scrollStatics = scrollStatics;

		//Incase the cache object didn't exist before set it back
		this.annotationOffsetsCache = cache;

		return {
			top: scrollStatics.top, //static by scroll position
			left: windowSizeStatics.left, //static based on window size
			scrollTop: scrollPosition //dynamic
		};
	},


	getAnnotationOffsets: function(){
		return this.calculateNecessaryAnnotationOffsets();
	},


	onContextMenuHandler: function(){
		var o = this.getAnnotations();
		return o.onContextMenuHandler.apply(o,arguments);
	},


	onBeginNavigate: function(ntiid) {
		this.navigating = true;
	},


    onNavigationAborted: function(resp, ntiid) {
		this.splash.removeCls('initial');
	    delete this.navigating;
    },


	onNavigateComplete: function(pageInfo, finish, hasCallback){
		var me = this,
			proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		function success(resp){
			delete me.navigating;
			me.primeReadyEvent();
			me.splash.hide();
			me.splash.removeCls('initial');
			me.getContent().setContent(resp, pageInfo.get('AssessmentItems'), finish, hasCallback);
		}

		if(this.annotationOffsetsCache){
			delete this.annotationOffsetsCache.locationStatics;
		}

		//TODO: don't know how we get into this state but sometimes the pageInfo is null.
		// FIXME: In this case try aborting and the navigation. Don't know if it's the right approach.
		if(!pageInfo){
			console.warn('onNavigateComplete called with no page info. Shouldnt happen', arguments);
			console.trace();
			me.onNavigationAborted();
		}

		//TODO doing error handling here doesn't really make sense.  We need
		//to move it up a few levels (using an error callback?) such that
		//the thing initiating the navigation request can handle the error.
		//We may want to do differnt things depending on where the navigation request
		//occurred from
		else if(!pageInfo.isModel){
			//If its not a model it may be a response object indicating an error.
			//leave the mask in place and for now we assume something else is handling the
			//error or presenting it appropriately. We will call anything no
			if(pageInfo.status !== undefined && Ext.Ajax.isHTTPErrorCode(pageInfo.status)){
				console.warn('onNavigationComplete called with pageInfo that looks like an error http response.'
							 + ' Expecting someone else would have handled the error by now', pageInfo);
			}
			else{
				console.warn('onNavigationComplete not called with pageInfo but it doesn\'t look like an error.', pageInfo);
			}
			me.onNavigationAborted();
		}
		else {
			//hack:
			if(!Ext.isEmpty(pageInfo.get('content'))){
				success.call(this,{
					responseText: pageInfo.get('content'),
					request:{options:{pageInfo:pageInfo,url:''}}
				});
				return;
			}

			proxy.request({
				pageInfo: pageInfo,
				ntiid: pageInfo.getId(),
				jsonpUrl: pageInfo.getLink('jsonp_content'),
				url: pageInfo.getLink('content'),
				expectedContentType: 'text/html',
				scope: this,
				success: success,
				failure: function(r) {
					console.log('server-side failure with status code ' + r.status+'. Message: '+ r.responseText);
					me.splash.hide();
					me.onNavigationAborted();
				}
			});
		}
	},


	statics : {
		get: function(prefix){
			return Ext.ComponentQuery.query(
					Ext.String.format('reader-content[prefix={0}]',prefix||'default'))[0];
		}
	}

}, function(){
	window.ReaderPanel = this;

//	ContentAPIRegistry.register('NTIHintNavigation',this.setLocation,this);
	ContentAPIRegistry.register('togglehint',function(e) {
		e = Ext.EventObject.setEvent(e||event);
		Ext.get(e.getTarget().nextSibling).toggleCls("hidden");
		return false;
	});


});
