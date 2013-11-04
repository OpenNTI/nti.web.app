Ext.define('NextThought.view.content.Reader', {
	extend: 'NextThought.view.content.Base',
	alias: 'widget.reader-content',

	//<editor-fold desc="Config">
	requires: [
		'NextThought.proxy.JSONP',
		'NextThought.util.Base64',
		'NextThought.view.ResourceNotFound',
		'NextThought.view.content.PageWidgets',
		'NextThought.view.content.reader.Content',
		'NextThought.view.content.reader.IFrame',
		'NextThought.view.content.reader.Location',
		'NextThought.view.content.reader.Scroll',
		'NextThought.view.content.reader.ResourceManagement',
		'NextThought.view.content.reader.ComponentOverlay',
		'NextThought.view.content.reader.Assessment',
		'NextThought.view.content.reader.Annotations',
		'NextThought.view.content.reader.NoteOverlay'
	],

	mixins: {
		instanceTracking: 'NextThought.mixins.InstanceTracking',
		moduleContainer: 'NextThought.mixins.ModuleContainer',
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	cls: 'x-reader-pane scrollable',

	overflowX: 'hidden',
	overflowY: 'scroll',
	ui: 'reader',
	layout: 'auto',
	prefix: 'default',
	//</editor-fold>


	//<editor-fold desc="Setup & Init">
	initComponent: function() {
		this.callParent(arguments);
		this.trackThis();

		this.enableBubble(
				'finished-restore'
		);

		var rRef = {reader: this};
		this.buildModule('reader', 'annotations', rRef);
		this.buildModule('reader', 'locationProvider', rRef);
		this.buildModule('reader', 'iframe', rRef);
		this.buildModule('reader', 'scroll', rRef);
		this.buildModule('reader', 'content', rRef);
		this.buildModule('reader', 'componentOverlay', rRef);
		this.buildModule('reader', 'assessment', rRef);
		this.buildModule('reader', 'resourceManager', rRef);
		this.buildModule('reader', 'noteOverlay', rRef);


		//For search hit highlighting we own the search overlay, but we
		//need to forward some of the logic onto the proper module.  Note we
		//do this at init time because we need access to the mixed in module mixins
		//as well as this.
		this.getRangePositionAdjustments = this.forwardToModule('annotations', 'getRangePositionAdjustments');
		this.rangesForSearchHits = this.forwardToModule('annotations', 'rangesForSearchHits');

		this.mon(this.getAnnotations(), 'rendered', 'fireReady', this);
		this.getIframe().on('iframe-ready', 'bootstrap', this, {single: true});

		this.on({
					scope: this,
					//beforeNavigate: 'onBeforeNavigate',
					beginNavigate: 'onBeginNavigate',
					navigateAbort: 'onNavigationAborted',
					navigateComplete: 'onNavigateComplete',
					'load-annotations-skipped': 'skipAnnotationsFireReadyOnFinish'
				});

		// NOTE: check notes on the mixin, as to why we might want to set a secondaryViewEl.
		this.initCustomScrollOn('content', undefined, {secondaryViewEl: '.annotation-view'});
	},


	afterRender: function() {
		this.callParent(arguments);
		var DH = Ext.DomHelper,
			el = this.getTargetEl();

		this.splash = DH.doInsert(el, {cls: 'no-content-splash initial'}, true, 'beforeEnd');
		this.splash.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.floatingItems.add(
				Ext.widget({xtype: 'content-page-widgets', renderTo: this.el, reader: this}));

		this.floatingItems.add(
				(this.notfound = Ext.widget({xtype: 'notfound', renderTo: this.splash, hideLibrary: true})));
	},


	bootstrap: function(loc) {
		//differed reader startup. State restore will not do anything on an un-rendered reader...so start it after the
		// reader is rendered.
		var l = loc || this.getLocation().NTIID,
				cb = null,
				silent = true;

		if (Ext.isEmpty(l)) {
			return;
		}
		if (!Ext.isString(l)) {
			silent = l[2];
			cb = Ext.isFunction(l[1]) ? l[1] : null;
			l = l[0];
		}

		this.setLocation(l, cb, silent);
	},


	primeReadyEvent: function() {
		this.readyEventPrimed = true;
	},


	fireReady: function() {
		if (this.navigating) {
			console.warn('fired ready while navigating');
			return;
		}

		if (!this.readyEventPrimed) {
			return;
		}

		delete this.readyEventPrimed;
		//console.warn('should-be-ready fired');
		this.fireEvent('should-be-ready', this);
	},
	//</editor-fold>


	//<editor-fold desc="Getters/Queries">
	getAnnotationOffsets: function() {
		return this.calculateNecessaryAnnotationOffsets();
	},


	// NOTE: Now that we may have more than one reader, each reader should know how
	// to resolve dom ranges/nodes of annotations inside it.
	getDomContextForRecord: function(r, doc, cleanRoot) {
		var rangeDesc = r.get('applicableRange'),
				cid = r.get('ContainerId');

		doc = doc || this.getDocumentElement();
		cleanRoot = cleanRoot && this.getCleanContent();
		return RangeUtils.getContextAroundRange(rangeDesc, doc, cleanRoot, cid);
	},


	needsWaitingOnReadyEvent: function() {
		return Boolean(this.readyEventPrimed);
	},
	//</editor-fold>


	//<editor-fold desc="Actions">
	skipAnnotationsFireReadyOnFinish: function() {
		this.skippedAnnotations = true;
	},


	activating: function() {
		delete this.annotationOffsetsCache;
	},


	setSplash: function(hideNotFound) {
		this.getScroll().to(0, false);
		this.getIframe().update(false);
		this.meta = {};
		this.splash.dom.parentNode.appendChild(this.splash.dom);
		this.notfound[hideNotFound ? 'hide' : 'show']();
		this.splash.show();
	},


	allowCustomScrolling: function() {
		return this.fireEvent('allow-custom-scrolling');
	},


	calculateNecessaryAnnotationOffsets: function() {
		var cache = this.annotationOffsetsCache || {},
				windowSizeStatics = cache.windowSizeStatics || {},
				scrollStatics = cache.scrollStatics || {},
				currentWindowSize = Ext.dom.Element.getViewSize(),
				f = this.getIframe().get(),
				scrollPosition = this.body.getScroll().top;

		//Other things are based on the windowSize. left and height
		if (!windowSizeStatics.hasOwnProperty('windowSize') ||
			!windowSizeStatics.windowSize.width ||
			windowSizeStatics.windowSize.width !== currentWindowSize.width) {

			windowSizeStatics.windowSize = currentWindowSize;
			windowSizeStatics.left = f.getX();
		}

		cache.windowSizeStatics = windowSizeStatics;

		//some are based on scroll position
		if (!scrollStatics.hasOwnProperty('lastScroll') ||
			!scrollStatics.top ||
			scrollStatics.lastScroll !== scrollPosition) {
			scrollStatics.lastScroll = scrollPosition;
			scrollStatics.top = f.getY();
		}

		cache.scrollStatics = scrollStatics;

		//In case the cache object didn't exist before set it back
		this.annotationOffsetsCache = cache;

		return {
			top: scrollStatics.top, //static by scroll position
			left: windowSizeStatics.left, //static based on window size
			scrollTop: scrollPosition //dynamic
		};
	},
	//</editor-fold>


	//<editor-fold desc="Event Handlers">
	onContextMenuHandler: function() {
		var o = this.getAnnotations();
		return o.onContextMenuHandler.apply(o, arguments);
	},


	//<editor-fold desc="Navigation Handlers">
	onBeginNavigate: function(ntiid) {
		this.navigating = true;
	},


	onNavigationAborted: function(resp, ntiid) {
		this.splash.removeCls('initial');
		delete this.navigating;
	},


	onNavigateComplete: function(pageInfo, finish, hasCallback) {
		var me = this,
			proxy = ContentProxy;

		function success(resp) {
			delete me.navigating;
			me.primeReadyEvent();
			me.splash.hide();
			me.splash.removeCls('initial');
			me.getContent().setContent(resp, pageInfo.get('AssessmentItems'), finish, hasCallback);
			if (me.skippedAnnotations) {
				delete me.skippedAnnotations;
				me.fireReady();
			}
		}


		//TODO: don't know how we get into this state but sometimes the pageInfo is null.
		// FIXME: In this case try aborting and the navigation. Don't know if it's the right approach.
		if (!pageInfo) {
			console.warn('onNavigateComplete called with no page info. Shouldnt happen', arguments);
			console.trace();
			me.onNavigationAborted();
		}

		//TODO: doing error handling here doesn't really make sense.  We need
		//to move it up a few levels (using an error callback?) such that
		//the thing initiating the navigation request can handle the error.
		//We may want to do differnt things depending on where the navigation request
		//occurred from
		else if (!pageInfo.isModel) {
			//If its not a model it may be a response object indicating an error.
			//leave the mask in place and for now we assume something else is handling the
			//error or presenting it appropriately. We will call anything no
			if (pageInfo.status !== undefined && Ext.Ajax.isHTTPErrorCode(pageInfo.status)) {
				console.warn('onNavigationComplete called with pageInfo that looks like an error http response.' +
							 ' Expecting someone else would have handled the error by now', pageInfo);
			}
			else {
				console.warn('onNavigationComplete not called with pageInfo but it doesn\'t look like an error.', pageInfo);
			}
			me.onNavigationAborted();
		}
		else {
			if (!Ext.isEmpty(pageInfo.get('content')) || pageInfo.isPartOfCourseNav()) {
				proxy = this.self.MOCK_PAGE_PROXY;
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
								  console.log('server-side failure with status code ' + r.status + '. Message: ' + r.responseText);
								  me.splash.hide();
								  me.onNavigationAborted();
							  }
						  });
		}
	},
	//</editor-fold>
	//</editor-fold>


	//<editor-fold desc="Statics">
	statics: {
		get: function(prefix) {
			prefix = prefix || 'default';
			function search(r) { return r.prefix === prefix; }
			return Ext.Array.findBy(this.instances, search, this);
		},


		MOCK_PAGE_PROXY: {
			request: function(req) {
				var pageInfo = req.pageInfo,
						resp = {
							getAllResponseHeaders: Ext.emptyFn,
							getResponseHeader: Ext.emptyFn,
							requestId: NaN,
							responseXML: null,
							status: 200,
							statusText: 'OK',
							request: {options: Ext.apply({url: ''}, req)},
							//hack: ---v (getting dynamic content from the pageInfo)
							responseText: pageInfo.get('content') || ''
						};

				Ext.callback(req.success, req.scope, [resp]);
			}
		}
	}
	//</editor-fold>


}, function() {
	window.ReaderPanel = this;

  //	ContentAPIRegistry.register('NTIHintNavigation',this.setLocation,this);
	ContentAPIRegistry.register('togglehint', function(e) {
		e = Ext.EventObject.setEvent(e || event);
		Ext.get(e.getTarget().nextSibling).toggleCls('hidden');
		return false;
	});


});
