const Ext = require('extjs');

require('legacy/mixins/Router');
require('./List');
require('./Header');


module.exports = exports = Ext.define('NextThought.app.notifications.components.Stream', {
	extend: 'NextThought.app.notifications.components.List',
	alias: 'widget.notifications-stream-list',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'notification-stream',
	PREPEND_INDEX: 1,

	items: [
		{xtype: 'box', cls: 'sidebar'},
		{
			xtype: 'container',
			layout: 'none',
			groupContainer: true,
			cls: 'groups',
			items: [
				{xtype: 'notification-header'}
			]
		}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.groupsContainer = this.down('[groupContainer]');

		this.onScroll = this.onScroll.bind(this);
	},

	getGroupContainer: function () {
		return this.groupsContainer;
	},

	onActivate: function () {
		this.callParent(arguments);

		window.addEventListener('scroll', this.onScroll);
	},

	onDeactivate: function () {
		this.callParent(arguments);

		window.addEventListener('scroll', this.onScroll);
	},

	getScrollEl: function () {
		//TODO: figure out how to not have to do a user agent check for this
		return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
	},

	isOnLastBatch: function () {
		return this.isLastBatch;
	},

	maybeShowMoreItems: function () {
		//if we can't scroll
		var body = document.body,
			height = document.documentElement.clientHeight;

		if (this.isOnLastBatch()) {
			return;
		}

		if (this.el && this.el.isVisible() && height >= body.scrollHeight) {
			this.prefetchNext();
		}
	},

	prefetchNext: Ext.Function.createBuffered(function () {
		if (!this.isOnLastBatch()) {
			this.currentBatch.getNextBatch()
				.then(this.loadBatch.bind(this));
		}
	}, 500, null, null),

	onScroll: function () {
		var body = this.getScrollEl(),
			height = document.documentElement.clientHeight,
			top = body.scrollTop,
			scrollTopMax = body.scrollHeight - height,
			//trigger when the top goes over a limit value
			//That limit value is defined by the max scrollTop can be, minus a buffer zone. (defined here as 10% of the viewable area)
			triggerZone = scrollTopMax - Math.floor(height * 0.1),
			wantedDirection = (this.lastScroll || 0) < top;

		this.lastScroll = top;

		if (wantedDirection && top > triggerZone) {
			this.prefetchNext();
		}
	},

	navigateToItem: function (rec) {
		this.Router.root.attemptToNavigateToObject(rec);
	}
});
