const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const lazy = require('legacy/util/lazy-require')
	.get('DashboardIndex', () => require('../Index'));
require('./AbstractView');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.TileContainer', {
	extend: 'NextThought.app.course.dashboard.components.AbstractView',
	alias: 'widget.dashboard-tile-container',

	cls: 'tile-container',

	initComponent: function () {
		this.callParent(arguments);

		if (this.isUpcoming) {
			this.header.setUpcoming();
		} else {
			this.header.setWeek(this.week);
		}
	},


	afterRender: function () {
		this.callParent(arguments);

		this.reloadTiles();
	},


	reloadTiles: function () {
		var me = this;

		me.addLoadingMask();

		me.lastLoaded = new Date();

		me.loadingTiles = me.loadTiles().then(function (tiles) {
			me.setTiles(tiles);

			if (tiles.length === 0) {
				me.addCls('empty');
				me.hasNoTiles = true;
				me.fireEvent('is-empty', me);
			} else {
				me.removeLoadingMask();
				me.fireEvent('not-empty', me);
			}
		});

		return me.loadingTiles;
	},


	isEmpty: function () {
		return this.hasNoTiles;
	},


	getRangeStart: function () {
		return this.week.start;
	},


	updateRangeStart: function (start) {
		this.week.start = start;

		this.updateRange();
	},


	updateRange: function () {
		this.header.setWeek(this.week);

		this.removeLoadingMask();
	},


	addLoadingMask: function () {
		this.addCls('loading');
		this.header.addLoadingMask();
	},


	removeLoadingMask: function () {
		this.removeCls('loading');
		this.header.removeLoadingMask();
	},


	getPositionInfo: function () {
		if (!this.rendered) {
			return {
				offsetTop: 0,
				offsetHeight: 0
			};
		}

		var dom = this.el.dom,
			rect = dom.getBoundingClientRect();

		return {
			offsetTop: rect.top,
			offsetHeight: rect.width
		};
	},


	parentScrollChanged: function (getState) {
		var state = getState.call(null, this.getPositionInfo()),
			handler;

		if (state === this.currentState || this.isEmpty()) { return; }

		if (state === lazy.DashboardIndex.CURRENT) {
			handler = this.updateCurrent.bind(this);
		} else if (state === lazy.DashboardIndex.OUT_OF_BUFFER) {
			handler = this.removeTilesFromDOM.bind(this);
		} else if (state === lazy.DashboardIndex.IN_BUFFER) {
			handler = this.reloadTilesToDom.bind(this);
		}

		this.currentState = state;

		return handler;
	},


	updateCurrent: function () {
		this.removeCls('in-buffer');
		this.addCls('current');
	},


	removeTilesFromDOM: function () {
		var me = this,
			load = me.loadingTiles;

		if (!load) {
			load = this.hasTiles ? Promise.resolve() : Promise.reject('not loaded');
		}

		me.removeCls(['in-buffer', 'current']);
		me.addCls('out-of-buffer');

		//once we load the tiles or if we already have them
		load.then(function () {
			delete me.loadingTiles;
			me.setHeight(me.getHeight());
			wait().then(me.clearTiles.bind(me));
		});
	},


	__shouldReload: function (date, force) {
		return date > this.lastLoaded || force;
	},


	reloadTilesToDom: function (containerPos) {
		var me = this,
			load = me.loadingTiles;

		if (!load) {
			load = me.hasTiles ? Promise.resolve() : Promise.reject();
		}

		me.removeCls(['out-of-buffer', 'current']);
		me.addCls('in-buffer');

		//if we fail to load tiles, or already have tiles
		return load.catch(function () {

			if (me.__shouldReload(containerPos.refreshDate, containerPos.force)) {
				me.reloadTiles()
					.then(function () {
						me.setHeight(null);
					});
			} else {
				me.addTilesBack();
				//me.setHeight(null);
			}
		});
	}
});
