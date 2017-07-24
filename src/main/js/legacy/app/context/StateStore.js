const Ext = require('extjs');
const { decodeFromURI } = require('nti-lib-ntiids');

const Globals = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

require('legacy/common/StateStore');

module.exports = exports = Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function (context, title, route) {
		this.currentContext = context;

		this.ROUTE_PARTS = Globals.getURLParts(route);

		this.currentTitle = title;
		this.currentRoute = route;

		this.fireEvent('new-context');
	},


	setCurrentTitle: function (title) {
		this.currentTitle = title;
	},


	getContext: function () {
		return this.currentContext || [];
	},


	getRootContext: function () {
		return this.currentContext[this.currentContext.length - 1];
	},


	getRootBundle: function () {
		var context = this.currentContext || [],
			i, x;

		for (i = 0; i < context.length; i++) {
			x = context[i];

			if (x.obj && x.obj.isBundle) {
				return x.obj;
			}
		}
	},


	getRootProfile: function () {
		var context = this.currentContext || [],
			i, x;

		for (i = 0; i < context.length; i++) {
			x = context[i];

			if (x.obj && x.obj.isProfile) {
				return x.obj;
			}
		}
	},


	getReaderLocation: function () {
		var root = this.getRootContext(),
			cmp = root && root.cmp;

		if (cmp && cmp.isBundleContent && cmp.hasReader()) {
			return cmp.getLocation();
		}

		return null;
	},


	getCurrentRoute: function () {
		return this.ROUTE_PARTS.pathname;
	},


	getCurrentSearch: function () {
		return this.ROUTE_PARTS.search;
	},


	getCurrentHash: function () {
		return this.ROUTE_PARTS.hash;
	},


	getCurrentTitle: function () {
		return this.currentTitle;
	},


	getCurrentObjectId: function () {
		var parts = this.getCurrentObjectParts();

		return parts.id;
	},


	__parseTwoObjectParts: function (parts) {
		return {
			id: decodeFromURI(parts.last()),
			rawId: parts.last()
		};
	},


	__parseThreeObjectParts: function (parts) {
		var first = parts[parts.length - 2],
			last = parts.last(),
			part = {};

		if (lazy.ParseUtils.isEncodedNTIID(first)) {
			part.id = decodeFromURI(first);
			part.rawId = first;
			part.state = decodeURIComponent(last);
		} else if (lazy.ParseUtils.isEncodedNTIID(last)) {
			part.id = decodeFromURI(last);
			part.rawId = last;
			part.mimeType = decodeURIComponent(first);
		}

		return part;
	},


	getCurrentObjectParts: function () {
		var route = Globals.trimRoute(this.getCurrentRoute()),
			parts = route.split('/'),
			objectParts = {};

		if (parts[parts.length - 2] === 'object') {
			objectParts = this.__parseTwoObjectParts(parts);
		} else if (parts[parts.length - 3] === 'object') {
			objectParts = this.__parseThreeObjectParts(parts);
		}

		return objectParts;
	},


	removeObjectRoute: function (path) {
		var route = Globals.trimRoute(path || this.getCurrentRoute()),
			parts = route.split('/');

		if (parts[parts.length - 3] === 'object') {
			parts = parts.slice(0, -3);
		} else if (parts[parts.length - 2] === 'object') {
			parts = parts.slice(0, -2);
		}

		route = parts.join('/');

		return route + (this.getCurrentSearch() || '') + (this.getCurrentHash() || '');
	}
});
