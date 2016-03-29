var Ext = require('extjs');
var MixinsScrolling = require('../../mixins/Scrolling');
var UtilStreamSource = require('./util/StreamSource');


/**
 * Given a stream source, render the pages one at a time as you scroll, removing and adding them from the dom
 * as they get scrolled into and out of view.
 *
 * The stream source is an interface that implements the following methods
 *		getCurrentBatch: fulfills with the current batch
 *		getNextBatch: fulfills with the next batch
 *		getPreviousBatch: fulfills with the previous batch
 *
 * Monitors can be added by the container for beforePageLoad, and afterPageLoad
 *
 * @class  NextThought.app.stream.Base
 * @author andrew.ligon@nextthought.com (Andrew Ligon)
 */
module.exports = exports = Ext.define('NextThought.app.stream.Base', {
	extend: 'Ext.container.Container',

	mixins: {
		Scrolling: 'NextThought.mixins.Scrolling'
	},

	layout: 'none',
	cls: 'stream',
	items: [],

	/**
	 * Contains a map of a mimeType to a component to show for it
	 * @type {Object}
	 */
	MIME_TO_COMPONENTS: {},

	clearOnDeactivate: false,
	pageOnScroll: true,

	/**
	 * The text to display when its empty
	 * @override
	 * @type {String}
	 */
	emptyText: '',

	/**
	 * The text to display when there is an error
	 * @override
	 * @type {String}
	 */
	errorText: 'Error: Unable to load more data.',

	/**
	 * The text to display at the bottom of the list
	 * @override
	 * @type {String}
	 */
	doneText: '',

	onClassExtended: function (cls, data) {
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}
	},

	initComponent: function () {
		this.callParent(arguments);

		this.initScrolling();

		this.on({
			'activate': this.onActivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});

		this.PAGES = [];

		this.onScroll = this.onScroll.bind(this);
		this.prefetchNext = Ext.Function.createBuffered(this.loadNextPage, 500);

		this.fillInMimeTypes(this.tiles || []);
	},

	fillInMimeTypes: function (cmps) {
		this.MIME_TO_COMPONENTS = cmps.reduce(function (acc, cmp) {
			var mimeType = cmp.mimeType;

			if (!Array.isArray(mimeType)) {
				mimeType = [mimeType];
			}

			mimeType.forEach(function (mime) {
				if (mime) {
					acc[mime] = cmp;
				}
			});

			return acc;
		}, {});
	},

	getGroupContainer: function () {
		return this;
	},

	setStreamSource: function (source) {
		this.clearPages();
		this.StreamSource = source;

		if (source) {
			this.removeEmpty();
			this.showLoading();
			this.StreamSource.getCurrentBatch()
				.then(this.loadBatch.bind(this))
				.then(this.maybeLoadMoreItems.bind(this))
				.fail(this.showError.bind(this))
				.always(this.removeLoading.bind(this));
		} else {
			this.onEmpty();
		}
	},

	setStreamParams: function (params) {
		params.url = params.url || this.StreamSource.getURL();

		this.setStreamSource(new NextThought.app.stream.util.StreamSource(params));
	},

	onActivate: function () {
		//if we might have cleared on deactivate or haven't loaded any pages yet
		if (this.clearOnDeactivate || this.PAGES.length === 0) {
			this.setStreamSource(this.StreamSource);
		}

		if (this.pageOnScroll) {
			this.setUpScrollListener();
		}
	},

	onDeactivate: function () {
		if (this.clearOnDeactivate) {
			this.clearPages();
		}

		if (this.pageOnScroll) {
			this.removeScrollListener();
		}
	},

	setUpScrollListener: function () {
		window.addEventListener('scroll', this.onScroll);
	},

	removeScrollListener: function () {
		window.removeEventListener('scroll', this.onScroll);
	},

	clearPages: function () {
		this.PAGES.forEach(function (page) {
			page.destroy();
		});

		this.PAGES = [];

		delete this.isOnLastBatch;
	},

	loadBatch: function (batch) {
		if (batch.isFirst && !batch.Items.length) {
			this.onEmpty();
		} else {
			this.removeEmpty();
			this.fillInItems(batch.Items);
		}

		if (batch.isLast) {
			this.onDone();
			this.isOnLastBatch = true;
		}
	},

	fillInItems: function (items) {},

	maybeLoadMoreItems: function (batch) {
		var height = this.getPageHeight(),
			scrollHeight = this.getPageScrollHeight();

		if (height <= 0 || scrollHeight < height) {
			this.loadNextPage();
		}
	},

	loadNextPage: function () {
		if (!this.isOnLastBatch && !this.isLoading) {
			this.showLoading();
			this.StreamSource.getNextBatch()
				.then(this.loadBatch.bind(this))
				.then(this.maybeLoadMoreItems.bind(this))
				.fail(this.showError.bind(this))
				.always(this.removeLoading.bind(this));
		}
	},

	showLoading: function () {
		var cmp = this.getGroupContainer();

		this.isLoading = true;

		if (!this.loadingCmp) {
			this.loadingCmp = cmp.add({
				xtype: 'box',
				autoEl: {cls: 'item loading', cn: [
					{cls: 'container-loading-mask', cn: [
						{cls: 'load-text', html: 'Loading...'}
					]}
				]}
			});
		}
	},

	removeLoading: function () {
		var cmp = this.getGroupContainer();

		this.isLoading = null;

		if (this.loadingCmp) {
			cmp.remove(this.loadingCmp, true);
			delete this.loadingCmp;
		}
	},

	showError: function () {
		var cmp = this.getGroupContainer();

		if (!this.errorCmp) {
			this.errorCmp = cmp.add({
				xtype: 'box',
				autoEl: {cls: 'item error', cn: [
					{cls: 'container-error', cn: [
						{cls: 'error-text', html: this.errorText}
					]}
				]}
			});
		}
	},

	onEmpty: function () {
		var cmp = this.getGroupContainer();

		if (!this.emptyCmp && this.emptyText) {
			this.emptyCmp = cmp.add({
				xtype: 'box',
				autoEl: {cls: 'item empty', cn: [
					{cls: 'container-empty', cn: [
						{cls: 'empty-text', html: this.emptyText}
					]}
				]}
			});
		}
	},

	removeEmpty: function () {
		var cmp = this.getGroupContainer();

		if (this.emptyCmp) {
			cmp.remove(this.emptyCmp, true);
			delete this.emptyCmp;
		}
	},

	onDone: function () {
		var cmp = this.getGroupContainer();

		if (!this.doneCmp && this.doneText) {
			this.doneCmp = cmp.add({
				xtype: 'box',
				autoEl: {cls: 'item done', cn: [
					{cls: 'container-done', cn: [
						{cls: 'done-text', html: this.doneText}
					]}
				]}
			});
		}
	},

	onScroll: function () {
		if (this.isOnLastBatch) { return; }

		var body = this.getPageScrollingEl(),
			height = this.getPageHeight(),
			scrollHeight = this.getPageScrollHeight(),
			top = body.scrollTop,
			scrollTopMax = scrollHeight - height,
			//trigger when the top goes over a limit value
			//That limit value is defined by the max scrollTop can be, minus a buffer zone. (defined here as 10% of the viewable area)
			triggetZone = scrollTopMax - Math.floor(height * 0.1),
			wantedDirection = (this.lastScroll || 0) < top;

		this.lastScroll = top;

		if (wantedDirection && top > triggetZone) {
			this.prefetchNext();
		}
	}
});
