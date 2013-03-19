Ext.define( 'NextThought.view.forums.View', {
	extend: 'NextThought.view.View',
	alias:	'widget.forums-view-container',
	requires: [
	],

	cls: 'forums-view',
	layout: 'auto',
	title: 'NextThought: Forums',

	//on render we will add the Board to this view.

	restore: function(state){
		this.fireEvent('finished-restore');
	}
});
