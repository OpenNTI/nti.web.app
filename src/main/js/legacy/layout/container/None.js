const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.layout.container.None', {
	extend: 'Ext.layout.container.Container',
	alias: 'layout.none',
	type: 'none',

	calculate: Ext.emptyFn
});
