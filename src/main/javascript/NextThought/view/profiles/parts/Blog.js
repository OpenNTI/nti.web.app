Ext.define('NextThought.view.profiles.parts.Blog',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog',

	ui: 'blog',
	cls: 'blog',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: 'Share your thoughts...' },
		{ cls: 'body'}
	]),


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
			{ tag: 'tpl', 'for':'.', cn: [
				{ cls: 'entry', 'data-ntiid':'{NTIID}', cn: [
					{ cls: 'title', html:'{title}' },
					{ cls: 'meta', cn: [
						{ tag:'span', cls: 'comment-count', html: '{PostCount} Comments' },
						{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")}'},
						{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("g:m A")}'}
					]}
				]}
			]}
	)),


	renderSelectors: {
		headerEl: '.header',
		bodyEl: '.body'
	},


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

		Ext.Ajax.request(req);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.headerEl,'click',this.onNewPost,this);
		this.mon(this.bodyEl,'click',this.onItemClick,this);
	},


	onNewPost: function(e){
		e.stopEvent();
	},


	onItemClick: function(e){
		e.stopEvent();
		var id, c = e.getTarget('[data-ntiid]');
		if(!c){return;}

		id = c.getAttribute('data-ntiid');

		console.debug('clicked on: ',id);
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
		var m = Ext.Array.map(records,function(i){
			i = i.getData();
			i.story = i.story.getData();
			return i;
		});
		this.itemTpl.append(this.bodyEl,m);
	}
});
