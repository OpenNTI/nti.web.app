Ext.define('NextThought.view.annotations.note.Responses',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-responses',

	cls: 'note-responses',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	defaults: {
		xtype: 'note-reply'
	},


	addReply: function(record){
		this.add({record: record});
	},


	setReplies: function(children) {
		this.removeAll();
		Ext.each(children, this.addReply, this);
	}
});
