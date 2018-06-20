const Ext = require('@nti/extjs');
const {encodeForURI} = require('@nti/lib-ntiids');

const HASH_REGEX = /#/;

function findPageNode (node) {
	if (!node || node.tag === 'toc') {
		return node;
	}

	const href = node && node.getAttribute('href');

	if (HASH_REGEX.test(href)) {
		return findPageNode(node.parentNode);
	}

	return node;
}


function getRouteForNode (node) {
	const href = node.getAttribute('href');
	const page = findPageNode(node);

	let pageId = page && page.getAttribute('ntiid');

	pageId = pageId && encodeForURI(pageId);

	if (node !== page && HASH_REGEX.test(href)) {
		pageId += `#${href.split('#')[1]}`;
	}

	return {
		title: node.getAttribute('title'),
		href: pageId
	};
}

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
		const node = pageID && this.toc.querySelector(`[ntiid="${pageID}"]`);
		const route = node && getRouteForNode(node);

		if (!route) { return {title: '', href: ''}; }

		return route;
	}
});
