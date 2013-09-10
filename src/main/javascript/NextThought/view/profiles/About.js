Ext.define('NextThought.view.profiles.About',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.profile-about',

	uriFriendlyName: 'about',
	html: 'about',


	restore: function(data,finishCallback){

		Ext.callback(finishCallback,null,[this]);
	}
});
