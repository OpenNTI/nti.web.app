const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.container.Viewport', {
	override: 'Ext.container.Viewport',

	setSize: function () {},

	onRender: function () {
		Ext.container.Container.prototype.onRender.apply(this, arguments);
	}
});