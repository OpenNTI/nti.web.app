const Ext = require('extjs');
const Path = require('path');
const Url = require('url');
const QueryString = require('query-string');

function getOriginFrom (uri) {
	const o = Url.parse(uri);

	o.pathname = '';
	o.search = '';
	o.hash = '';

	return o.format();
}

module.exports = exports = Ext.define('NextThought.app.contentviewer.components.EmbededWidget', {
	extend: 'Ext.Component',
	alias: 'widget.overlay-content-embeded-widget-frame',

	NO_SOURCE_ID: 'No source id specified!',
	cls: 'content-embeded-widget',


	renderTpl: Ext.DomHelper.markup([
		{ cls: 'splash', style: {backgroundImage: 'url({splash})'}},
		{
			tag: 'iframe', scrolling: 'no', frameborder: 'no', src: '{src}',
			sandbox: '{sandbox}',
			width: '100%', height: '{height}', allowfullscreen: 'allowFullscreen'
		}
	]),


	renderSelectors: {
		splash: '.splash',
		frame: 'iframe'
	},


	listeners: {
		splash: {'click': 'onSplashClick'}
	},


	initComponent: function () {
		this.callParent(arguments);
		this.onMessage = this.onMessage.bind(this);
	},


	beforeRender: function () {
		this.callParent(arguments);

		const {data} = this;
		const rd = this.renderData = this.renderData || {};
		const defer = /^false$/i.test(data.defer) ? false : (Boolean(data.splash) || /^true$/i.test(data.defer));

		let src = Url.parse(data.source);

		if (!Path.isAbsolute(src.pathname)) {
			const pkg = Url.parse(this.basePath);
			pkg.pathname = Path.join(pkg.pathname, src.pathname);
			pkg.search = src.search;
			src = pkg;
		}

		const query = QueryString.parse(src.search);

		rd.splash = data.splash ? this.resolveSplashURL(data.splash) : 'data:,';
		rd.height = data.height || 0;

		this.frameDeferred = defer;
		this.sourceName = data.uid || query[this.getIdKey()] || this.NO_SOURCE_ID;

		if (query[this.getIdKey()] !== this.sourceName) {
			query[this.getIdKey()] = encodeURIComponent(this.sourceName);
			src.search = QueryString.stringify(query);
		}

		data.source = src.format();

		const srcOrigin = getOriginFrom(src.format());
		const {origin: currentOrigin} = global.location || {};
		// See sandbox docs: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
		// We want the same behavior the browser provides for content on remote-domains to be applied to local content.
		// The sandbox flag provides this... Would be nice to only add the sandbox flag for same-origin URI's,
		// but ExtJS's template format doesn't have a way to do conditional attributes cleanly.
		const sandboxFlags = [
			'allow-forms',
			'allow-modals',
			'allow-orientation-lock',
			'allow-pointer-lock',
			'allow-popups',
			'allow-popups-to-escape-sandbox',
			'allow-presentation',
			'allow-scripts'
		];
		if (srcOrigin !== currentOrigin) {
			//allow-same-origin combined with allow-scripts when the origin of the iframe is the same as ours,
			//negates the sandbox...so only add it when the embeded content is NOT in the contentPackage.
			sandboxFlags.push('allow-same-origin');
		}

		rd.sandbox = sandboxFlags.join(' ');

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
			this.onResizeBuffer = setTimeout(function () { me.updateLayout(); }, 250);
		}
	}
});
