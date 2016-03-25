var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.image.Roll', {
	extend: 'Ext.container.Container',
	alias: 'widget.image-roll',

	layout: 'none',
	cls: 'image image-roll',
	ui: 'image',
	items: [
		{
			name: 'image',
			xtype: 'box',
			cls: 'image',
			width: 640,
			autoEl: {
				tag: 'img',
				src: Ext.BLANK_IMAGE_URL
			}
		}
	],

	constructor: function (config) {
		var store = config ? (config.store || undefined) : undefined,
			data = config ? (config.data || undefined) : undefined,
			me = this;

		me.callParent(arguments);

		me.image = me.down('box[name=image]');

		me.mon(me.image, 'afterrender', function () {
			me.image.el.dom.onload = function () {
				me.updateLayout();
			};
		});

		if (!data) {
			data = [{
				url: 'http://interfacelift.com/wallpaper/D47cd523/03180_doorwaytoheaven_1024x768.jpg'
			},{
				url: 'http://interfacelift.com/wallpaper/D47cd523/03179_bliss_1024x768.jpg'
			},{
				url: 'http://interfacelift.com/wallpaper/D47cd523/03178_trollstigen_1024x768.jpg'
			},{
				url: 'http://interfacelift.com/wallpaper/D47cd523/03180_doorwaytoheaven_1024x768.jpg'
			},{
				url: 'http://interfacelift.com/wallpaper/D47cd523/03179_bliss_1024x768.jpg'
			},{
				url: 'http://interfacelift.com/wallpaper/D47cd523/03178_trollstigen_1024x768.jpg'
			}];
		}

		//this.preload(data);

		this.store = store || new Ext.data.Store({
			fields: [
				{name: 'url', type: 'string'}
			],
			data: data
		});

		this.others = this.add({
			xtype: 'dataview',
			preserveScrollOnRefresh: true,
			overflowX: 'auto',
			overflowY: 'hidden',
			store: this.store,
			cls: 'carousel',
			singleSelect: true,
			allowDeselect: false,
			overItemCls: 'over',
			itemSelector: 'div.item-wrap',
			tpl: Ext.DomHelper.markup({
				tag: 'tpl', 'for': '.',
				cn: [{
					cls: 'item-wrap',
					'data-qtip': '{title:htmlEncode}',
					cn: [{
						cls: 'item',
						tag: 'img',
						src: Ext.BLANK_IMAGE_URL,
						style: { backgroundImage: 'url({url})' }
					}]
				}]
			})
		});

		this.mon(this.others, 'selectionChange', this.selection, this);
	},


	preload: function (data) {
		var me = this,
			loaded = 0,
			maxAspect = 0;

		function fin (img) {
			loaded++;
			var h, w;

			if (img) {
				w = img.width;
				h = img.height;

				maxAspect = Math.max(maxAspect, w / h);

				console.debug('Image Roll Preloaded Image: Width: ' + w + ', Height: ' + h + ', Aspect Ratio: ' + (w / h) + ', Source: ' + img.src);
			}

			if (data.length <= loaded) {
				console.debug('Image Roll finished preloading, max aspect ratio:', maxAspect);
				me.updateAspect(maxAspect);
			}
		}

		Ext.each(data, function (i) {
			var o = i.img = new Image();
			o.onload = function () { fin(o); };
			o.onerror = function () { fin(); console.warn('Failed to load: ' + i.url); };
			o.src = i.url;
		});
	},


	updateAspect: function (aspect) {
		var w = this.image.getWidth(),
			h = Math.round(w / (aspect || 1));

		console.debug('Image Roll: setting new height based on max aspect ratio: ', h);
		this.image.setHeight(h);
		this.updateLayout();
	},


	afterRender: function () {
		this.callParent(arguments);
		Ext.DomHelper.append(this.el, {cls: 'fade-outs', cn: [{cls: 'left'},{cls: 'right'}]});

		this.mon(this.el, 'click', 'onClick');
	},


	selection: function (v, s) {
		var item = s && s[0],
			store = this.others.store,
			index = store && store.indexOf(item),
			total = store && store.getCount();

		if (item) {
			if (index - 1 >= 0) {
				this.el.down('.left').removeCls('disabled');
			} else {
				this.el.down('.left').addCls('disabled');
			}

			if (index + 1 < total) {
				this.el.down('.right').removeCls('disabled');
			} else {
				this.el.down('.right').addCls('disabled');
			}

			this.image.el.setStyle({
				width: '640px',
				height: (this.getHeight() - this.others.getHeight()) + 'px',
				backgroundImage: 'url(' + item.get('url') + ')',
				backgroundSize: 'contain',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat'
			});
		}
	},


	selectFirst: function () {
		this.others.getSelectionModel().select(0);
	},


	onClick: function (e) {
		if (e.getTarget('.disabled')) {
			console.warn('disabled');
		} else if (e.getTarget('.right')) {
			this.selectNext();
		} else if (e.getTarget('.left')) {
			this.selectPrev();
		}
	},


	getActiveSelection: function () {
		var selection = this.others.getSelectionModel(),
			activeSelection = selection && selection.getSelection();

		return activeSelection && activeSelection[0];
	},


	selectItem: function (item) {
		var selection = this.others.getSelectionModel();

		selection.select(item);
	},


	selectNext: function () {
		var active = this.getActiveSelection(),
			store = this.others.store,
			total = store && store.getCount(),
			currentIndex = store && store.indexOf(active),
			newIndex;


		if (currentIndex + 1 < total) {
			newIndex = currentIndex + 1;
		} else {
			newIndex = 0;
		}

		this.selectItem(store.getAt(newIndex));
	},


	selectPrev: function () {
		var active = this.getActiveSelection(),
			store = this.others.store,
			total = store && store.getCount(),
			currentIndex = store && store.indexOf(active),
			newIndex;

		if (currentIndex - 1 >= 0) {
			newIndex = currentIndex - 1;
		} else {
			newIndex = total - 1;
		}

		this.selectItem(store.getAt(newIndex));
	}
});
