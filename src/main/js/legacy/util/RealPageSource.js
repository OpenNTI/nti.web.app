const Ext = require('@nti/extjs');
const {encodeForURI} = require('@nti/lib-ntiids');

const HASH_REGEX = /#/;

module.exports = exports = Ext.define('NextThought.util.RealPageSource', {
	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor (config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this);

		this.toc = config.toc;
		this.realPageIndex = config.realPageIndex;
		this.page = config.page;
		this.pages = config.pages;
		this.next = config.next;
		this.nextTitle = config.nextTitle;
		this.previous = config.previous;
		this.previousTitle = config.previousTitle;

		if (config.getRoute) {
			this.getRoute = config.getRoute;
		}
	},


	getPageNumber () {
		return this.page;
	},


	getTotal () {
		return this.pages[this.pages.length - 1];
	},


	getAllPages () {
		return this.pages;
	},


	hasNext () {
		return !!this.next;
	},


	hasPrevious () {
		return !!this.previous;
	},


	getNext () {
		return this.getRoute ? this.getRoute(this.next) : this.next;
	},


	getPrevious () {
		return this.getRoute ? this.getRoute(this.previous) : this.previous;
	},


	getNextTitle () {
		return this.nextTitle;
	},


	getPreviousTitle () {
		return this.previousTitle;
	},


	getNextPrecache () {},
	getPreviousPrecache () {},


	getRouteForPage (page) {
		const pageID = this.realPageIndex && this.realPageIndex['real-pages'][page];
		const parts = pageID.split('#');

		parts[0] = encodeForURI(parts[0]);

		return {title: '', href: parts.join('#')};
	}
});
