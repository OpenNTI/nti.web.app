Ext.define('NextThought.view.profiles.parts.Blog',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.profiles.parts.BlogEditor',
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
		var me = this;
		me.callParent(arguments);
		if(me.disabled){
			Ext.defer(me.destroy,1,me);
			return;
		}


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
				if(isMe(user) && $AppConfig.service.canBlog()){
					//Our user can blog, but does not have any blog posts yet. So lets not fire fail() as that will
					// remove the blogging widgets.
					return;
				}

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

		this.mon(this.tab,'click',this.onTabClicked, this);
	},


	onTabClicked: function(){
		//only close the post if we are visible
		if(this.isVisible()){
			this.closePost();
		}
	},


	onNewPost: function(e){
		e.stopEvent();
		this.showPost(null,'edit');
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
			add: this.addedContents,
			load: this.loadedContents
		});

		this.store.load();
	},


	addedContents: function(store,records,index){
		var me = this;
		me.suspendLayouts();
		Ext.each(records, function(i){ me.insert(index,{record: i}); }, me, true);
		me.resumeLayouts(true);
	},


	loadedContents: function(store, records, success){
		var m = Ext.Array.map(records,function(i){ return {record: i}; });
		this.add(m);
	},


	updateLocation: function(postId,subsection){
		var u = this.user,
			hash, args=[this.title, postId, subsection];

		if(!subsection || !Ext.isString(subsection)){ args.pop(); }
		if(!postId || !Ext.isString(postId)){args.pop();}

		hash = u.getProfileUrl.apply(u,args);

		if(location.hash !== hash){
			location.hash = hash;
		}
	},


	setParams: function(paramsString){
		var me = this, id, r, s = me.store, sections;

		if(!me.rendered){
			me.on('afterrender',Ext.bind(me.setParams,me,arguments),me,{single:true});
			return;
		}

		sections = ((paramsString && decodeURIComponent(paramsString))||'').split('/');

		id = sections[0];

		console.debug('setting params',id);
		me.closePost(true);

		if(!id || !paramsString){ return; }

		r = s && s.findRecord('ID', id, 0, false, true, true);
		if(r){
			sections[0] = r;
			me.showPost.apply(me,sections);
			return;
		}

		r = {
			url: me.user.getLink('Blog')+'/'+encodeURIComponent(id),
			scope: me,
			failure: function(){me.setParams(); alert('Could not load post');},
			success: function(resp){
				sections[0] = ParseUtils.parseItems( resp.responseText ).first();
				me.showPost.apply(me,sections);
			}
		};

		Ext.Ajax.request(r);
	},


	getParams: function(){
		var a = (this.activePost||{}).record;
		return a ? a.get('ID') : undefined;
	},


	cleanPreviousPost: function(){
		var post = this.activePost;
		delete this.activePost;

		if( post && !post.isDestroyed && !post.destroying){
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


	showPost: function(record,action){
		this.listViewEl.hide();
		this.postViewEl.show();

		this.cleanPreviousPost();

		var xtype = 'profile-blog-post',
			cfg = {
			ownerCt: this,
			renderTo:this.postViewEl,
			record: record,
			selectedSections: Ext.Array.clone(arguments).splice(1),
			listeners: {
				scope: this,
				destroy: this.closePost
			},
			xhooks:{
				destroy: function(){
					delete this.ownerCt;
					return this.callParent(arguments);
				}
			}
		};

		if(!record && action==='edit'){
			xtype = 'profile-blog-editor';
		}

		this.activePost = Ext.widget(xtype,cfg);

		this.updateLayout();
	}
});
