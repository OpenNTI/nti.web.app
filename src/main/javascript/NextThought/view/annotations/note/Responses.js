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
		if (record.getModelName() !== 'Note') {
			console.warn('can not at reply, it is not a note and I am not prepared to handle that.');
			return;
		}
		if (Ext.getCmp(record.getId())) {
			console.log('already showing this reply');
			return;
		}
		this.add({record: record, id: record.getId()});
	},


	setReplies: function(children) {
		this.removeAll();

		Ext.each(children,this.addReply,this);
	}
});
