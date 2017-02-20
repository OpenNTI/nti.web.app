var Ext = require('extjs');
var TilesHeader = require('./tiles/Header');
var {naturalSortComparator} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.AbstractView', {
	extend: 'Ext.container.Container',
	COLUMN_PADDING: 10,
	COLUMN_COUNT: 3,
	width: 1024 - 17,

	//17 to account for potential scrollbars

	ui: 'course',

	cls: 'course-dashboard-container scrollable',
	layout: 'none',

	items: [
		{xtype: 'dashboard-header'},
		{
			xtype: 'container',
			layout: 'none',
			tileContainer: true,
			cls: 'dashboard-tiles'
		}
	],

	initComponent: function () {
		this.callParent(arguments);

		var i;

		this.COLUMN_MAP = {};

		this.header = this.down('dashboard-header');


		for (i = 0; i < this.COLUMN_COUNT; i++) {
			this.COLUMN_MAP[i] = this.add({
				xtype: 'container',
				layout: 'none',
				tileContainer: true,
				cls: 'dashboard-column'
			});
		}
	},

	getSortFn: function () {
		return function (a, b) {
			var wA = a.weight || 0,
				wB = b.weight || 0;

			return wA < wB ? 1 : wA === wB ? naturalSortComparator((a.record.get('title') || '').toUpperCase(), (b.record.get('title') || '').toUpperCase()) : -1;
		};
	},

	addToColumn: function (index, cmp) {
		var column = this.COLUMN_MAP[index];

		if (column) {
			if (column.items.getCount() === 0) {
				column.setWidth(cmp.width);
			}

			column.add(cmp);
		} else {
			console.error('No column for index', index);
		}
	},

	/**
	 * Fit the tiles in to columns and try to get the columns height to be as
	 * close to the same as possible. Set the top and left for the tiles,
	 * the cmps need to have width and height on them.
	 *
	 * See http://stackoverflow.com/a/7128902
	 *
	 * @param {Array} tiles list of cmp configs to set top and left on
	 * @return {Array}			the list with top and left set on them
	 */
	fitTiles: function (tiles) {
		//if we don't have any tiles there's no need to do anything
		if (Ext.isEmpty(tiles)) { return []; }

		tiles.sort(this.getSortFn());

		var me = this,
			padding = me.COLUMN_PADDING,
			colHeights = [], i;

		function getShortestCol () {
			var j, minIndex, minHeight = Infinity;

			for (j = 0; j < colHeights.length; j++) {
				if (colHeights[j] < minHeight) {
					minHeight = colHeights[j];
					minIndex = j;
				}
			}

			return minIndex;
		}

		for (i = 0; i < me.COLUMN_COUNT; i++) {
			colHeights.push(padding);
		}

		tiles.forEach(function (tile) {
			var index = getShortestCol();

			tile.CACHE = tile.CACHE || {};
			tile.column = index;
			tile.navigateToObject = me.navigateToObject.bind(this);

			me.addToColumn(index, tile);

			colHeights[index] = colHeights[index] + tile.baseHeight + padding;
		});

		return tiles;
	},

	/**
	 * Add the tiles back, use the previous configs so the layout doesn't change any
	 */
	addTilesBack: function () {
		var i, me = this;

		for (i = 0; i < me.COLUMN_COUNT; i++) {
			me.COLUMN_MAP[i].removeAll(true);
		}

		me.tiles.forEach(function (tile) {
			me.addToColumn(tile.column, tile);
		});
	},

	/**
	 * Add an array of tile components
	 */
	setTiles: function (tiles) {
		this.tiles = this.fitTiles(tiles);

		this.addTilesBack();
	},

	clearTiles: function () {
		var i;

		for (i = 0; i < this.COLUMN_COUNT; i++) {
			this.COLUMN_MAP[i].removeAll(true);
		}

		this.hasTiles = false;
	}
});
