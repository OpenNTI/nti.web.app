Ext.define('NextThought.common.ux.ImagePopout', {//TODO: this is 99% copied from the video version. Unify this in to a configurable popup.
	extend: 'Ext.panel.Panel',
	alias: 'widget.image-lightbox',
	requires: [
		'Ext.data.Store',
		'Ext.view.View'
	],

	modal: true,
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	floating: true,
	cls: 'videos',
	ui: 'video',
	width: 640,
	height: 550,
	layout: 'fit',

	constructor: function(config) {
		var me = this;
		me.callParent(arguments);
		Ext.EventManager.onWindowResize(me.syncSize, me, false);
		this.on('destroy', function() { Ext.EventManager.removeResizeListener(me.syncSize, me);});

		me.add({
			xtype: 'image-roll',
			store: config.store,
			data: config.data
		});

		me.task = {
			scope: me,
			interval: 300,
			run: function() {
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


	syncSize: function() {
		this.center();
	},


	destroy: function() {
		Ext.TaskManager.stop(this.task);
		this.callParent(arguments);
	},

	onShow: function() {
		this.down('image-roll').selectFirst();
		return this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(Ext.DomHelper.append(this.el, { cls: 'close', 'data-qtip': 'close' }, true), {
			scope: this,
			click: this.close
		});
	}

});
