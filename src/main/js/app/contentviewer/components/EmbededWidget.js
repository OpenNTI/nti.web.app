var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.EmbededWidget', {
	extend: 'Ext.Component',
	alias: 'widget.overlay-content-embeded-widget-frame',

	NO_SOURCE_ID: 'No source id specified!',
	cls: 'content-embeded-widget',


	renderTpl: Ext.DomHelper.markup([
		{ cls: 'splash', style: {backgroundImage: 'url({splash})'}},
		{ tag: 'iframe', scrolling: 'no', frameborder: 'no', src: '{src}', width: '100%', height: '{height}' }
	]),


	renderSelectors: {
		splash: '.splash',
		frame: 'iframe'
	},


	listeners: {
		splash: {'click': 'onSplashClick'}
	},


	initComponent: function() {
		this.callParent(arguments);
		this.onMessage = this.onMessage.bind(this);
	},


	beforeRender: function () {
		function parse (src) {
			var out = {};
			var query = src.split('?')[1] || '';

			query.split('&').forEach(function(param) {
				var p = param.split('=');
				out[p[0]] = decodeURIComponent(p[1]);
			});

			return out;
		}

		this.callParent(arguments);

		var rd = this.renderData = this.renderData || {};
		var data = this.data;
		var defer = /^false$/i.test(data.defer) ? false : (Boolean(data.splash) || /^true$/i.test(data.defer));
		var query = Ext.Object.fromQueryString(data.source.split('?')[1] || '');

		rd.splash = data.splash ? this.resolveSplashURL(data.splash) : 'data:,';
		rd.height = data.height || 0;

		this.frameDeferred = defer;
		this.sourceName = data.uid || parse(data.source)[this.getIdKey()] || NO_SOURCE_ID;
		if (Ext.isEmpty(query[this.getIdKey()])) {
			data.source += (data.source.indexOf('?') === -1 ? '?' : '&') + this.getIdKey() + '=' + encodeURIComponent(this.sourceName);
		}

		rd.src = defer ? '' : data.source;
	},


	afterRender: function () {
		this.callParent(arguments);
		window.addEventListener('message', this.onMessage, false);
		if (!this.data.splash) {
			setTimeout(this.onSplashClick.bind(this), 1); //remove the splash
		}
	},


	beforeDestroy: function () {
		this.callParent(arguments);
		window.removeEventListener('message', this.onMessage, false);
	},


	onSplashClick: function (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		this.splash.remove();
		if (this.frameDeferred) {
			this.frame.set({src: this.data.source});
		}
	},


	resolveSplashURL: function (url) {
		//ensure ends with a slash.
		var base = this.basePath.replace(/\/$/, '') + '/';
		var ABSOLUTE_URL = /^(([a-z]+\:)|\/\/|\/)/i;

		if (ABSOLUTE_URL.test(url)) {
			return url;
		}

		return base + url;
	},


	getIdKey: function () {
		return this.data['uid-name'] || 'id';
	},


	onMessage: function (e) {
		var me = this;
		var data = JSON.parse(e.data) || {};
		var id = data[this.getIdKey()];
		var method = data.method;
		var value = data.value;

		if (this.sourceName === this.NO_SOURCE_ID || this.sourceName !== id) {
			if (this.self.debug) {
				console.debug('Ignoring event, %s != %s %o', this.sourceName, id, e.data);
			}
			return;
		}

		if (method === 'resize') {
			value = parseInt(value, 10);

			Ext.getDom(this.frame).setAttribute('height', value);
			Ext.getDom(this.frame).style.height = value + 'px';

			clearTimeout(this.onResizeBuffer);
			this.onResizeBuffer = setTimeout(function() { me.updateLayout(); }, 250);
		}
	}
});
