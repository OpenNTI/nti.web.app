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
	hidden: true,

	ui: 'blog',
	cls: 'blog',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'list-view', cn:[
			{ tag: 'tpl', 'if':'canBlog', cn:{ cls: 'new-entry-btn header', html: 'New Entry' }},
			{ id: '{id}-body', cls: 'body', tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') }
		]},
		{ cls: 'post-view' }
	]),


	renderSelectors: {
		listViewEl: '.list-view',
		listViewBodyEl: '.list-view .body',
		postViewEl: '.post-view',
		btnNewEntryEl: '.new-entry-btn'
	},


	initComponent: function(){
		this.canBlog = isMe(this.username) && $AppConfig.service.canBlog();
		this.callParent(arguments);

		//Additional logging to see if this.username is for "me" but we're viewing another profile?
		console.debug('Who is this for?',this.username, this.user && this.user.getId(), 'Can blog? ',this.canBlog);

		if(this.user && !this.user.hasBlog()){
			//If we already have a user and we know it does not have a blog url, this tells us there is no blog.
			// So destroy our self.
			//
			// This condition is probably never hit, because all we have at this point is a username.
			Ext.defer(this.destroy,1,this);
			return;
		}

		this.renderData = Ext.apply(this.renderData||{},{canBlog: this.canBlog});

		this.buildBlog();

		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.on('show-post',this.updateLocation,this);
	},


	buildBlog: function(reresolveUser){
		function fail(response){
			console.warn('No blog object (Status: '+response.status+'): '+response.responseText);
			try {
				if(response.status === 0 && Ext.isEmpty(response.request.options.url)){
					//We destroy the tab view if, and only if, the url is not present.
					Ext.defer(me.destroy,1,me);
					return;
				}
				else {
					console.error('Error loading blog: ', response);
				}
			} catch(e){
				console.error('problem in determining error :(',Globals.getError(e));
			}
			me.tab.show();
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

			fail({status:0,responseText:'User object did not have a Blog url', request:{options:req}});
			return;
		}

		Ext.Ajax.request(req);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.listViewBodyEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.postViewEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.swapViews('list');
		if(this.btnNewEntryEl && this.canBlog){
			this.btnNewEntryEl.addCls('owner');
			this.mon(this.btnNewEntryEl,'click',this.onNewPost,this);
			this.mon(Ext.get('profile'),'scroll',this.handleScrollNewEntryBtnLock,this);
		}
	},


	handleScrollNewEntryBtnLock: function(e,profileDom){
		//This is only called on scroll for when the btnNewEntryEl is present.
		var btnEl = this.btnNewEntryEl,
			profileDomParent = profileDom && profileDom.parentNode,
			profileScroll = Ext.fly(profileDom).getScroll().top,
			parent = btnEl && Ext.getDom(btnEl).parentNode,
			cutoff = 268,
			wrapper;

		if(!btnEl || !parent){
			console.error('Nothing to handle, btnNewEntryEl is falsey');
			return;
		}

		if(Ext.fly(parent).is('.new-blog-post')){
			wrapper = parent;
			parent = wrapper.parentNode;
		}

		if(parent === profileDomParent && (profileScroll < cutoff || !this.isVisible())){
			btnEl.insertBefore(this.getEl().first());
			if(wrapper){
				Ext.fly(wrapper).remove();
			}
		}
		else if(this.isVisible() && parent !== profileDomParent && profileScroll >= cutoff){
			wrapper = Ext.DomHelper.append(profileDomParent,{cls:'new-blog-post'});
			btnEl.appendTo(wrapper);
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
			this.btnNewEntryEl[(v)? 'removeCls' : 'addCls']('disabled');
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
		if(!this.btnNewEntryEl.hasCls('disabled')){
			this.showPost(null,['edit']);
		}
	},


	loadContents: function(resp){
		if(this.tab.isHidden()){this.tab.show();}
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
