const Ext = require('@nti/extjs');

const B64 = require('legacy/util/Base64');

require('legacy/mixins/dnd/DataTransferSource');
require('../Base');


module.exports = exports = Ext.define('NextThought.model.app.DndInfo', {
	extend: 'NextThought.model.Base',

	statics: {
		SESSION_ID: null,

		getSessionId: function () {
			if (!this.SESSION_ID) {
				this.SESSION_ID = B64.encode((new Date()).getTime() + '+' + $AppConfig.username);
			}

			return this.SESSION_ID;
		},


		getSourceApp: function () {
			return 'application/vnd.nextthought.webapp';
		},


		getVersion: function () {
			return $AppConfig.version || '1';
		}
	},


	mimeType: 'application/vnd.nextthought.app.dndinfo',


	mixins: {
		DataTransfer: 'NextThought.mixins.dnd.DataTransferSource'
	},


	fields: [
		{name: 'SourceApp', type: 'string'},
		{name: 'DnDSession', type: 'string'},
		{name: 'Version', type: 'string'}
	],


	constructor: function (config) {
		this.callParent(arguments);

		this.set({
			SourceApp: this.get('SourceApp') || this.self.getSourceApp(),
			DnDSession: this.get('DnDSession') || this.self.getSessionId(),
			Version: this.get('Version') || this.self.getVersion()
		});
	},


	getDataForTransfer: function () {
		return {
			MimeType: this.mimeType,
			SourceApp: this.get('SourceApp'),
			DnDSession: this.get('DnDSession'),
			Version: this.get('Version')
		};
	},


	isSameSession: function () {
		return this.get('DnDSession') === this.self.getSessionId();
	},


	isSameVersion: function () {
		return this.get('Version') === this.self.getVersion();
	},


	isSameApp: function () {
		return this.get('SourceApp') === this.self.getSourceApp();
	},


	isSame: function () {
		return this.isSameSession() && this.isSameVersion() && this.isSameApp();
	}
});
