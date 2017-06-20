const Ext = require('extjs');

const DomUtils = require('legacy/util/Dom');

require('legacy/util/Anchors');


module.exports = exports = Ext.define('NextThought.app.contentviewer.overlay.Panel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.overlayed-panel',
	OBJECT_QUERY: 'object[type*=naquestion],object[type*=napoll]',
	placementHolderTpl: Ext.DomHelper.createTemplate({type: 'application/vnd.nextthought.placeholder'}),

	inheritableStatics: {
		relayout: Ext.Function.createBuffered(function () {
			Ext.each(Ext.ComponentQuery.query('overlayed-panel'), function (p) {p.updateLayout();}); },10),

		syncPositioning: Ext.Function.createBuffered(function () {
			Ext.each(Ext.ComponentQuery.query('overlayed-panel'), function (p) { p.syncTop(); }); },10),

		syncPositioningTillStable: Ext.Function.createBuffered(function () {
			Ext.each(Ext.ComponentQuery.query('overlayed-panel'), function (p) {
				p.syncTopTillStable();
			});
		}, 10)
	},

	representsUserDataContainer: false,
	appendPlaceholder: false,
	plain: true,
	autoRender: true,
	ui: 'overlayed',

	constructor: function () {
		this.callParent(arguments);
		Ext.defer(this.setupContentElement, 1, this);
	},

	getRefOwner: function () {
		return this.reader;
	},

	initComponent: function () {
		var d, el, insert = 'insertBefore', ix = 0;
		if (!this.contentElement) {
			try {
				this.insertedElement = true;
				d = this.reader.getDocumentElement().querySelectorAll(this.OBJECT_QUERY);

				d = DomUtils.filterNodeList(d, 'isRootObject');

			//TODO: ensure its a 'type=application/vnd.nextthought.*'
				if (this.appendPlaceholder) {
					insert = 'insertAfter';
					ix = d.length - 1;
				}

				el = d[ix];

				if (!el && this.forceInsert) {
					el = this.reader.getDocumentElement().querySelector('#NTIContent .page-contents');
				}

				this.contentElement = this.placementHolderTpl[insert](el);
			} catch (e) {
				this.insertedElement = false;
				this.contentElement = null;
			}
		}

		if (this.contentElement && this.representsUserDataContainer) {
			Ext.fly(this.contentElement).set({ 'data-nti-container': true });
		}

		this.callParent(arguments);
	},

	destroy: function () {
		if (this.insertedElement) {
			Ext.fly(this.contentElement).remove();
		}
		clearInterval(this.interval);
		this.callParent(arguments);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.syncTopTillStable();
	},

	hide: function () {
		if (this.contentElement) {
			Ext.fly(this.contentElement).setStyle({display: 'none'});
		}
		this.callParent(arguments);
	},

	show: function () {
		if (this.contentElement) {
			Ext.fly(this.contentElement).setStyle({display: 'block'});
		}
		this.callParent(arguments);
	},

	removeContent: function (selector) {
		if (!this.contentElement) {return;}
		var el = Ext.get(this.contentElement);
		el.select(selector)
				//Maybe set style display:none?
				//.remove();
				.setStyle({display: 'none'});
	},

	setupContentElement: function () {
		if (!this.contentElement) {return;}
		this.removeContent('.hidden,INPUT,object,param');
		Ext.fly(this.contentElement).setStyle({
			overflow: 'hidden',
			display: 'block',
			margin: '30px auto',
			opacity: 0,
			'white-space': 'nowrap'
		}).addCls('overlayed');

	},

	syncTopTillStable: function () {
		if (this.interval || !this.rendered) { return; }

		var me = this, lastTop = 0, sameCount = 0;

		me.interval = setInterval(function () {
			var y = me.syncTop();

			if (Math.abs(y - lastTop) < 2) {
				sameCount += 1;
			} else {
				sameCount = 0;
			}

			lastTop = y;

			if (sameCount > 5) {
				clearInterval(me.interval);
				delete me.interval;
			}
		}, 200);
	},

	syncTop: function () {
		if (!this.contentElement) {return 0;}

		var top = this.contentElement.getBoundingClientRect().top;

		try {
			if (!this.reader.isDestroyed) {
				this.el.dom.style.top = top + 'px';
			} else {
				this.destroy();
			}

			this.maybeScrollIntoView();
		}
		catch (e) {
			console.debug(e.message);
			clearInterval(this.interval);
			delete this.interval;
		}

		return top;
	},

	maybeScrollIntoView: Ext.Function.createBuffered(function () {
		try {
			var offset = this.getHeight(),
				reader = this.reader;

			if (reader.scrollToSelector && this.is(reader.scrollToSelector)) {
				reader.getScroll().toNode(this.contentElement, false, null, -offset);
				delete reader.scrollToSelector;
			}
		} catch (e) {
			console.debug(e.message);
		}
	}, 250),

	afterLayout: function () {
		this.syncElementHeight();
		this.callParent(arguments);
	},

	syncElementHeight: function () {
		if (!this.rendered) {return;}
		try {
			var h = this.getHeight();
			if (this.contentElement) {
				Ext.fly(this.contentElement).setHeight(h);
			}
		}
		catch (e) {
			console.log(e.stack || e.message || e);
		}
		this.self.syncPositioning();
	}
});
