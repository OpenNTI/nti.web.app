Ext.define( 'NextThought.view.forums.View', {
	extend: 'NextThought.view.View',
	alias:	'widget.forums-view-container',
	requires: [
		'NextThought.layout.container.Stack',
		'NextThought.view.forums.Board'
	],

	cls: 'forums-view',
	layout: 'stack',
	title: 'NextThought: Forums',


	restore: function(state){
		this.fireEvent('restore-forum-state', state);
	},


	finishedRestoring: function(state){
		this.fireEvent('finished-restore');
	},


	getFragment: function(){
		return '!forums';
	}
});
