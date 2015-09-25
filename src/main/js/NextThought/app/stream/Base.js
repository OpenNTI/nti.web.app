/**
 * Given a stream source, render the pages one at a time as you scroll, removing and adding them from the dom
 * as they get scrolled into and out of view.
 *
 * The stream source is an interface that implements the following methods
 * 		loadPage(Interger, [1, Infinity)) load a specific page and reset the current to this page so load next will work from here
 * 		it can fire an event 'reset' to trigger to scroll to the top and start from page 1
 *
 * Monitors can be added by the container for beforePageLoad, and afterPageLoad
 */

export default Ext.define('NextThought.app.stream.Base', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.app.stream.components.ListPage'
	],

	layout: 'none',
	cls: 'stream',

	/**
	 * The text to display when its empty
	 * @override
	 * @type {String}
	 */
	emptyText: '',

	onClassExtended: function(cls, data) {
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		this.scrollTarget = Ext.getBody().dom;
		this.PAGES = [];
	},


	afterRender: function() {
		this.callParent(arguments);

		this.doInitialLoad();
	},


	addLoadingCmp: function() {
		if (!this.loadignCmp) {
			this.loadingCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'loading-container item', cn: {cls: 'loading', html: 'Loading...'}}
			});
		}
	},


	removeLoadingCmp: function() {
		if (this.loadingCmp) {
			this.remove(this.loadingCmp, true);
			delete this.loadingCmp;
		}
	},


	doInitialLoad: function() {
		var height = document.documentElement.clientHeight,
			scrollHeight = this.scrollTarget.scrollHeight;

		if (height > 0 && scrollHeight > height) {
			return Promise.resolve();
		}

		//recursively call doInitial load until the scroll height is greater than the dom height
		//should hopefully only take 1
		return this.loadNextPage()
			.then(this.doInitialLoad.bind(this));
	},


	loadNextPage: function() {
		var me = this;

		me.addLoadingCmp();

		return me.StreamSource.loadNextPage()
			.then(me.addPage.bind(me))
			.fail(function(reason) {
				//On error if the reason is DONE then show the end of the stream
				if (reason === me.StreamSource.DONE) {
					me.addDone();
				//else show an error
				} else {
					console.error(reason);
					me.addError();
				}

				//either way prevent loadNextPage from being called again
				me.loadNextPage = function() { return Promise.resolve(); };
			})
			.always(me.removeLoadingCmp.bind(me));
	},

	/**
	 * @override
	 * @param  {[Object]} items the items to put in the page
	 * @return {[type]}       [description]
	 */
	getPageConfig: function(items) {},


	addPage: function(items) {
		var page = this.getPageConfig();

		page.streamItems = items;
		page.tileOverrides = this.tileOverrides;

		this.PAGES.push(this.add(page));
	},


	addDone: function() {
		console.log('End of stream');
	},


	addError: function() {
		if (!this.errorCmp) {
			this.errorCmp = this.add({
				xtype: 'box',
				cls: 'error-container item',
				autoEl: {html: 'Error: Unable to load more data.'}
			});
		}
	}
});
