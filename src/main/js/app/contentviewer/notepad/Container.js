var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.contentviewer.notepad.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.notepad-item-container',

	layout: 'auto',
	ui: 'notepad-item',
	cls: 'note-container',

	isNotepadItemContainer: true,

	listeners: {
		remove: 'maybeCleanup'
	},


	maybeCleanup: function() {
		if (!this.items.getCount()) {
			this.destroy();
		}
	}
});
