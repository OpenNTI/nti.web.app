Ext.define('NextThought.view.profiles.parts.Blog',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog',

	requires: [
		'NextThought.view.profiles.parts.BlogEditor',
		'NextThought.view.profiles.parts.BlogListItem',
		'NextThought.view.profiles.parts.BlogPost'
	],

	layout: 'auto',
	defaultType: 'profile-blog-list-item',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	ui: 'blog',
	cls: 'blog',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'list-view', cn:[
			{ cls: 'header', html: 'New Entry' },
			{ id: '{id}-body', cls: 'body', tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') }
		]},
		{ cls: 'post-view' }
	]),


	renderSelectors: {
		listViewEl: '.list-view',
		postViewEl: '.post-view'
	},


	initComponent: function(){
		this.callParent(arguments);
		if(this.disabled){
			Ext.defer(this.destroy,1,this);
			return;
		}


		if(isMe(this.username) && $AppConfig.service.canBlog()){
			this.addCls('owner');
			this.renderSelectors.headerEl = '.header';
		}

		this.buildBlog();

		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.on('show-post',this.updateLocation,this);
	},


	buildBlog: function(reresolveUser){
		function fail(response){
			console.warn('No blog object ('+response.status+') :'+response.responseText);
			//ensure that the destroy happens after the construction/component plumbing.
			//If the request is cached in the browser, this may be a synchronous call.
			Ext.defer(me.destroy,1,me);
		}

		var user = this.user,
			req = {
				url: user?user.getLink('Blog'):null,
				scope: this,
				success: this.loadContents,
				failure: fail
			},
			me = this;


		if(Ext.isEmpty(req.url)){
			if(reresolveUser || !user){
				//flag the user object as needing to be re-resolved
				if(user){ user.summaryObject = user.summaryObject || Boolean(reresolveUser); }
				UserRepository.getUser(this.username,function(user){
					this.user = user;
					this.buildBlog();
				},this,Boolean(reresolveUser));
				return;
			}

			if(isMe(user) && $AppConfig.service.canBlog()){
				//Our user can blog, but does not have any blog posts yet. So lets not fire fail() as that will
				// remove the blogging widgets.
				return;
			}

			fail({status:0,responseText:'User object did not have a Blog url'});
			return;
		}

		Ext.Ajax.request(req);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.listViewEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.postViewEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.swapViews('list');
		if(this.headerEl){
			this.mon(this.headerEl,'click',this.onNewPost,this);
		}

		this.mon(this.tab,'click',this.onTabClicked, this);
	},


	swapViews: function(viewToShow){
		var fnm = {'true':'show','false':'hide'},
			v = viewToShow !== 'post';

		this.listViewEl[fnm[v]]();
		this.postViewEl[fnm[!v]]();
	},


	onTabClicked: function(){
		//only close the post if we are visible
		if(this.isVisible() && this.el.down('.blog-editor')){
			this.warnBeforeDismissingEditor();
		}
		else if(this.isVisible()){
			this.closePost();
		}
	},


	warnBeforeDismissingEditor: function(){
		var msg = "You are currently editing a thought, please save or dismiss it first.";
		Ext.defer(function(){ alert({msg: msg}); }, 1);
	},


	onBeforeDeactivate: function(){
		var b = Boolean(this.isVisible() && this.el.down('.blog-editor'));
		if(b){
			this.warnBeforeDismissingEditor();
		}
		else {
			this.closePost(true);
		}
		return !b;
	},


	onNewPost: function(e){
		e.stopEvent();
		this.showPost(null,['edit']);
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
		var a = this.activePost,
			r = a && a.record,
			m = Ext.Array.map(records,function(i){

				if(r && i.get('ID') === r.get('ID')){
					console.debug('Loaded active record into store...');
					a.updateRecord(i);
				}

				return {record: i};
			});
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


	setParams: function(paramsString, queryObject){
		var me = this, id, r, s = me.store, sections, args = [];

		if(!me.rendered){
			me.on('afterrender',Ext.bind(me.setParams,me,arguments),me,{single:true});
			return;
		}

		sections = ((paramsString && decodeURIComponent(paramsString))||'').split('/');

		args.push(null,sections.splice(1),queryObject);
		id = sections[0];

		console.debug('setting params',id);
		me.closePost(true);

		if(!id || !paramsString){ return; }

		r = s && s.findRecord('ID', id, 0, false, true, true);
		if(r){
			args[0] = r;
			me.showPost.apply(me,args);
			return;
		}

		r = {
			url: me.user.getLink('Blog')+'/'+encodeURIComponent(id),
			scope: me,
			failure: function(){me.setParams(); alert('Could not load post');},
			success: function(resp){
				args[0] = ParseUtils.parseItems( resp.responseText ).first();
				me.showPost.apply(me,args);
			}
		};

		Ext.Ajax.request(r);
	},


	getParams: function(){
		var a = (this.activePost||{}).record;
		return a ? a.get('ID') : undefined;
	},


	onDestroy: function(){
		this.cleanPreviousPost();
		this.callParent(arguments);
	},


	cleanPreviousPost: function(){
		var post = this.activePost;
		delete this.activePost;

		if( post && !post.isDestroyed && !post.destroying){
			post.clearListeners();
			post.destroy();
			return true;
		}
		return false;
	},


	nextPrevPost: function(cmp,rec,direction){
		var s = this.store,
			dx = (direction==='next' ? -1 : 1),
			r = s && s.find('ID', rec.get('ID'), 0, false, true, true);

		r = s && s.getAt(r+dx);
		if(r){
			this.fireEvent('show-post',r.get('ID'));
		}
	},


	closePost: function(leaveLocation){
		this.swapViews('list');
		this.updateLayout();

		this.cleanPreviousPost();

		if(leaveLocation !== true){
			this.updateLocation();
		}
	},


	showPost: function(record,action,query){
		var s = this.store, r;
		this.swapViews('post');

		this.cleanPreviousPost();

		if(record && !record.store){
			console.debug('Record did not belong to a store, finding...');
			r = s && s.findRecord('ID', record.get('ID'), 0, false, true, true);
			if(r){
				console.debug('Found',r,record, r===record);
				record = r;
			}
			else {
				console.debug('Not found in store yet.');
			}
		}

		var xtype = 'profile-blog-post',
			cfg = {
			ownerCt: this,
			renderTo:this.postViewEl,
			record: record,
			selectedSections: action,
			queryObject: query,
			listeners: {
				scope: this,
				destroy: this.closePost,
				'navigate-post': this.nextPrevPost
			},
			xhooks:{
				destroy: function(){
					delete this.ownerCt;
					return this.callParent(arguments);
				}
			}
		};

		if(action && action[0]==='edit'){
			xtype = 'profile-blog-editor';
		}

		Ext.get('profile').scrollTo('top',0);
		this.activePost = Ext.widget(xtype,cfg);

		this.updateLayout();
	},


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		if(this.activePost){
			ret.push(this.activePost);
		}
		return ret;
	}
});
