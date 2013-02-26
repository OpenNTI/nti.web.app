Ext.define('NextThought.view.profiles.parts.Blog',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.profiles.parts.BlogPost'
	],

	layout: 'auto',
	componentLayout: 'templated-container',
	defaultType: 'profile-blog-post',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	ui: 'blog',
	cls: 'blog',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: 'My next thought...' },
		{ id: '{id}-body', cls: 'body', tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') }
	]),


	renderSelectors: {},


	initComponent: function(){
		this.callParent(arguments);

		var me = this,
			req = {
			url: $AppConfig.service.getUserBlogURL(me.username),
			scope: me,
			success: me.loadContents,
			failure: function(response){
				console.warn('No blog object ('+response.status+') :'+response.responseText);
				//ensure that the destroy happens after the construction/component plumbing.
				//If the request is cached in the browser, this may be a synchronous call.
				Ext.defer(me.destroy,1,me);
			}
		};

		if(isMe(me.username)){
			me.addCls('owner');
			me.renderSelectors.headerEl = '.header';
		}

		Ext.Ajax.request(req);
	},


	afterRender: function(){
		this.callParent(arguments);
		if(this.headerEl){
			this.mon(this.headerEl,'click',this.onNewPost,this);
		}
	},


	onNewPost: function(e){
		e.stopEvent();
	},


	loadContents: function(resp){

		if(!this.rendered){
			this.on('afterrender', Ext.bind(this.loadContents, this, arguments), this, {single:true});
			return;
		}

		var j = ParseUtils.parseItems( resp.responseText ).first();
		this.store = NextThought.store.Blog.create();
		this.store.proxy.url = j.getLink('contents');

		this.mon(this.store,{
			scope: this,
			load: this.loadedContents
		});

		this.store.load();
	},


	loadedContents: function(store, records, success){
		var m = Ext.Array.map(records,function(i){ return {record: i}; });
		this.add(m);
	}
});
