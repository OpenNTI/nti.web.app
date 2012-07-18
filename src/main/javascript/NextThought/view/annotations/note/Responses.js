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
		var id = IdCache.getComponentId(record, null, 'note-reply');
		if (this.down('note-reply[id='+id+']')) {
			console.log('already showing this reply');
			return;
		}
		this.add({record: record, id: id});
	},


	setReplies: function(children) {
		this.removeAll();
		Ext.each(children, this.addReply, this);
	}
});
