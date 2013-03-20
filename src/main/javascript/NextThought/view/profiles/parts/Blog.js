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
		listViewBodyEl: '.list-view .body',
		postViewEl: '.post-view'
	},


	initComponent: function(){
		this.callParent(arguments);

		//TODO this whole bit about us destroying ourselves is kinda weird
		//shouldn't our container manage whether or not we are present
		//and just not even create us if we will be destroyed.
		//
		// - JG: not if that's not known in the container. If the container drives, then this logic moves up.  But as it
		// stands, the Blog component attempts to completely encapsulate the blog feature.  The Tab view above this
		// doesn't know anything about its tabs. So, I believe, while its weird, its still the best way.  A feature
		// self-destructs itself if its not available. (Its been an idea of mine to attempt to make all features
		// self-encapsulated-- though, I admit, I haven't succeeded in all cases)
		if(this.user && !this.user.hasBlog()){
			Ext.defer(this.destroy,1,this);
			return;
		}


		if(isMe(this.username) && $AppConfig.service.canBlog()){
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
				url: user && user.hasBlog() ? user.getLink('Blog') : null,
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
		this.listViewBodyEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.postViewEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.swapViews('list');
		if(this.headerEl){
			this.headerEl.addCls('owner');
			this.mon(this.headerEl,'click',this.onNewPost,this);
			this.mon(Ext.get('profile'),'scroll',this.handleScrollHeaderLock,this);
		}
	},


	handleScrollHeaderLock: function(e,profileDom){
		var profileDomParent = profileDom && profileDom.parentNode,
			profileScroll = Ext.fly(profileDom).getScroll().top,
			parent = Ext.getDom(this.headerEl).parentNode,
			cutoff = 268,
			wrapper;

		if(Ext.fly(parent).is('.new-blog-post')){
			wrapper = parent;
			parent = wrapper.parentNode;
		}

		if(parent === profileDomParent && (profileScroll < cutoff || !this.isVisible())){
			delete this.headerLocked;
			this.headerEl.insertBefore(this.getEl().first());
			if(wrapper){
				Ext.fly(wrapper).remove();
			}
		}
		else if(this.isVisible() && parent !== profileDomParent && profileScroll >= cutoff){
			this.headerLocked = true;
			wrapper = Ext.DomHelper.append(profileDomParent,{cls:'new-blog-post'});
			this.headerEl.appendTo(wrapper);
		}
	},



	swapViews: function(viewToShow){
		if(this.destroying || this.isDestroyed){
			return;
		}

		var fnm = {'true':'show','false':'hide'},
			v = viewToShow !== 'post';

		try {
			this.listViewBodyEl[fnm[v]]();
			this.postViewEl[fnm[!v]]();
			this.headerEl[(v)? 'removeCls' : 'addCls']('disabled');
		}
		catch(e){
			//console.warn('Swap failed. ListViewEl and PostViewEl are missing!\n',Globals.getError(e));
			swallow(e);
		}
	},


	clearAnimation: function(){
		this.animateTabs('remove');
	},


	animateTabs: Ext.emptyFn,


//	animateTabs: Ext.Function.createBuffered(function(v){
//
//		var tabBar = Ext.get(Ext.query('.nti-profile-tabbar-plain-docked-top').first());
//		if( tabBar ){
//			tabBar.removeCls('animateProfileTabsLeft animateProfileTabsBack');
//
//			if(v!=='remove'){
//				if(v){
//					tabBar.addCls('animateProfileTabsBack');
//					Ext.defer(tabBar.removeCls,1001,tabBar,['animateProfileTabsLeft animateProfileTabsBack']);
//				}
//				else{
//					tabBar.addCls('animateProfileTabsLeft');
//				}
//			}
//
//		}
//	},1),


	warnBeforeDismissingEditor: function(){
		var msg = "You are currently editing a thought, please save or dismiss it first.";
		Ext.defer(function(){ alert({msg: msg}); }, 1);
	},


	onBeforeDeactivate: function(){
		this.clearAnimation();
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
		if(!this.headerEl.hasCls('disabled')){
			this.showPost(null,['edit']);
		}
	},


	loadContents: function(resp){
		if(!this.rendered){
			this.on('afterrender', Ext.bind(this.loadContents, this, arguments), this, {single:true});
			return;
		}

		var j = ParseUtils.parseItems( resp.responseText ).first();
		this.store = NextThought.store.Blog.create({storeId: 'blog-'+this.username});
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


	handleNoVisiblePosts: function(){
		//TODO show something to the user here.  At this point
		//we don't want to just destroy the tab because we don't
		//know this condition until they have clicked on the tab
		//So we probably should just show some placeholder message
		//about not having any published blogs.
		console.log('No visible blog bosts');
	},


	loadedContents: function(store, records, success){
		var a = this.activePost,
		r = a && a.record, m;

		//Note This probably changes or gets moved when paging is involved
		if(success && Ext.isEmpty(records)){
			this.handleNoVisiblePosts();
			return;
		}


		m = Ext.Array.map(records,function(i){

			if(r && i.get('ID') === r.get('ID')){
				console.debug('Loaded active record into store...');
				if( a.updateRecord ){
					a.updateRecord(i);
				}
			}

			return {record: i};
		});
		this.add(m);
	},


	updateLocation: function(postId,subsection){
		var u = this.user,
			fragment,
			args=[this.title, postId, subsection];

		if(!subsection || !Ext.isString(subsection)){ args.pop(); }
		if(!postId || !Ext.isString(postId)){args.pop();}

		fragment = u.getProfileUrl.apply(u,args);

		if(location.hash !== fragment){
			location.hash = fragment;
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
		else {
			clearTimeout(this.animateTabsStart);
			cfg.listeners.destroy = function(){
				this.closePost();
				this.animateTabsStart = Ext.defer(this.animateTabs,10,this,[true]);
			};
			this.animateTabs();
		}

		Ext.get('profile').scrollTo('top',0,true);
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
