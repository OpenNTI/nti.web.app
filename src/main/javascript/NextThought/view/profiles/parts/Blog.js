Ext.define('NextThought.view.profiles.parts.Blog',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog',

	requires: [
		'NextThought.view.tool.Action'
	],

	items: {
		ui: 'blog',
		cls: 'blog',

		plain: true,
		frame: false,
		border: false,
		tools:[{
			name: 'newpost',
			xtype:'nti-tool-action',
			iconCls: 'post',
			label: 'Create Post'
		}]
	},


	initComponent: function(){
		this.callParent(arguments);

		var url = $AppConfig.service.getUserBlogURL(this.username);

		//if there is no url, we will destroy ourself after this event pump (if we call destroy now bad things will happen)
		if(Ext.isEmpty(url,false)){
			Ext.defer(this.destroy,1,this);
			return;
		}

		this.store = NextThought.store.Blog.create();
		this.store.proxy.url = url;
	},


	afterRender: function(){
		this.callParent(arguments);
		this.store.load();
	}
});
