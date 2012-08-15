Ext.define('NextThought.view.annotations.note.Responses',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-responses',

	requires: [
		'NextThought.view.annotations.note.Reply'
	],

	cls: 'note-responses',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	defaults: {
		xtype: 'note-reply'
	},

	setReplies: function(children) {
		this.removeAll(true);

		Ext.each(children,this.addReply,this);
		console.log('*** height = ', this.getHeight());
	}
},
function(){
	this.borrow(NextThought.view.annotations.note.Reply, ['addReply']);
});
