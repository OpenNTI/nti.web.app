Ext.define('NextThought.view.courseware.dashboard.AbstractView', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.Header'
	],

	COLUMNS: 3,
	width: 1024,

	ui: 'course',
	cls: 'course-dashboard-container scrollable',
	layout: 'none',

	items: [
		{xtype: 'dashboard-header'}
	],


	initComponent: function() {
		this.callParent(arguments);

		var i, columns = this.COLUMNS,
			columnWidth = (this.width - 17) / columns;

		this.COLUMN_MAP = {};

		for (i = 0; i < columns; i++) {
			this.COLUMN_MAP[i] = this.add({
				xtype: 'container',
				cls: 'dashboard-column',
				width: columnWidth,
				layout: 'none',
				column: i
			});
		}

		this.header = this.down('dashboard-header');
	},


	getSortFn: function() {
		return function(a, b) {
			var wA = a.weight || 0,
				wB = b.weight || 0;

			return wA < wB ? 1 : wA === wB ? 0 : -1;
		};
	},


	/**
	 * Add a component to a column at an index
	 * @param {Number} index column to add to
	 * @param {Component} cmp   component to add
	 */
	addToColumn: function(index, cmp) {
		var column = this.COLUMN_MAP[index];

		if (column) {
			column.add(cmp);
		} else {
			console.error('No column for index:', index);
		}
	},


	/**
	 * Add an array of tile components
	 * @param {Array} tiles components to add
	 */
	setTiles: function(tiles) {
		//sort the tiles so the most important tiles are on top
		tiles.sort(this.getSortFn());

		var i, columns = this.COLUMNS,
			length = tiles.length;

		//add tiles to columns from left to right
		for (i = 0; i < length; i++) {
			this.addToColumn(i % columns, tiles[i]);
		}

		this.hasTiles = tiles.length > 0;
		this.tiles = tiles;
	},


	clearTiles: function() {
		var i, columns = this.COLUMNS;

		for (i = 0; i < columns; i++) {
			this.COLUMN_MAP[i].removeAll(true);
		}

		this.hasTiles = false;
	}
});
