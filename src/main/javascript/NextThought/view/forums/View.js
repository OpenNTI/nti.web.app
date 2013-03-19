Ext.define( 'NextThought.view.forums.View', {
	extend: 'NextThought.view.View',
	alias:	'widget.forums-view-container',
	requires: [
		'NextThought.view.forums.Board'
	],

	cls: 'forums-view',
	layout: 'auto',
	title: 'NextThought: Forums',
	defaultType: 'forums-board',


	restore: function(state){
		this.fireEvent('finished-restore');
	},


	afterRender: function(){
		this.callParent(arguments);
		this.add({});
	}

});
