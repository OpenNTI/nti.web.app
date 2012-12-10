Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Base',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.providers.Location',
		'NextThought.proxy.JSONP',
		'NextThought.util.Base64'
	],
	mixins:{
		annotations: 'NextThought.view.content.reader.Annotations',
		assessments: 'NextThought.view.content.reader.AssessmentOverlay',
		content: 'NextThought.view.content.reader.Content',
		iframe: 'NextThought.view.content.reader.IFrame',
		scroll: 'NextThought.view.content.reader.Scroll',
		noteOverlay: 'NextThought.view.content.reader.NoteOverlay'
	},
	cls: 'x-reader-pane',

	ui: 'reader',
	layout: {
		type: 'hbox',
		pack: 'end',
		reserveScrollbar: true
	},
	prefix: 'default',

	initComponent: function() {
		this.callParent(arguments);

		this.addEvents('finished-restore','content-updated');
		this.enableBubble('finished-restore');

		this.mixins.content.constructor.apply(this,arguments);
		this.mixins.iframe.constructor.apply(this,arguments);
		this.mixins.scroll.constructor.apply(this,arguments);
		this.mixins.annotations.constructor.apply(this,arguments);
		this.mixins.assessments.constructor.apply(this,arguments);
		this.mixins.noteOverlay.constructor.apply(this,arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.splash = this.body.insertHtml('beforeEnd','<div class="no-content-splash"></div>',true);
		this.scrollShadow = this.getEl().insertHtml('beforeEnd','<div class="scroll-shadow"></div>',true);
		this.mon(this.body,'scroll', this.scrollShadowMonitor, this);
	},

	scrollShadowMonitor: function(e,dom){
		var el = this.scrollShadow;
		el[dom.scrollTop?'addCls':'removeCls']('active');
	},


	setSplash: function(){
		this.scrollTo(0, false);
		this.updateContent(false);
		this.meta = {};
		this.splash.dom.parentNode.appendChild(this.splash.dom);
		this.splash.show();
	},


	convertRectToScreen: function(r) {
		var iframe = this.getIframe(),
			result;

		result = {
			top: r.top + iframe.getTop(),
			left: r.left + iframe.getLeft(),
			right: r.right + iframe.getLeft(),
			bottom: r.bottom + iframe.getTop(),
			height: r.height,
			width: r.width
		};
		return result;
	},


	getContentRoot: function(){
		if(!this.contentRootElement){
			this.contentRootElement = this.getDocumentElement()
					.querySelector('#NTIContent > .page-contents');
		}

		return this.contentRootElement;
	},

	//TODO Not all the things this object returns appear used.
	//As a further optimization we can stop calculating them
	//or create getters for the properties that handle lazy
	//calculations.
	calculateNecessaryAnnotationOffsets: function(){
		var cache =  this.annotationOffsetsCache || {},
			statics = cache.statics || {},
			windowSizeStatics = cache.windowSizeStatics || {},
			scrollStatics = cache.scrollStatics || {},
			f = this.getIframe(),
			currentWindowSize = Ext.dom.Element.getViewSize(),
			locationStatics = cache.locationStatics || {},
			defaultContentPadding = 0, e, l,
			scrollPosition = this.body.getScroll().top;

		//Right now certain thins are static to the reader.
		//currently those props are width
		if(!statics.hasOwnProperty('width')){
			statics.width = f.getWidth();
		}
		cache.statics = statics;

		//Other things are based on the windowSize. left and height
		if(   !windowSizeStatics.hasOwnProperty('windowSize')
		   || !windowSizeStatics.windowSize.width
		   || !windowSizeStatics.windowSize.height
		   || windowSizeStatics.windowSize.width !== currentWindowSize.width
		   || windowSizeStatics.windowSize.height !== currentWindowSize.height){
			windowSizeStatics.windowSize = currentWindowSize;
			windowSizeStatics.left = f.getLeft();
			windowSizeStatics.height = f.getHeight();
			if(!l){
				l = windowSizeStatics.left - this.getEl().getLeft();
			}
			windowSizeStatics.gutter = l + f.getMargin('l');
		}

		cache.windowSizeStatics = windowSizeStatics;

		//some are based on scroll position
		if(   !scrollStatics.hasOwnProperty('lastScroll')
		   || !scrollStatics.top
		   || scrollStatics.lastScroll !== scrollPosition){
			scrollStatics.lastScroll = scrollPosition;
			scrollStatics.top = f.getTop();
		}

		cache.scrollStatics = scrollStatics;

		//The last set is static based on location.  We handle
		//purging this cache in onNavigate so we just need to set it
		//here if it doesn't exist. contentLeftPadding
		if(!locationStatics.hasOwnProperty('contentLeftPadding')){
			try {
				if(!e){
					e = Ext.get(this.getContentRoot());
				}
				if(e){
					locationStatics.contentLeftPadding = e.getMargin('l') + e.getPadding('l');
				}
			}
			catch(er){
				console.error(Globals.getError(er));
			}
		}
		cache.locationStatics = locationStatics;

		//Incase the cache object didn't exist before set it back
		this.annotationOffsetsCache = cache;

		return {
			top: scrollStatics.top, //static by scroll position
			left: windowSizeStatics.left, //static based on window size.  left < gutter
			height: windowSizeStatics.height, //static based on window size.
			width: statics.width,//static value
			gutter: windowSizeStatics.gutter, //static based on window size
			contentLeftPadding: locationStatics.contentLeftPadding || defaultContentPadding, //static based on page
			scrollTop: scrollPosition //dynamic
		};
	},

	getAnnotationOffsets: function(){
		var r = this.calculateNecessaryAnnotationOffsets();
	//	console.log(JSON.stringify(r));
		return r;
	},


	onContextMenuHandler: function(){
		return this.mixins.annotations.onContextMenuHandler.apply(this,arguments);
	},


	onNavigate: function(ntiid) {
		if(this.annotationOffsetsCache){
			delete this.annotationOffsetsCache.locationStatics;
		}

		this.clearAnnotations();

		if(!ntiid) {
			this.setSplash();
			this.relayout();
		}

		return true;
	},


    onNavigationAborted: function() {
        this.setSplash();
        this.relayout();
    },


	onNavigateComplete: function(pageInfo, finish, hasCallback){
		var me = this,
			proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		function success(resp){
			me.splash.hide();
			me.setContent(resp, pageInfo.get('AssessmentItems'), finish, hasCallback);
		}

		if(!pageInfo.isModel){
			if(pageInfo.responseText){
				me.splash.hide();
				//TODO: make a fun-light-spirited "Oh no!" page.
				me.updateContent(pageInfo.responseText);
			}
			me.relayout();
		}
		else {
			proxy.request({
				ntiid: pageInfo.getId(),
				jsonpUrl: pageInfo.getLink('jsonp_content'),
				url: pageInfo.getLink('content'),
				expectedContentType: 'text/html',
				scope: this,
				success: success,
				failure: function(r) {
					console.log('server-side failure with status code ' + r.status+': Message: '+ r.responseText);
					me.splash.hide();
				}
			});
		}
	},


	statics : {
		get: function(prefix){
			return Ext.ComponentQuery.query(
					Ext.String.format('reader-panel[prefix={0}]',prefix||'default'))[0];
		}
	}
}, function(){
	window.ReaderPanel = this;

	ContentAPIRegistry.register('NTIHintNavigation',LocationProvider.setLocation,LocationProvider);
	ContentAPIRegistry.register('togglehint',function(e) {
		e = Ext.EventObject.setEvent(e||event);
		Ext.get(e.getTarget().nextSibling).toggleCls("hidden");
		return false;
	});


});
