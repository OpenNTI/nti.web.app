var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');


module.exports = exports = Ext.define('NextThought.app.prompt.StateStore', {
	extend: 'NextThought.common.StateStore',

	statics: {
		TYPE_TO_CMP: {},

		register: function (type, cmp) {
			this.TYPE_TO_CMP[type] = cmp;
		}
	},


	getPromptCmp: function (type) {
		//TODO: Create a basic prompt cmp to fall back to, similar to the native prompt
		var cmp = this.self.TYPE_TO_CMP[type];

		return cmp;
	},


	openPrompt: function (type, data) {
		var me = this,
			cmp = me.getPromptCmp(type);

		if (!cmp) {
			return Promise.reject('No cmp to prompt for type: ', type);
		}

		return new Promise(function (fulfill, reject) {
			me.fireEvent('open-prompt', cmp, type, fulfill, reject, data);
		});
	}
});
