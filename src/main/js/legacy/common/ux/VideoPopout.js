const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');


module.exports = exports = Ext.define('NextThought.common.ux.VideoPopout', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.video-lightbox',
	modal: true,
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	floating: true,
	cls: 'videos',
	ui: 'video',
	width: 640,
	height: 475,
	layout: 'fit',

	constructor: function (config) {
		var me = this;
		me.callParent(arguments);
		Ext.EventManager.onWindowResize(me.syncSize, me, false);
		this.on('destroy', function () { Ext.EventManager.removeResizeListener(me.syncSize, me);});

		me.add({
			xtype: 'video-roll',
			store: config.store,
			data: config.data
		});

		me.task = {
			scope: me,
			interval: 300,
			run: function () {
				var m = Ext.getBody().down('.x-mask', true);
				if (m) {
					Ext.TaskManager.stop(me.task);
					Ext.getBody().dom.removeChild(m);
					Ext.getBody().appendChild(m);
				}
			}
		};

		Ext.TaskManager.start(me.task);
	},

	syncSize: function () {
		var vh = Ext.Element.getViewportHeight(),
			mh = this.getHeight(),
			top = Math.round((vh - mh) / 2);

		if (top > 0) {
			this.el.setStyle('top', top + 'px');
		}
	},

	destroy: function () {
		Ext.TaskManager.stop(this.task);
		this.callParent(arguments);
	},

	onShow: function () {
		this.down('video-roll').selectFirst();
		return this.callParent(arguments);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(Ext.DomHelper.append(this.el, { cls: 'close', 'data-qtip': 'close' }, true), {
			scope: this,
			click: this.close
		});

		wait()
			.then(this.syncSize.bind(this));
	}
});
