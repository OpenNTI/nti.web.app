Ext.define('NextThought.app.contacts.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.app.contacts.components.code.Window',
		'NextThought.app.contacts.components.group.Window',
		'NextThought.app.contacts.components.list.Window'
	],


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
