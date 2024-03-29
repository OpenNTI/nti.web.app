const Ext = require('@nti/extjs');
const Vimeo = require('internal/legacy/model/resolvers/videoservices/Vimeo');

module.exports = exports = Ext.define('NextThought.app.video.roll.Roll', {
	extend: 'Ext.container.Container',
	alias: 'widget.video-roll',
	layout: 'anchor',
	defaults: { anchor: '100%' },
	cls: 'videos',
	ui: 'video',

	items: [
		{
			name: 'video',
			xtype: 'box',
			cls: 'video',
			height: 360,
			width: 640,
			autoEl: {
				src: Ext.SSL_SECURE_URL,
				tag: 'iframe',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				seamless: true,
				transparent: true,
				allowFullscreen: true,
				allowTransparency: true,
				style: 'overflow: hidden',
				height: 360,
				width: 640,
			},
		},
	],

	constructor: function (config) {
		var store = config ? config.store || undefined : undefined,
			data = config ? config.data || undefined : undefined,
			me = this;

		me.callParent(arguments);

		this.iframe = this.down('box[name=video]');

		if (!data) {
			data = [
				{
					thumbnail: 'http://img.youtube.com/vi/S4knArgz7cA/2.jpg',
					url: 'https://www.youtube.com/embed/S4knArgz7cA?rel=0&wmode=opaque',
				},
				{
					thumbnail: 'http://img.youtube.com/vi/yY2NVw-aXqY/2.jpg',
					url: 'https://www.youtube.com/embed/yY2NVw-aXqY?rel=0&wmode=opaque',
				},
				{
					thumbnail: 'http://img.youtube.com/vi/j-EB1O-vRS4/2.jpg',
					url: 'https://www.youtube.com/embed/j-EB1O-vRS4?rel=0&wmode=opaque',
				},
			];
		}

		this.store =
			store ||
			new Ext.data.Store({
				fields: [
					{ name: 'url', type: 'string' },
					{ name: 'thumbnail', type: 'string' },
					{ name: 'type', type: 'string' },
				],
				data: data,
			});

		this.store.each(function (item) {
			if (item.get('thumbnail') || item.get('type') !== Vimeo.TYPE) {
				return;
			}

			var url = item.get('url'),
				id = Vimeo.getIdFromURL(url);

			Vimeo.resolvePosterForID(id).then(function (poster) {
				item.set('thumbnail', poster.poster);
			});
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
				tag: 'tpl',
				for: '.',
				cn: [
					{
						cls: 'item-wrap',
						'data-qtip': '{title:htmlEncode}',
						cn: [
							{
								cls: 'item',
								tag: 'img',
								src: Ext.BLANK_IMAGE_URL,
								style: { backgroundImage: 'url({thumbnail})' },
							},
						],
					},
				],
			}),
		});
		this.mon(this.others, 'selectionChange', this.selection, this);

		this.on('afterrender', 'selectFirst', this);
	},

	selection: function (v, s) {
		if (s && s[0]) {
			this.iframe.el.dom.setAttribute('src', this.filterVideoUrl(s[0]));
		}
	},

	pauseVideo: function () {
		var o = this.iframe.el.dom;
		o.contentWindow.postMessage(
			JSON.stringify({
				event: 'command',
				func: 'pauseVideo',
				args: [],
				id: o.getAttribute('id'),
			}),
			'*'
		);
	},

	filterVideoUrl: function (video) {
		var type = video.get('type'),
			url = video.get('url'),
			a = document.createElement('a'),
			query;

		a.href = url;
		query = Ext.Object.fromQueryString(a.search);

		if (type === 'youtube') {
			query.html5 = 1;
			query.enablejsapi = 1;
			query.autohide = 1;
			query.modestbranding = 0;
			query.rel = 0;
			query.showinfo = 1;
		} else if (type === 'vimeo') {
			query.badge = 0;
			query.byline = 0;
			query.portrait = 0;
		}

		a.search = Ext.Object.toQueryString(query);

		return a.href;
	},

	selectFirst: function () {
		this.others.getSelectionModel().select(0);
	},
});
