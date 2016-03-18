var Ext = require('extjs');
var WindowWindow = require('../window/Window');


module.exports = exports = Ext.define('NextThought.common.ux.ImagePopout', {
    //TODO: this is 99% copied from the video version. Unify this in to a configurable popup.
	extend: 'NextThought.common.window.Window',

    alias: 'widget.image-lightbox',
    modal: true,
    plain: true,
    shadow: false,
    frame: false,
    border: false,
    floating: true,
    cls: 'videos x-panel-video',
    ui: 'video',
    width: 640,
    layout: 'none',

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
	},

    setPosition: function() {},

    center: function() {
		if (!this.rendered) {
			this.on('afterrender', this.center.bind(this));
			return;
		}

		var dom = this.el && this.el.dom,
			myHeight = this.getHeight() + 35,//my width + the close button
			myWidth = this.getWidth(),
			viewHeight = Ext.Element.getViewHeight(),
			viewWidth = Ext.Element.getViewWidth(),
			top, left;

		top = (viewHeight - myHeight) / 2;
		left = (viewWidth - myWidth) / 2;

		top = Math.max(top, 25);//account for the close button
		left = Math.max(left, 0);

		dom.style.top = top + 'px';
		dom.style.left = left + 'px';
	}
});
