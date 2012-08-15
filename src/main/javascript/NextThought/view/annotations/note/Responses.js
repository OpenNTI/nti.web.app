Ext.define('NextThought.view.annotations.note.Responses',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-responses',

	requires: [
		'NextThought.view.annotations.note.Reply'
	],

	cls: 'note-responses',

	layout: 'auto',

	defaults: {
		xtype: 'note-reply'
	},

	setReplies: function(children) {
		this.removeAll(true);

		Ext.each(children,this.addReply,this);
	}
},
function(){
	this.borrow(NextThought.view.annotations.note.Reply, ['addReply']);
});
