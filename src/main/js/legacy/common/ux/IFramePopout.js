const Ext = require('extjs');

const ContentProxy = require('../../proxy/JSONP');

require('../window/Window');


module.exports = exports = Ext.define('NextThought.common.ux.IFramePopout', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.iframe-lightbox',
	modal: true,
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	floating: true,
	closeAction: 'destroy',
	cls: 'lightbox x-panel-lightbox',
	ui: 'lightbox',
	widthRatio: 0.8,
	heightRatio: 0.75,
	layout: 'fit',

	constructor: function (config) {
		var me = this;
		me.callParent(arguments);
		Ext.EventManager.onWindowResize(me.syncSize, me, false);
		this.on({
			buffer: 1,
			afterrender: 'syncSize',
			destroy: function () {
				Ext.TaskManager.stop(me.task);
				Ext.EventManager.removeResizeListener(me.syncSize, me);
			}
		});

		this.add({
			xtype: 'box',
			itemId: 'content',
			cls: 'content loading'
		});

		ContentProxy.get(this.src)
			.then(this.setContent.bind(this), this.noContent.bind(this));

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

	noContent: function () {
		this.getComponent('content')
			.addCls('empty-state')
			.removeCls('loading')
			.update(Ext.DomHelper.markup([
				'Oops! There was an error.',
				{ cls: 'sub', html: 'Try again at a later time.'}
			]));
	},

	setContent: function (content) {
		var c, dom = document.createElement('HTML'); dom.innerHTML = content;
		content = dom.querySelector('BODY').innerHTML;

		c = this.getComponent('content');
		c.removeCls('loading').update(content);

		//SYMMYS Specific code...
		c.onceRendered.then(function () {
			var e = c.el.down('pre');
			e.selectable();
			/*c.mon(e, {
				click: function() {
					var s = document.getSelection(),
						r = document.createRange();
					s.removeAllRanges();
					r.selectNodeContents(e.dom);
					s.addRange(r);
				}
			});*/
		});
	},

	syncSize: function () {
		this.setSize(
			Math.floor(Ext.Element.getViewportWidth() * (this.widthRatio || 0.5)),
			Math.floor(Ext.Element.getViewportHeight() * (this.heightRatio || 0.5)));
		this.center();
	},

	afterRender: function () {
		this.callParent(arguments);
		this.mon(Ext.DomHelper.append(this.el, { cls: 'close', 'data-qtip': 'close' }, true), {
			scope: this,
			click: this.close
		});
	},

	setPosition: function () {},

	//TODO: come up with a better system for positioning these windows
	center: function () {
		if (!this.rendered) {
			this.on('afterrender', this.center.bind(this));
			return;
		}

		var dom = this.el && this.el.dom,
			myHeight = this.getHeight(),
			myWidth = this.getWidth(),
			viewHeight = Ext.Element.getViewportHeight(),
			viewWidth = Ext.Element.getViewportWidth(),
			top, left;

		top = (viewHeight - myHeight) / 2;
		left = (viewWidth - myWidth) / 2;

		top = Math.max(top, 0);
		left = Math.max(left, 0);

		dom.style.top = top + 'px';
		dom.style.left = left + 'px';
	}
});
