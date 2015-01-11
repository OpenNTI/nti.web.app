Ext.define('NextThought.view.courseware.dashboard.AbstractView', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.Header'
	],

	COLUMN_PADDING: 10,
	COLUMN_COUNT: 3,
	width: 1024 - 17, //17 to account for potential scrollbard

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


	initComponent: function() {
		this.callParent(arguments);

		this.header = this.down('dashboard-header');
		this.tileContainer = this.down('[tileContainer]');
	},


	getSortFn: function() {
		return function(a, b) {
			var wA = a.weight || 0,
				wB = b.weight || 0;

			return wA < wB ? 1 : wA === wB ? 0 : -1;
		};
	},

	/**
	 * Fit the tiles in to columns and try to get the columns height to be as
	 * close to the same as possible. Set the top and left for the tiles,
	 * the cmps need to have width and height on them.
	 *
	 * See http://stackoverflow.com/a/7128902
	 *
	 * @param {Array} tiles	list of cmp configs to set top and left on
	 * @return {Array}			the list with top and left set on them
	 */
	fitTiles: function(tiles) {
		//if we don't have any tiles there's no need to do anything
		if (Ext.isEmpty(tiles)) { return []; }

		tiles.sort(this.getSortFn());

		var padding = this.COLUMN_PADDING,
			colWidth = tiles[0].width,
			colHeights = [], i;

		function getShortestCol() {
			var j, minIndex, minHeight = Infinity;

			for (j = 0; j < colHeights.length; j++) {
				if (colHeights[j] < minHeight) {
					minHeight = colHeights[j];
					minIndex = j;
				}
			}

			return minIndex;
		}

		function getHeight() {
			var j, maxHeight = 0;

			for (j = 0; j < colHeights.length; j++) {
				if (colHeights[j] > maxHeight) {
					maxHeight = colHeights[j];
				}
			}

			return maxHeight;
		}

		function getLeftForColumn(index) {
			return padding + (index * (colWidth + padding));
		}

		for (i = 0; i < this.COLUMN_COUNT; i++) {
			colHeights.push(padding);
		}

		tiles.forEach(function(tile) {
			var index = getShortestCol(),
				top = colHeights[index],
				left = getLeftForColumn(index);

			tile.top = top;
			tile.left = left;
			tile.CACHE = tile.CACHE || {};

			colHeights[index] = top + tile.height + padding;
		});

		this.tileContainer.setHeight(getHeight());

		return tiles;
	},

	/**
	 * Add the tiles back, use the previous configs so the layout doesn't change any
	 */
	addTilesBack: function() {
		this.tileContainer.removeAll(true);
		this.hasTiles = this.tiles.length > 0;
		this.tileContainer.add(this.tiles);
	},


	/**
	 * Add an array of tile components
	 */
	setTiles: function(tiles) {
		this.tiles = this.fitTiles(tiles);

		this.addTilesBack();
	},


	clearTiles: function() {
		this.tileContainer.removeAll(true);
		this.hasTiles = false;
	}
});
