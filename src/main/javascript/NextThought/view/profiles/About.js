Ext.define('NextThought.view.profiles.About',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.profile-about',

	//<editor-fold desc="Config">
	uriFriendlyName: 'about',
	html: 'about',
	//</editor-fold>


	//<editor-fold desc="State Management Stubs">
	getStateData: function(){ return this.uriFriendlyName; },


	restore: function(data,finishCallback){
		Ext.callback(finishCallback,null,[this]);
	}
	//</editor-fold>
});
