export default Ext.define('NextThought.overrides.data.Connection', {
	override: 'Ext.data.Connection',
	requires: ['Ext.Ajax'],

	disableCaching: Ext.isGecko === true,
	withCredentials: true,
	useDefaultXhrHeader: true,

	newRequest: function() {
		return this.getXhrInstance();
	},

	setOptions: function(options, scope) {
		var i, badParams = ['id', 'page', 'start', 'limit', 'group', 'sort'],//'_dc'
			params = options.params || {};
    if (Ext.isGecko) {
      badParams.shift();
    }
		if (Ext.isFunction(params)) {
			console.warn('Params were a function!');
			options.params = (params = params.call(scope, options));
		}

		for (i in badParams) {
			if (badParams.hasOwnProperty(i)) {
				delete params[badParams[i]];
			}
		}

		return this.callParent(arguments);
	},

	//We define an error as 4xx or 5xx
	//i.e. 400 <= statusCode <=599
	isHTTPErrorCode: function(statusCode) {
		return 400 <= statusCode && statusCode <= 599;
	},


	//Patch Ext's open request...if I explicitly say to not include credentials, don't.
	openRequest: function(options) {
		var xhr = this.callParent(arguments);

		if (options && options.withCredentials === false) {
			xhr.withCredentials = false;
		}

		return xhr;
	}

},function() {
	Ext.Ajax.cors = true;
	Ext.Ajax.withCredentials = true;

	Ext.Ajax.disableCaching = Ext.isGecko === true;
	Ext.Ajax.useDefaultXhrHeader = true;
	Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
	Ext.Ajax.defaultHeaders.Accept = 'application/json';
	Ext.Ajax.on('beforerequest', function(connection, options) {

		if (Ext.Ajax.logRequests) {
			console.debug('Will perform ajax request with ', arguments);
		}

		if (options && options.async === false) {
			var loc = null;
			try { loc.toString(); }//force an error
			catch (e) {
				loc = e.stack;
				loc = loc.toString().split('\n').slice(6).join('\n');

			}
			console.warn('Synchronous Call in: \n' + loc, '\nOptions: ', options);
		}
	});

	//Setup a 401 handler to send us back to the login page. It's not clear
	//if the MEssageBox alert infrastructure is smart enough to present a bunch
	//of these getting popped up all at once, however, since clicking ok on any
	//of them changes the pages location that is probably ok for now
	Ext.Ajax.on('requestexception', function(conn, response, options) {
		function onConfirmed() {
			//TODO better way to send the user to the login page?
			location.reload();
		}

		if (response && response.status === 401) {
			//We only want to do this for our stuff.  TODO better way to check this
			var redirectIf401 = options && options.url && options.url.indexOf(getURL()) >= 0;
			if (redirectIf401) {
				onConfirmed();
			}
		}
	}, this);
});
