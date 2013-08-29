Ext.define('NextThought.proxy.JSONP', {
	bufferedContent: {},

	/**
	 *
	 * @param options Object with keys:
	 *     jsonpUrl
	 *     url
	 *     expectedContentType
	 *     success
	 *     failure
	 *   scope
	 */
	request: function (options) {
		var me = this,
				opts = Ext.apply({}, options),
				script,
				t;

		function jsonp(script) {
			clearTimeout(t);
			var resp = {
				responseText: me.getContent(opts.ntiid, opts.expectedContentType),
				request:      { options: opts }
			};
			console.log("JSONP.request completed", resp.responseText.length);
			opts.callback.call(opts.scope || window, opts, true, resp);
			opts.success.call(opts.scope || window, resp);
			Ext.fly(script).remove();
		}

		function onError(script) {
			delete script.onload;
			clearTimeout(t);
			Ext.fly(script).remove();
			console.error('PROBLEMS!', opts);

			var resp = {
				status:           0,
				responseText:     'Problem loading jsonp script',
				requestedOptions: opts
			};

			opts.callback.call(opts.scope || window, opts, false, resp);
			opts.failure.call(opts.scope || window, resp);
		}

		//ensure we have callbacks
		opts.success = opts.success || function emptySuccess() {};
		opts.failure = opts.failure || function emptyFailure() {};
		opts.callback = opts.callback || function emptyCallback() {};

		t = setTimeout(function () {
			console.warn('Timed out: ' + opts.jsonpUrl);
			onError(script);
		}, 60000);

		script = Globals.loadScript(opts.jsonpUrl, jsonp, onError, this);
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
			content.content = Base64.decode(content.content);
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


	/**
	 * @deprecated Workaround until content is rerendered.
	 */
	receiveContentVTT: function (content) {
		content['Content-Type'] = 'text/vtt';
		content.ntiid = 'webvtt';
		this.receiveContent(content);
	}



}, function () {
	if (window.JSONP) {
		console.warn('JSONP is already defined!!!');
	}

	window.JSONP = new this();
	window.jsonpReceiveContent = Ext.bind(JSONP.receiveContent, JSONP);
	/** @deprecated */
	window.jsonpContent = Ext.bind(JSONP.receiveContent, JSONP);
	/** @deprecated */
	window.jsonpToc = Ext.bind(JSONP.receiveContent, JSONP);
	/** @deprecated */
	window.jsonpData = Ext.bind(JSONP.receiveContentVTT, JSONP);
});
