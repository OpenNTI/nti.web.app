var Ext = require('extjs');
var Globals = require('../../util/Globals');
var ParseUtils = require('../../util/Parsing');
var CommonStateStore = require('../../common/StateStore');
const { decodeFromURI } = require('nti-lib-ntiids');

module.exports = exports = Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function (context, title, route) {
		this.current_context = context;

		this.ROUTE_PARTS = Globals.getURLParts(route);

		this.current_title = title;
		this.current_route = route;

		this.fireEvent('new-context');
	},


	setCurrentTitle: function (title) {
		this.current_title = title;
	},


	getContext: function () {
		return this.current_context || [];
	},


	getRootContext: function () {
		return this.current_context[this.current_context.length - 1];
	},


	getRootBundle: function () {
		var context = this.current_context || [],
			i, x;

		for (i = 0; i < context.length; i++) {
			x = context[i];

			if (x.obj && x.obj.isBundle) {
				return x.obj;
			}
		}
	},


	getRootProfile: function () {
		var context = this.current_context || [],
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

		if (cmp && cmp instanceof NextThought.app.content.content.Index && cmp.hasReader()) {
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
		return this.current_title;
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
			parts = {};

		if (ParseUtils.isEncodedNTIID(first)) {
			parts.id = decodeFromURI(first);
			parts.rawId = first;
			parts.state = decodeURIComponent(last);
		} else if (ParseUtils.isEncodedNTIID(last)) {
			parts.id = decodeFromURI(last);
			parts.rawId = last;
			parts.mimeType = decodeURIComponent(first);
		}

		return parts;
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
