var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');


module.exports = exports = Ext.define('NextThought.app.course.StateStore', {
	extend: 'NextThought.common.StateStore',

	constructor: function () {
		this.ROUTES = {};

		this.callParent(arguments);
	},


	markRouteFor: function (id, route) {
		this.ROUTES[id] = route;
	},


	getRouteFor: function (id) {
		return this.ROUTES[id];
	}
});
