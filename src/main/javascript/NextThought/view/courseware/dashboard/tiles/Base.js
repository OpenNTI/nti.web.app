Ext.define('NextThought.view.courseware.dashboard.tiles.Base', {
	extend: 'Ext.Component',

	cls: 'tile',

	rows: 2,
	cols: 2,

	weight: 1,

	getWeight: function() { return this.weight; }
});
