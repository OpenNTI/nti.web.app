Ext.define('NextThought.view.content.Reader', {
	extend: 'NextThought.view.content.Base',
	alias: 'widget.reader-content',

	//region Config
	requires: [
		'NextThought.proxy.JSONP',
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
		moduleContainer: 'NextThought.mixins.ModuleContainer'
	},

	cls: 'x-reader-pane scrollable',

	overflowX: 'hidden',
	overflowY: 'scroll',
	ui: 'reader',
	layout: 'auto',
	prefix: 'default',
	//endregion


	//region Setup & Init
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

		this.getIframe().on('iframe-ready', 'bootstrap', this, {single: true});

		this.on({
			scope: this,
			navigateAbort: 'onNavigationAborted',
			navigateComplete: 'onNavigateComplete'
		});


		this.on({
			scope: this,
			destroy: 'endViewAnalytics',
			beginNavigate: 'endViewAnalytics',
			'visibility-changed-hidden': 'endViewAnalytics',
			'visibility-changed-visible': 'beginViewAnalytics'
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		var DH = Ext.DomHelper,
			items = this.floatingItems,
			el = this.getTargetEl();

		this.splash = DH.doInsert(el, {cls: 'no-content-splash initial'}, true, 'beforeEnd');
		this.splash.setVisibilityMode(Ext.dom.Element.DISPLAY);

		items.add(
				(this.pageWidgets = Ext.widget({xtype: 'content-page-widgets', renderTo: this.el, reader: this})));

		items.add(
				(this.notfound = Ext.widget({xtype: 'notfound', renderTo: this.splash, hideLibrary: true})));
	},


	beforeDestroy: function() {
		var items = this.floatingItems;
		if (items) {
			[this.notfound, this.pageWidgets].forEach(function(i) {
				if (i) {
					items.remove(i);
					Ext.destroy(i);
				}
			});
		}
		return this.callParent(arguments);
	},


	showRemainingTime: function() {
		var panel = this.up('reader');

		if (panel && panel.showRemainingTime) {
			return panel.showRemainingTime.apply(panel, arguments);
		}
	},


	showHeaderToast: function() {
		var panel = this.up('reader');

		if (panel) {
			return panel.showHeaderToast.apply(panel, arguments);
		}
	},


	showToast: function(msg, cls) {
		var toast,
			left = this.getX() + this.getWidth(),
			viewWidth = Ext.Element.getViewportWidth(),
			right = (viewWidth - left) + 20;

		cls = cls ? 'reader-toast ' + cls : 'reader-toast';

		toast = this.add({
			xtype: 'box',
			cls: cls,
			autoEl: {html: msg},
			openLongEnough: wait(3000)
		});

		toast.el.setStyle('right', right + 'px');

		return toast;
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


	//endregion



	//region Analytics
	___getActiveBundle: function() {
		var c = (this.up('#content') || {}).currentBundle;
		return c && c.getId();
	},


	beginViewAnalytics: function() {
		var begin = {
			type: 'resource-viewed',
			resource_id: this.getLocation().NTIID,
			course: this.___getActiveBundle()
		};

		if (Ext.isEmpty(begin.resource_id) || !this.isVisible(true)) {
			return;
		}

		if (this.___lastAnalyticEvent && this.___lastAnalyticEvent.resource_id === begin.resource_id) {
			return;
		}

		if (this.___lastAnalyticEvent) {
			console.warn('Overwriting event %o with %o', this.___lastAnalyticEvent, begin);
		}

		this.___lastAnalyticEvent = begin;

		AnalyticsUtil.getResourceTimer(begin.resource_id, begin);
	},


	endViewAnalytics: function() {
		var end = this.___lastAnalyticEvent;

		if (!end) {return;}

		delete this.___lastAnalyticEvent;
		AnalyticsUtil.stopResourceTimer(end.resource_id, 'resource-viewed', end);
	},
	//endregion



	//region Getters/Queries
	getAnnotationOffsets: function() {
		return this.calculateNecessaryAnnotationOffsets();
	},


	// NOTE: Now that we may have more than one reader, each reader should know how
	// to resolve dom ranges/nodes of annotations inside it.
	getDomContextForRecord: function(r, doc, cleanRoot) {
		var rangeDesc = r.get('applicableRange'),
				cid = r.get('ContainerId');

		doc = doc || this.getDocumentElement();
		cleanRoot = cleanRoot || this.getCleanContent();

		return RangeUtils.getContextAroundRange(rangeDesc, doc, cleanRoot, cid);
	},


	getContentMaskTarget: function() {
		var target;

		//if we have a mask target already return that
		if (this.maskTarget) {
			target = this.maskTarget;
		} else if (this.el) {
			//if we have an el cache the mask target
			target = this.maskTarget = this.el.parent('.main-view-container');
		} else {
			//if we don't have an el return the body but don't cache it
			//since we may not be rendered
			target = Ext.getBody();
		}

		return target;
	},
	//endregion


	//region Actions
	activating: function() {
		delete this.annotationOffsetsCache;
	},


	setSplash: function(hideNotFound) {
		if (!this.rendered) {
			return;
		}
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
	//endregion


	//region Event Handlers
	onContextMenuHandler: function() {
		var o = this.getAnnotations();
		return o.onContextMenuHandler.apply(o, arguments);
	},


	setPageInfo: function(pageInfo) {
		var location = this.getLocationProvider();

		location.currentNTIID = pageInfo.getId();

		this.onNavigateComplete(pageInfo, function() {
			location.currentPageInfo = pageInfo;
		});
	},


	onNavigationAborted: function(resp, ntiid) {
		this.splash.removeCls('initial');
	},


	onNavigateComplete: function(pageInfo, finish, hasCallback) {
		var me = this,
			proxy = ContentProxy;

		function success(resp) {
			me.beginViewAnalytics();
			me.splash.hide();
			me.splash.removeCls('initial');
			me.getContent().setContent(resp, pageInfo.get('AssessmentItems'), finish, hasCallback);
		}


		//TODO: don't know how we get into this state but sometimes the pageInfo is null.
		// FIXME: In this case try aborting and the navigation. Don't know if it's the right approach.
		if (!pageInfo) {
			console.error('onNavigateComplete called with no page info. Shouldnt happen', arguments);
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
					me.splash.show();
					me.onNavigationAborted();
					Ext.callback(finish, null, [me, r]);
				}
			});
		}
	},
	//endregion


	//region Statics
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
	//endregion


}, function() {
	window.ReaderPanel = this;

	//TODO: can we get rid of this?
	ContentAPIRegistry.register('togglehint', function(e) {
		e = Ext.EventObject.setEvent(e || event);
		Ext.get(e.getTarget().nextSibling).toggleCls('hidden');
		return false;
	});


});
