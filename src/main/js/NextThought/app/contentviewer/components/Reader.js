export default Ext.define('NextThought.app.contentviewer.components.Reader', {
	extend: 'NextThought.app.contentviewer.components.Base',
	alias: 'widget.reader-content',

	//region Config
	requires: [
		'NextThought.proxy.JSONP',
		'NextThought.common.components.ResourceNotFound',
		'NextThought.app.contentviewer.components.PageWidgets',
		'NextThought.app.contentviewer.reader.Content',
		'NextThought.app.contentviewer.reader.IFrame',
		'NextThought.app.contentviewer.reader.Location',
		'NextThought.app.contentviewer.reader.Scroll',
		'NextThought.app.contentviewer.reader.ResourceManagement',
		'NextThought.app.contentviewer.reader.ComponentOverlay',
		'NextThought.app.contentviewer.reader.Assessment',
		'NextThought.app.contentviewer.reader.Annotations',
		'NextThought.app.contentviewer.reader.NoteOverlay'
	],

	mixins: {
		instanceTracking: 'NextThought.mixins.InstanceTracking',
		moduleContainer: 'NextThought.mixins.ModuleContainer'
	},

	cls: 'x-reader-pane scrollable',

	overflowX: 'hidden',
	overflowY: 'visible',
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

		this.on({
			scope: this,
			navigateAbort: 'onNavigationAborted'
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


	hidePageWidgets: function() {
		if (!this.rendered) {
			this.on('afterrender', this.hidePageWidgets.bind(this));
			return;
		}

		this.pageWidgets.hide();
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
			target = this.maskTarget = this.el.parent('.content-viewer');
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
				//since the body is scrolling now get its scroll top
				scrollPosition = Ext.getBody().getScroll().top;

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
			scrollTop: scrollPosition, //dynamic
			rect: this.el && this.el.dom && this.el.dom.getBoundingClientRect()
		};
	},
	//endregion


	//region Event Handlers
	onContextMenuHandler: function() {
		var o = this.getAnnotations();
		return o.onContextMenuHandler.apply(o, arguments);
	},


	onceReadyForSearch: function() {
		return this.getIframe().onceSettled();
	},


	goToFragment: function(fragment) {
		var me = this;

		if (fragment) {
			me.getIframe().onceSettled()
				.then(function() {
					me.getScroll().toTarget(fragment);
				});
		}
	},


	setPageInfo: function(pageInfo, bundle, fragment) {
		if (!this.rendered) {
			this.on('afterrender', this.setPageInfo.bind(this, pageInfo, bundle, fragment));
			return;
		}

		if (!this.iframeReady) {
			this.getIframe().on('iframe-ready', this.setPageInfo.bind(this, pageInfo, bundle, fragment), this, {single: true});
			return;
		}

		var me = this,
			maskTarget = this.getContentMaskTarget();

		maskTarget.mask('Loading...', 'navigation');

		return this.setLocation(pageInfo, bundle)
			.then(me.loadPageInfo.bind(me, pageInfo))
			.then(me.fireEvent.bind(me, 'navigateComplete'))
			.fail(me.fireEvent.bind(me, 'navigateAbort'))
			.always(function() {
				maskTarget.unmask();
				me.splash.removeCls('initial');

				me.isReadyForSearch = true;
				me.fireEvent('ready-for-search');
				me.fireEvent('sync-overlays');

				me.getIframe().onceSettled()
					.then(function() {
						var el;

						if (fragment === 'feedback') {
							el = me.getAssessment().getFeedbackContentEl();

							if (el) {
								me.getScroll().toNode(el);
							}
						} else if (fragment) {
							me.getScroll().toTarget(fragment);
						}

						me.fireEvent('sync-overlays');
					});
			});
	},


	allowNavigation: function() {
		var note = this.getNoteOverlay(),
			assessment = this.getAssessment();

		return note.allowNavigation()
			.then(assessment.allowNavigation.bind(assessment));
	},


	beforeRouteChange: function() {
		var assessment = this.getAssessment();

		return assessment.beforeRouteChange();
	},


	onNavigationAborted: function(resp, ntiid) {
		this.splash.removeCls('initial');
	},


	isAssignment: function() {
		return this.getAssessment().isAssignment();
	},


	loadPageInfo: function(pageInfo) {
		var me = this,
			proxy = ContentProxy;

		return new Promise(function(fulfill, reject) {
			function success(resp) {
				me.getContent().setContent(resp, pageInfo.get('AssessmentItems'), fulfill);
				me.splash.hide();
			}

			function failure(r) {
				console.error('Failed to load pageInfo content', r.status, r.responseText);
				me.splash.show();
				reject();
			}

			//if we already have the page info's contents no need to actually request it
			//so fake it out
			if (!Ext.isEmpty(pageInfo.get('content'))) {
				proxy = me.self.MOCK_PAGE_PROXY;
			}

			proxy.request({
				pageInfo: pageInfo,
				ntiid: pageInfo.getId(),
				jsonpUrl: pageInfo.getLink('jsonp_content'),
				url: pageInfo.getLink('content'),
				expectedContentType: 'text/html',
				scope: me,
				success: success,
				failure: failure
			});
		});
	},

	//endregion


	//region Statics
	statics: {
		get: function(prefix) {
			var instances = this.instances;

			if (prefix) {
				instances.filter(function(r) {
					return r.prefix === prefix;
				});
			}

			return instances[0];
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
	//TODO: can we get rid of this?
	ContentAPIRegistry.register('togglehint', function(e) {
		e = Ext.EventObject.setEvent(e || event);
		Ext.get(e.getTarget().nextSibling).toggleCls('hidden');
		return false;
	});


});
