var Ext = require('extjs');
var CommonActions = require('../../common/Actions');
var GroupsStateStore = require('../groups/StateStore');
var ChatStateStore = require('../chat/StateStore');
var CodeWindow = require('./components/code/Window');
var GroupWindow = require('./components/group/Window');
var ListWindow = require('./components/list/Window');


module.exports = exports = Ext.define('NextThought.app.contacts.Actions', {
	extend: 'NextThought.common.Actions',

	groupButtonClicked: function(btn) {
		var flyBtn = Ext.fly(btn);
		if (flyBtn.hasCls('join-group')) {
			this.codeWin = Ext.widget('code-window');
			this.codeWin.show();
		}
		else if (flyBtn.hasCls('create-group')) {
			this.codeCreationWin = Ext.widget('codecreation-window');
			this.codeCreationWin.show();
		}
		else if (flyBtn.hasCls('create-list')) {
			this.createListWin = Ext.widget('createlist-window');
			this.createListWin.show();
		}
		else if (flyBtn.hasCls('suggest')) {
			this.suggestContactsAction();
		}
		else {
			console.error('Group button clicked but I do not know what to do', btn);
		}

	}
});
