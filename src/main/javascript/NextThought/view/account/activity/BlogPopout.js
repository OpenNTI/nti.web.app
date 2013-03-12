Ext.define('NextThought.view.account.activity.BlogPopout', {
	extend: 'NextThought.view.account.activity.Popout',

	alias:['widget.activity-popout-blog', 'widget.activity-popout-PersonalBlogEntry'],

	addItems: function(config, type, isContact){
		this.items = [{
			xtype:type,
			record: config.record,
			user: config.user
		}];
	}
});