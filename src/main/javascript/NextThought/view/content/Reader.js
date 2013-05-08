Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Base',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.providers.Location',
		'NextThought.proxy.JSONP',
		'NextThought.util.Base64',
		'NextThought.view.ResourceNotFound'
	],
	mixins:{
		annotations: 'NextThought.view.content.reader.Annotations',
		assessments: 'NextThought.view.content.reader.Assessment',
		componentOverlay: 'NextThought.view.content.reader.ComponentOverlay',
		content: 'NextThought.view.content.reader.Content',
		iframe: 'NextThought.view.content.reader.IFrame',
		scroll: 'NextThought.view.content.reader.Scroll',
		noteOverlay: 'NextThought.view.content.reader.NoteOverlay',
		resourceManagement: 'NextThought.view.content.reader.ResourceManagement'
	},
	cls: 'x-reader-pane',

	ui: 'reader',
	layout: 'auto',
	prefix: 'default',

	initComponent: function() {
		this.callParent(arguments);

		this.addEvents('finished-restore','content-updated');
		this.enableBubble('finished-restore');

		this.mixins.content.constructor.apply(this,arguments);
		this.mixins.iframe.constructor.apply(this,arguments);
		this.mixins.scroll.constructor.apply(this,arguments);
		this.mixins.annotations.constructor.apply(this,arguments);
		this.mixins.componentOverlay.constructor.apply(this,arguments);
		this.mixins.noteOverlay.constructor.apply(this,arguments);
		this.mixins.assessments.constructor.apply(this,arguments);
		this.mixins.resourceManagement.constructor.apply(this,arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		var DH = Ext.DomHelper,
			el = this.getTargetEl();

		this.splash = DH.doInsert(el,{cls:'no-content-splash initial'},true,'beforeEnd');
		this.scrollShadow = DH.doInsert(this.getEl(),{cls:'scroll-shadow'},true,'beforeEnd');

		this.mon(el,'scroll', 'scrollShadowMonitor', this);

		this.splash.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.notFoundCmp = NextThought.view.ResourceNotFound.create({renderTo: this.splash, hideLibrary: true});
	},

	scrollShadowMonitor: function(e,dom){
		var el = this.scrollShadow;
		el[dom.scrollTop?'addCls':'removeCls']('active');
	},


	activating: function(){
		delete this.annotationOffsetsCache;
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
			windowSizeStatics.left = f.getX();
			windowSizeStatics.height = f.getHeight();
			if(!l){
				l = windowSizeStatics.left - this.getEl().getX();
			}
			windowSizeStatics.gutter = l;
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

	onBeginNavigate: function(ntiid) {

	},

	restore: function(){
		console.debug('Restring?',arguments);
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
			me.setContent(resp, pageInfo.get('AssessmentItems'), finish, hasCallback);
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
			proxy.request({
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
