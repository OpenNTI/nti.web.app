Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',



	restore: function(state){
		this.fireEvent('finished-restore');
	}
});
