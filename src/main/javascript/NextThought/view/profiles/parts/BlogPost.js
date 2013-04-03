Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'NextThought.view.forums.Topic',
	alias: 'widget.profile-blog-post',

	requires:[
		'NextThought.view.profiles.parts.BlogComment'
	],

	cls: 'entry',
	defaultType: 'profile-blog-comment',

	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			showName: false,
			headerCls: 'blog-post',
			path:'Thoughts'
		});
	},

	buildStore: function(){
		this.store = NextThought.store.Blog.create();
		this.store.proxy.url = this.getRecord().getLink('contents');

		this.mon(this.store,{
			scope: this,
			add: this.addComments,
			load: this.loadComments
		});

		this.store.load();
	},


	afterRender: function(){
		this.callParent(arguments);
		var commentId;

		if(!Ext.isEmpty(this.selectedSections)){
			commentId = this.selectedSections[1];
			console.debug('Do something with this/these:',this.selectedSections);
			if(this.selectedSections[0]==='comments' && !commentId){
				this.scrollToComment = true;
			}
			else if(commentId){
				this.scrollToComment = commentId;
			}
		}
	},


	closeView: function(){
		if(this.closedPost){
			return;
		}

		this.closedPost = true;

		//All of this belongs somewhere else... its animation code (css implements the keyframes)
//		var bar = this.navigationBarEl;
//		if( bar ) {
//			bar.removeCls('animateIn animateOut').addCls('animateOut');
//		}

		this.getMainView().scrollTo('top',0,true);

		if(!this.destroying){
			this.destroy();
		}
	},


	getScrollHeaderCutoff: function(){
		return 268;
	},


	navigationClick: function(e){
		e.stopEvent();
		var direction = Boolean(e.getTarget('.next')),
			disabled = Boolean(e.getTarget('.disabled'));

		if(!disabled){
			this.fireEvent('navigate-post',this, this.record, direction?'next':'prev');
		}

		return false;
	},


	getMainView: function(){
		return Ext.get('profile');
	},


	onDestroy: function(){
		this.closeView();
		this.callParent(arguments);
	},


	fireDeleteEvent: function(){ this.fireEvent('delete-post',this.record, this); },


	destroyWarningMessage: function(){
		return 'Deleting your thought will permanently remove it and any comments.';
	},


	onEditPost: function(e){
		e.stopEvent();
		this.fireEvent('show-post',this.record.get('ID'),'edit');
	},


	setPublishState: function(){
		this.publishMenu = Ext.widget('blog-toggle-publish', {record: this.record, owner: this});
		this.mon(this.publishStateEl, 'click', this.showPublishMenu, this);
		this.record.addObserverForField(this, 'published', this.markAsPublished, this);
	},


	addIncomingComment: function(item){
		if(this.isVisible() && item.get('ContainerId') === this.record.getId() && isMe(this.record.get('Creator'))){
			this.addComments(this.store, [item]);
		}
	},


	onReady: function(){
		function scrollCommentIntoView(){
			if(typeof(me.scrollToComment)==='boolean'){
				el = me.getTargetEl();
			}
			else {
				el = me.el.down('[data-commentid="'+me.scrollToComment+'"]');
			}

			if( el ) {
				Ext.defer(el.scrollIntoView,500,el,[Ext.get('profile'),false,true]);
			}
		}

		console.debug('ready',arguments);
		var el, images, me = this;
		if(this.scrollToComment){
			images = this.el.query('img');
			Ext.each(images, function(img){
				img.onload = function(){ scrollCommentIntoView(); };
			});
			scrollCommentIntoView();
		}
	},


	//Search hit highlighting
	getSearchHitConfig: function(){
		return {
			key: 'blog',
			mainViewId: 'profile'
		};
	}

});
