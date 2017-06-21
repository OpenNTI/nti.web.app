const Ext = require('extjs');

const B64 = require('legacy/util/Base64');
const Globals = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.proxy.JSONP', {
	bufferedContent: {},


	get: function (urlOrConfig) {
		var cfg = {},
			me = this;

		return new Promise(function (fulfill, reject) {
			function resolve (q, s, r) {
				var value = r.responseText;
				if (!s) {
					reject(r);
					return;
				}

				if (q.method === 'HEAD') {
					value = r;
				}

				fulfill(value);
			}

			if (Ext.isString(urlOrConfig)) {
				Ext.apply(cfg, {url: urlOrConfig});
			} else {
				Ext.apply(cfg, urlOrConfig);
			}

			cfg.callback = Ext.Function.createSequence(resolve, cfg.callback, null);

			me.request(cfg);
		});
	},


	request: function (options) {
		// an absolute url must be used. Luckily, thats all we use.
		// and we care about the first 3 parts: [(protocoll:)//domain]/path/to/resource
		const domain = options.url.split('/').slice(0, 3);
		const gap = domain[1];
		const host = domain[2];
		const {location} = global;
		let protocol = domain[0];
		let postfix = 'p';

		if (Ext.isEmpty(protocol)) {
			protocol = domain[0] = location.protocol;//protocoless urls inherit ours
		}

		if (gap !== '' || !Ext.String.endsWith(protocol, ':')) {
			Ext.Error.raise({msg: 'Bad URL, must be absolute', args: options});
		}

		//JSONP CORS workaround not needed. (or not enabled)
		if (host === location.host || $AppConfig.jsonp !== true) {
			return Service.request(options);
		}

		if (!options.jsonpUrl) {
			//major assumptions here...
			//split by query params
			options.jsonpUrl = options.url.split('?');
			if (!Ext.String.endsWith(options.url, 'json', true)) {
				Ext.log.warn('Assuming JSONP is the same name with .jsonp at the end!');
				postfix = '.jsonp';
			}

			options.jsonpUrl[0] += postfix;
			options.jsonpUrl = options.jsonpUrl.join('?');

			console.warn('Assuming jsonp url is: ' + options.jsonpUrl);
		}

		return this.requestJSONP(options);
	},


	/**
	 *
	 * @param {Object} options Object with keys:
	 * @param {String} [options.jsonpUrl] -
	 * @param {String} options.url -
	 * @param {String} [options.expectedContentType] -
	 * @param {Function} [options.success] -
	 * @param {Function} [options.failure] -
	 * @param {Object} [options.scope] -
	 * @returns {Promise} fulfills with JSON, or rejects with an error.
	 */
	requestJSONP: function (options) {
		var me = this;
		return new Promise(function (fulfill, reject) {
			var opts = Ext.apply({},options), script, t;

			function jsonp (element) {
				clearTimeout(t);
				var resp = {
					responseText: me.getContent(opts.ntiid, opts.expectedContentType),
					request: { options: opts }
				};
				console.log('JSONP.request completed', resp.responseText.length);
				try {
					opts.callback.call(opts.scope || window, opts, true, resp);
					opts.success.call(opts.scope || window, resp, opts);
				} finally {
					Ext.fly(element).remove();
					fulfill(resp.responseText);
				}
			}

			function onError (element, reason) {
				delete element.onload;
				clearTimeout(t);
				Ext.fly(element).remove();

				var resp = {
					status: 0,
					reason: reason,
					responseText: 'Problem loading jsonp script',
					requestedOptions: opts
				};

				console.error('PROBLEMS!', resp);

				try {
					opts.callback.call(opts.scope || window, opts, false, resp);
					opts.failure.call(opts.scope || window, resp);
				} finally {
					reject(resp);
				}
			}

			//ensure we have callbacks
			opts.success = opts.success || function emptySuccess () {};
			opts.failure = opts.failure || function emptyFailure () {};
			opts.callback = opts.callback || function emptyCallback () {};

			t = setTimeout(function () { onError(script, 'Timeout'); },60000);

			script = Globals.loadScript(opts.jsonpUrl, jsonp, onError, this);
		});
	},


	getContent: function (ntiid, type) {
		if (!type) {
			Ext.Error.raise('Must specify the type you want');
		}
		try {
			var content = this.bufferedContent[ntiid][type].content;
			delete this.bufferedContent[ntiid][type].content;
			delete this.bufferedContent[ntiid][type];
			return content;
		}
		catch (err) {
			console.error('Oops...', type, ntiid, err.stack || err.message);
		}

		return '';
	},


	receiveContent: function (content) {
		//expects: {content:?, contentEncoding:?, NTIID:?, version: ?}
		var type = content && content['Content-Type'],
			enc = content && content['Content-Encoding'];
		if (type === 'application/xml') {
			type = 'text/xml';
			console.warn('Forcing content type to text/xml from application/xml', content.ntiid);
		}

		if (Ext.isEmpty(type)) {
			Ext.Error.raise({msg: 'Empty content type!', data: content});
		}

		//1) decode content
		if (/base64/i.test(enc)) {
			content.content = B64.decode(content.content);
		}
		else if (/json/i.test(enc)) {
			if (Ext.isString(content.content)) {
				content.content = Ext.JSON.decode(content.content);
			}
		}
		else {
			Ext.Error.raise('not handing content encoding ' + content['Content-Encoding']);
		}

		//2) ensure there is a bucket
		if (!this.bufferedContent[content.ntiid]) {
			this.bufferedContent[content.ntiid] = {};
		}

		//3) put it in the bucket
		this.bufferedContent[content.ntiid][type] = content;
	},


	/*
	 * @deprecated Workaround until content is rerendered.
	 */
	receiveContentVTT: function (content) {
		content['Content-Type'] = 'text/vtt';
		content.ntiid = 'webvtt';
		this.receiveContent(content);
	}



},function () {
	if (window.JSONP) {
		console.warn('JSONP is already defined!!!');
	}

	const JSONP = window.JSONP = this;

	window.jsonpReceiveContent = (...args) => JSONP.receiveContent(...args);
	/* @deprecated use jsonpReceiveContent instaed */
	window.jsonpContent = (...args) => JSONP.receiveContent(...args);
	/* @deprecated use jsonpReceiveContent instaed */
	window.jsonpToc = (...args) => JSONP.receiveContent(...args);
	/* @deprecated use jsonpReceiveContent instaed */
	window.jsonpData = (...args) => JSONP.receiveContentVTT(...args);
}).create();
