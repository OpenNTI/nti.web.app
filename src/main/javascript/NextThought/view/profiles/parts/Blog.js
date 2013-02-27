Ext.define('NextThought.view.profiles.parts.Blog',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.profiles.parts.BlogListItem',
		'NextThought.view.profiles.parts.BlogPost'
	],

	layout: 'auto',
	componentLayout: 'templated-container',
	defaultType: 'profile-blog-list-item',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	ui: 'blog',
	cls: 'blog',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'post-view' },
		{ cls: 'list-view', cn:[
			{ cls: 'header', html: 'My next thought...' },
			{ id: '{id}-body', cls: 'body', tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') }
		]}
	]),


	renderSelectors: {
		listViewEl: '.list-view',
		postViewEl: '.post-view'
	},


	initComponent: function(){
		this.callParent(arguments);

		var me = this;

		if(isMe(me.username)){
			me.addCls('owner');
			me.renderSelectors.headerEl = '.header';
		}

		function fail(response){
			console.warn('No blog object ('+response.status+') :'+response.responseText);
			//ensure that the destroy happens after the construction/component plumbing.
			//If the request is cached in the browser, this may be a synchronous call.
			Ext.defer(me.destroy,1,me);
		}

		UserRepository.getUser(me.username,function(user){
			me.user = user;
			var req = {
				url: user.getLink('Blog'),
				scope: me,
				success: me.loadContents,
				failure: fail
			};

			if(Ext.isEmpty(req.url)){
				fail({status:0,responseText:'User object did not have a Blog url'});
				return;
			}

			Ext.Ajax.request(req);
		});

		this.on('show-post',this.updateLocation,this);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.listViewEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.postViewEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		if(this.headerEl){
			this.mon(this.headerEl,'click',this.onNewPost,this);
		}

		this.mon(this.tab,'click',this.closePost, this);
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
	},


	updateLocation: function(postId){

		var u = this.user,
			hash, args=[this.title, postId];

		if(!postId){args.pop();}

		hash = u.getProfileUrl.apply(u,args);

		if(location.hash !== hash){
			location.hash = hash;
		}
	},


	setParams: function(paramsString){
	
		var me = this,
			s = me.store, r,
			id = paramsString && decodeURIComponent(paramsString);

		if(!me.rendered){
			me.on('afterrender',Ext.bind(me.setParams,me,arguments),me,{single:true});
			return;
		}


		console.debug('setting params',id);
		me.closePost(true);

		if(!id){ return; }

		r = s && s.findRecord('ID', id, 0, false, true, true);
		if(r){
			me.showPost(r);
			return;
		}

		r = {
			url: me.user.getLink('Blog')+'/'+paramsString,
			scope: me,
			failure: function(){me.setParams(); alert('Could not load post');},
			success: function(resp){
				var j = ParseUtils.parseItems( resp.responseText ).first();
				me.showPost(j);
			}
		};

		Ext.Ajax.request(r);
	},


	getParams: function(){
		console.debug('getting params');
		return '';
	},


	cleanPreviousPost: function(){
		var post = this.activePost;
		delete this.activePost;

		if( post && !post.isDestroyed){
			post.destroy();
			return true;
		}
		return false;
	},


	closePost: function(leaveLocation){
		this.listViewEl.show();
		this.postViewEl.hide();
		this.updateLayout();

		this.cleanPreviousPost();

		if(leaveLocation !== true){
			this.updateLocation();
		}
	},


	showPost: function(record){
		this.listViewEl.hide();
		this.postViewEl.show();

		this.cleanPreviousPost();

		this.activePost = Ext.widget('profile-blog-post',{
			renderTo:this.postViewEl,
			record: record,
			listeners: {
				scope: this,
				destroy: this.closePost,
				buffer: 1
			}
		});

		this.updateLayout();
	}
});
