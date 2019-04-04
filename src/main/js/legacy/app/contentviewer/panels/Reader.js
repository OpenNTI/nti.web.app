const Ext = require('@nti/extjs');

const AnalyticsUtil = require('legacy/util/Analytics');
const FlatPage = require('legacy/store/FlatPage');
const QuestionSet = require('legacy/model/assessment/QuestionSet');

const UserdataActions = require('../../userdata/Actions');
const ContextStateStore = require('../../context/StateStore');
const WindowsActions = require('../../windows/Actions');

require('legacy/common/components/NavPanel');
require('../../annotations/Index');
require('../components/Reader');
require('../navigation/Content');
require('../notepad/View');


module.exports = exports = Ext.define('NextThought.app.contentviewer.panels.Reader', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.reader',
	prefix: 'default',
	ui: 'reader',
	cls: 'reader-container',
	layout: 'none',
	scrollTargetSelector: '.x-panel-body-reader',
	secondaryElSelector: '.x-panel-notes-and-discussion',

	navigation: {
		height: 'auto',
		xtype: 'tabpanel',
		ui: 'notes-and-discussion',
		layout: 'none',
		tabBar: {
			plain: true,
			baseCls: 'nti',
			ui: 'notes-and-discussion-tabbar',
			cls: 'notes-and-discussion-tabs',
			defaults: {plain: true, ui: 'notes-and-discussion-tab'}
		},
		defaults: {
			border: false,
			plain: true
		},
		stateId: 'notes-and-discussions',
		items: []
	},

	body: {xtype: 'container', cls: 'center', layout: 'none', width: 766},

	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		me.UserDataActions = UserdataActions.create();
		me.WindowActions = WindowsActions.create();
		me.ContextStore = ContextStateStore.getInstance();
		me.showReader();

		me.on({
			'beforedeactivate': me.beforeDeactivate.bind(me),
			'activate': me.onActivate.bind(me),
			'deactivate': me.onDeactivate.bind(me),
			'destroy': function () {
				Ext.EventManager.removeResizeListener(me.onWindowResize, me);
			}
		});

	},

	onActivate: function () {
		Ext.EventManager.onWindowResize(this.onWindowResize, this);
		this.alignNavigation();
	},

	onDeactivate: function () {
		this.endViewedAnalytics();
		Ext.EventManager.removeResizeListener(this.onWindowResize, this);
	},

	/*
	 * Handles resize event on the reader
	 *
	 * NOTE: Since most video APIs do not provide events for when the browser goes into fullscreen mode,
	 * we are caching the lastScroll zone before we're in fullscreen mode. And when they exist fullscreen mode,
	 * it will fire a resize event. When the resize event is fired, we go ahead and scroll to the last scroll position.
	 *
	 */
	onWindowResize: function () {
		if (this.navigation && this.navigation.setWidth) {
			this.navigation.setWidth('100%');
			this.alignNavigation();
		}


		var r = this.body.down('reader-content'),
			readerScroll = r && r.getScroll && r.getScroll(),
			isInFullScreenMode = readerScroll && readerScroll.isInFullScreenMode && readerScroll.isInFullScreenMode();

		if (r && r.scrollBeforeFullscreen !== undefined && !isInFullScreenMode) {
			readerScroll.to(r.scrollBeforeFullscreen);
			delete r.scrollBeforeFullscreen;
		}
	},


	getToolbarAndReaderConfig () {
		return [
			this.getToolbarConfig(),
			this.getReaderConfig()
		];
	},


	applyReaderConfigs (config) {
		this.navigation.removeAll(true);
		this.body.removeAll(true);

		const [toolbarConfig, readerConfig] = config;
		let readerContent;

		this.flatPageStore = this.flatPageStore || FlatPage.create({ storeId: 'FlatPage-' + this.id });
		this.UserDataActions.initPageStores(this);

		toolbarConfig.isReaderToolBar = true;
		toolbarConfig.contentOnly = this.contentOnly;

		readerConfig.doNotAssumeBodyScrollParent = this.doNotAssumeBodyScrollParent;

		this.body.add([
			toolbarConfig,
			readerConfig
		]);

		if (this.contentOnly) {
			this.navigation.hide();
		} else {
			this.navigation.setActiveTab(this.navigation.add(
				{
					title: 'Discussion',
					iconCls: 'discuss',
					xtype: 'annotation-view',
					discussion: true,
					store: this.flatPageStore,
					showNote: this.showNote.bind(this)
				}
			));
		}


		const annotationView = this.down('annotation-view');
		readerContent = this.getReaderContent();

		this.mon(this.flatPageStore, 'bookmark-loaded', function (r) {
			readerContent.pageWidgets.onBookmark(r);
		});

		Ext.destroy(this.readerMons);

		if (readerContent) {
			this.readerMons = this.mon(readerContent, {
				'destroyable': true,
				'filter-by-line': 'selectDiscussion',
				'assignment-submitted': this.fireEvent.bind(this, 'assignment-submitted'),
				'assessment-graded': this.fireEvent.bind(this, 'assessment-graded'),
				'sync-height': this.alignNavigation.bind(this),
				'refresh-reader': this.showReader.bind(this)
			});

			if (annotationView) {
				annotationView.anchorComponent = readerContent;
			}
		}

		this.pageInfoOverride = readerConfig.pageInfo;

		if (this.rendered && readerConfig.pageInfo) {
			this.setPageInfo(readerConfig.pageInfo, this.bundle);
		} else if (this.rendered && this.pageInfo) {
			this.setPageInfo(this.pageInfo, this.bundle);
		}

		this.fireEvent('reader-set');

	},

	showReader: function () {
		this.navigation.removeAll(true);
		this.body.removeAll(true);

		const config = this.getToolbarAndReaderConfig();

		if (config instanceof Promise) {
			return config.then(c => this.applyReaderConfigs(c));
		}

		return Promise.resolve(this.applyReaderConfigs(config));
	},

	alignNavigation: function () {
		var header = this.getToolbar();

		if (header && header.alignTimer) {
			header.alignTimer();
		}

		this.callParent(arguments);
	},

	afterRender: function () {
		this.callParent(arguments);

		var center = this.el.down('.center'),
			height = Ext.Element.getViewportHeight();

		if (this.pageInfo || this.pageInfoOverride) {
			this.setPageInfo(this.pageInfoOverride || this.pageInfo, this.bundle);
		} else {
			console.error('No Page Info set on the reader. Everyone PANIC!!!!!!');
		}

		center.setStyle({
			'min-height': this.contentOnly ?
				'calc(10vh + 10rem)' :
				`${height - 72}px`
		});
	},

	getToolbarConfig: function () {
		return {
			xtype: 'content-toolbar',
			bundle: this.bundle,
			path: this.path,
			pageSource: this.pageSource,
			hideControls: this.pageInfo.hideControls,
			toc: this.toc,
			showToc: this.showToc,
			contentPackage: this.contentPackage,
			rootId: this.rootId,
			currentPage: this.currentPage,
			hideHeader: this.hideHeader,
			rootRoute: this.rootRoute,
			doNavigation: (title, route, precache) => { return this.doNavigation(title, route, precache); }
		};
	},

	getReaderConfig: function () {
		return {
			xtype: 'reader-content',
			prefix: this.prefix,
			beforeSubmit: this.beforeSubmit,
			afterSubmit: this.afterSubmit,
			flex: 1
		};
	},

	onceReadyForSearch: function () {
		var reader = this.getReaderContent();

		return reader.onceReadyForSearch();
	},

	showSearchHit: function (hit, fragment) {
		var reader = this.getReaderContent(),
			scroll = reader && reader.getScroll();

		if (scroll) {
			scroll.toSearchHit(hit, fragment);
		}
	},

	showRemainingTime: function (...args) {
		var header = this.getToolbar();

		if (this.showRemainingTimeOverride) {
			this.showRemainingTimeOverride(...args);
		} else if (header && header.showRemainingTime) {
			header.showRemainingTime.apply(header, arguments);
		}
	},

	showHeaderToast: function () {
		var header = this.getToolbar();

		if (header && header.showToast) {
			return header.showToast.apply(header, arguments);
		}
	},

	getToolbar: function () {
		return this.down('[isReaderToolBar]');
	},

	getReaderContent: function () {
		return this.down('reader-content');
	},

	getLocation: function () {
		var reader = this.getReaderContent();

		return reader && reader.getLocation();
	},

	setPageInfo: function (pageInfo, bundle) {
		var reader = this.getReaderContent(),
			toolbar = this.getToolbar();

		if (toolbar && toolbar.setPageInfo) {
			toolbar.setPageInfo(pageInfo, bundle);
		}

		//the reader might not be defined if we are in a timed assignment
		if (reader) {
			reader.setPageInfo(pageInfo, bundle, this.fragment, this.note);
		}

		this.onceReadyForSearch()
			.then(this.beginViewedAnalytics.bind(this));
	},

	goToFragment: function (fragment) {
		var reader = this.getReaderContent();

		this.fragment = fragment;

		if (reader) {
			reader.goToFragment(fragment);
		}
	},

	goToNote: function (note) {
		var reader = this.getReaderContent();

		this.note = note;
		if (reader) {
			reader.goToNote(note);
		}
	},

	beforeDeactivate: function () {
		var reader = this.down('reader-content');
		return !reader || reader.getNoteOverlay().onNavigation();
	},

	selectDiscussion: function () {
		this.down('tabpanel[ui=notes-and-discussion]').setActiveTab(
			this.down('annotation-view[discussion]'));
	},

	/**
	 * Return true if the reader should allow itself to be close
	 * false should attempt to stop the navigation if it can
	 * @param {Boolean} forced forced?
	 * @return {Promise} fulfills once it can navigate, or rejects if it needs to stop
	 */
	allowNavigation: function (forced) {
		var reader = this.getReaderContent();

		return !reader || reader.allowNavigation(forced);
	},

	beforeRouteChange: function () {
		var reader = this.getReaderContent();

		return reader && reader.beforeRouteChange();
	},

	doNavigation: function (title, route, precache) {
		this.handleNavigation(title, route, precache);
	},

	showNote: function (record, el, monitors) {
		this.WindowActions.pushWindow(record, null, el, monitors);
	},

	getQuestionSet: function () {
		var assessmentItems = this.pageInfo.get('AssessmentItems'),
			i, item;

		assessmentItems = assessmentItems || [];

		for (i = 0; i < assessmentItems.length; i++) {
			item = assessmentItems[i];

			if (item && item instanceof QuestionSet) {
				return item;
			}
		}

		return null;
	},

	getAnalyticData: function () {
		var questionSet = this.getQuestionSet(),
			data = {};

		if (questionSet) {
			data = {
				type: questionSet.isSurvey ? 'SurveyView' : 'AssessmentView',
				resourceId: questionSet.getId(),
				ContentID: this.pageInfo.getId(),
			};
		} else {
			data = {
				type: 'ResourceView',
				resourceId: this.pageInfo.getId()
			};
		}

		return data;
	},

	beginViewedAnalytics: function () {
		//if the page info opts out of analytics don't send any
		if (this.pageInfo.doNotSendAnalytics) { return; }

		var data = this.getAnalyticData();
		//if we don't have a resource id for some reason, we can't send a valid event
		if (!data.resourceId) { return; }

		//if we are trying to start an event for the one we already have going
		if (this.__lastAnalyticEvent && this.__lastAnalyticEvent.resourceId === data.resourceId) {
			return;
		}

		if (this.__lastAnalyticEvent) {
			console.warn('Overwriting event %o with %o', this.___lastAnalyticEvent, data);
		}

		this.__lastAnalyticEvent = data;

		AnalyticsUtil.startEvent(data.resourceId, data);
	},

	endViewedAnalytics: function () {
		var data = this.__lastAnalyticEvent;

		if (!data) { return; }

		AnalyticsUtil.stopEvent(data.resourceId, data.type, data);
	}
});
