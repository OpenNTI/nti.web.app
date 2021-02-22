const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');

require('./writer/Json');
require('./reader/Json');

module.exports = exports = Ext.define('NextThought.proxy.Rest', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.nti',
	timeout: 3600000,

	//hour

	reader: {
		type: 'nti',
		root: 'Items',
	},

	writer: {
		type: 'nti',
	},

	constructor: function (config) {
		this.callParent(arguments);
		this.on('exception', this.exception, this);
	},

	doRequest: function (operation, callback, scope) {
		operation.retryArgs = { callback: callback, scope: scope };
		if (operation.async === false) {
			Ext.Ajax.async = false;
		}
		this.callParent(arguments);
		delete Ext.Ajax.async;

		if (this.headers) {
			delete this.headers;
		}
		//TODO: fire an event in case anyone cares
	},

	buildUrl: function (request) {
		var action = request.operation.action,
			records = request.records,
			record = records ? records[0] : null,
			mimeType = record
				? record.mimeType || record.get('MimeType')
				: 'application/vnd.nextthought',
			href,
			collection;

		this.headers = {};

		//making sure headers propagate
		Ext.apply(this.headers, request.headers || {});
		Ext.apply(this.headers, request.operation.headers || {});

		if (!record) {
			return request.operation.url || request.url || this.url;
		}

		Ext.apply(this.headers, { 'Content-Type': mimeType + '+json' });

		if (request.operation.url || request.url) {
			if ($AppConfig.debug) {
				console.debug(
					'Using a set url. Will not look up URL from service.',
					'\n\tOperation URL:',
					(this.operation && this.operation.url) || undefined,
					'\n\tRequested URL:',
					request.url
				);
			}
			return request.operation.url || request.url;
		}

		if (action === 'update' || action === 'destroy') {
			href = record.getLink('edit') || record.get('href');
		} else if (action === 'create') {
			collection = Service.getCollectionFor(mimeType, null) || {};
			if (!collection.href) {
				Ext.Error.raise('No HREF found for mimetype ' + mimeType);
			}
			href = Globals.getURL(Globals.ensureSlash(collection.href, true));
		} else if (action === 'read') {
			href = record.get('href');
		} else {
			Ext.Error.raise({
				msg: 'Unexpected action, no defined path for: "' + action + '"',
				request: request,
				action: action,
			});
		}

		if (!href) {
			Ext.Error.raise({
				msg: 'The URL is undefined!',
				action: action,
				record: record,
				mimeType: mimeType,
			});
		}

		return href;
	},

	exception: function (proxy, response, operation, eOpts) {
		var code = response.status;
		if (code < 400 || code >= 500) {
			console.error('Error getting data:', arguments);
		}

		try {
			Ext.callback(operation.failed, operation.scope, [
				operation.records,
				operation,
				Ext.decode(response.responseText, true) ||
					response.responseText,
			]);
		} catch (e) {
			console.error(e.message, e);
		}
	},
});
