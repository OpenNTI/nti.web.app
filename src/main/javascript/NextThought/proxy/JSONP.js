Ext.define('NextThought.proxy.JSONP',{
	bufferedContent: {},

	/**
	 *
	 * @param options Object with keys:
	 *	 jsonpUrl
	 *	 url
	 *	 expectedContentType
	 *	 success
	 *	 failure
	 *   scope
	 */
	request: function(options){
		console.log("JSONP.request", arguments);
		var me = this, opts = options || {};
		function jsonp(script){
			var resp = {
				responseText: me.getContent(opts.ntiid,opts.expectedContentType),
				request: {
					options: {
						url: opts.url
					}
				}
			};

			opts.callback.call(opts.scope||window,opts,true,resp);
			opts.success.call(opts.scope||window,resp);
			Ext.fly(script).remove();

		}

		function onError(script){
			Ext.fly(script).remove();
			console.error('PROBLEMS!', opts);

			var resp = {
				status: 0,
				responseText: 'Problem loading jsonp script',
				requestedOptions: opts
			};

			opts.callback.call(opts.scope||window,opts,false,resp);
			opts.failure.call(opts.scope||window,resp);
		}

		//ensure we have callbacks
		opts.success = opts.success || function emptySuccess(){};
		opts.failure = opts.failure || function emptyFailure(){};
		opts.callback = opts.callback || function emptyCallback(){};

		Globals.loadScript(opts.jsonpUrl, jsonp, onError, this);
	},

	getContent: function(ntiid,type){
		if(!type){
			Ext.Error.raise('Must specify the type you want');
		}
		try {
			return this.bufferedContent[ntiid][type].content;
		}
		catch(err){
			console.error('Oops...',type,ntiid,err.stack||err.message);
		}

		return '';
	},


	receiveContent: function(content){
		//expects: {content:?, contentEncoding:?, NTIID:?, version: ?}
		var type = content['Content-Type'];
		if(type==='application/xml'){
			type = 'text/xml';
			console.warn('Forcing content type to text/xml from application/xml', content.ntiid);
		}

		//1) decode content
		if(/base64/i.test(content['Content-Encoding'])) {
			content.content = Base64.decode(content.content);
		}
		else {
			Ext.Error.raise('not handing content encoding ' + content['Content-Encoding']);
		}

		//2) ensure there is a bucket
		if( !this.bufferedContent[content.ntiid] ){
			this.bufferedContent[content.ntiid] = {};
		}

		//3) put it in the bucket
		this.bufferedContent[content.ntiid][type] = content;
	}

},function(){
	if(window.JSONP){
		console.warn('JSONP is already defined!!!');
	}

	window.JSONP = new this();
	window.jsonpContent = Ext.bind(JSONP.receiveContent, JSONP);
	window.jsonpToc     = Ext.bind(JSONP.receiveContent, JSONP);
});
