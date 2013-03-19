Ext.define( 'NextThought.view.forums.View', {
	extend: 'NextThought.view.View',
	alias:	'widget.forums-view-container',
	requires: [
	],

	cls: 'forums-view',
	layout: 'auto',
	title: 'NextThought: Forums',


	restore: function(state){
		this.fireEvent('finished-restore');
	}
});
