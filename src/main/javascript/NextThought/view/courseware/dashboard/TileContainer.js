Ext.define('NextThought.view.courseware.dashboard.TileContainer', {
	extend: 'NextThought.view.courseware.dashboard.AbstractView',
	alias: 'widget.dashboard-tile-container',

	cls: 'tile-container',

	initComponent: function() {
		this.callParent(arguments);

		this.header.setWeek(this.week);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.reloadTiles();
	},


	reloadTiles: function() {
		var me = this;

		me.addLoadingMask();

		me.lastLoaded = new Date();

		return me.loadingTiles = me.loadTiles()
			.then(function(tiles) {
				me.removeLoadingMask();

				me.setTiles(tiles);
			});
	},


	addLoadingMask: function() {
		this.addCls('loading');
		this.el.mask('loading...');
	},


	removeLoadingMask: function() {
		this.removeCls('loading');
		this.el.unmask();
	},


	getPositionInfo: function() {
		var dom = this.el.dom;

		return {
			offsetTop: dom.offsetTop,
			offsetHeight: dom.offsetHeight
		}
	},


	parentScrollChanged: function(getState) {
		var state = getState.call(null, this.getPositionInfo()),
			handler;

		if (state === this.currentState) { return; }

		if (state === NextThought.view.courseware.dashboard.View.CURRENT) {
			handler = this.updateCurrent.bind(this);
		} else if (state === NextThought.view.courseware.dashboard.View.OUT_OF_BUFFER) {
			handler = this.removeTilesFromDOM.bind(this);
		} else if (state === NextThought.view.courseware.dashboard.View.IN_BUFFER) {
			handler = this.reloadTilesToDom.bind(this);
		}

		this.currentState = state;

		return handler;
	},


	updateCurrent: function() {
		this.removeCls('in-buffer');
		this.addCls('current');
	},


	removeTilesFromDOM: function() {
		var me = this,
			load = me.loadingTiles;

		if (!load) {
			load = this.hasTiles ? Promise.resolve() : Promise.reject('not loaded');
		}

		me.removeCls(['in-buffer', 'current']);
		me.addCls('out-of-buffer');

		//once we load the tiles or if we already have them
		load.then(function() {
			delete me.loadingTiles;
			me.setHeight(me.getHeight());
			wait().then(me.clearTiles.bind(me));
		});
	},


	__shouldReload: function(date, force) {
		return date > this.lastLoaded || force;
	},


	reloadTilesToDom: function(containerPos) {
		var me = this,
			load = me.loadingTiles;

		if (!load) {
			load = me.hasTiles ? Promise.resolve() : Promise.reject();
		}

		me.removeCls(['out-of-buffer', 'current']);
		me.addCls('in-buffer');

		//if we fail to load tiles, or already have tiles
		return load.fail(function() {

			if (me.__shouldReload(containerPos.refreshDate, containerPos.force)) {
				console.log('Dashboard dirty set reload from server')
				me.reloadTiles()
					.then(function() {
						me.setHeight(null);
					});
			} else {
				console.log('dashboard not dirty reload cached tiles');
				me.setTiles(me.tiles);
				//me.setHeight(null);
			}
		});
	}
});
