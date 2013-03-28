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

	initComponent: function(){
		this.callParent(arguments);
		this.mon(this, 'beforedeactivate', this.onBeforeDeactivate, this);
		this.mon(this, 'beforeactivate', this.onBeforeActivate, this);
	},

	restore: function(state){
		this.fireEvent('restore-forum-state', state);
	},

	onBeforeDeactivate: function(){
//		console.log('Forum view received beforeDeactivate event');
		return Ext.Array.every(this.items.items, function(item){
			return item.fireEvent('beforedeactivate');
		});
	},


	onBeforeActivate: function(){
//		console.log('Forum view received beforeActivate event');
		return Ext.Array.every(this.items.items, function(item){
			return item.fireEvent('beforeactivate');
		});
	},


	finishedRestoring: function(state){
		this.fireEvent('finished-restore');
	},


	getFragment: function(){
		return '!forums';
	}
});
