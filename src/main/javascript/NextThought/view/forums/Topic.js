/**
 * https://docs.google.com/a/nextthought.com/presentation/d/18qyM3011F_AXjwAPGpE-94DPKmuPPPnKQ0EepyAoXmQ/edit#slide=id.gb09172a6_09
 *
 * This will be, for the most part (from Aaron's design), HeadlineTopics. Much like PersonalBlogEntry(s).
 *
 * It will define the headline post and contain followup posts.
 */
Ext.define('NextThought.view.forums.Topic',{
	extend: 'Ext.container.Container',
	alias: 'widget.forums-topic',

	mixins: {
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		profileLink: 'NextThought.mixins.ProfileLinks',
		searchHitHighlighting: 'NextThought.mixins.SearchHitHighlighting'
	},

	requires:[
		'NextThought.editor.Editor',
		'NextThought.view.annotations.note.Templates',
		'NextThought.view.forums.Comment',
		'NextThought.ux.SearchHits',
		'NextThought.view.menus.BlogTogglePublish'
	],

	cls: 'topic-post',
	layout: 'auto',
	defaultType: 'forums-topic-comment',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header-container', cn:
		{ cls: 'forum-topic navigation-bar', cn:[
			{cls:'path', cn:['{path} / ',{tag:'span',cls:'title-part', html:'{title}'}]},
			{cls:'pager',cn:[{cls:'prev'},{cls:'next'}]}
		]}},
		{ cls: 'wrap', cn:[
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'name link', html: '{headline.Creator}'},
			{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:i A")}'},
			{ tag: 'tpl', 'if':'headline.isModifiable', cn:[
				{ tag:'span', cls: 'state link {publish-state:lowercase}', html: '{publish-state}'},
				{ tag:'span', cls: 'edit link', html: 'Edit'},
				{ tag:'span', cls: 'delete link', html: 'Delete'}
			]}
		]},
		{ cls: 'body' },
		{ cls: 'foot', cn: [
			{ tag:'span', cls: 'tags', cn:[
				{tag:'tpl', 'for':'headline.tags', cn:[
					{tag:'span', cls:'tag', html: '{.}'}
				]}
			]},
			{ cls: 'comment-box', cn: [
				{ cls: 'response', cn:[
					{ tag:'span', cls:'reply link', html: 'Add a Comment' },
					{ tag:'span', cls:'report link', html: 'Report' }
				]},
				{ cls:'editor-box'}
			]}
		]}]},
		{ id: '{id}-body', cls: 'comment-container',
			tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') }
	]),


	renderSelectors: {
		bodyEl: '.body',
		nameEl: '.meta .name',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		flagEl: '.report.link',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		commentBoxEl: '.comment-box',
		responseEl: '.comment-box .response',
		replyLinkEl: '.comment-box .response .reply',
		reportLinkEl: '.comment-box .response .report',
		commentEditorBox: '.comment-box .editor-box',
		navigationBarCtrEl: '.header-container',
		navigationBarEl: '.navigation-bar',
		nextPostEl: '.navigation-bar .next',
		prevPostEl: '.navigation-bar .prev',
		publishStateEl: '.meta .state'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['delete-post','show-post','ready']);
		this.enableBubble(['delete-post','show-post']);
		this.on('ready',this.onReady,this);
		this.mon(this.record, 'destroy', this.destroy, this);
		this.buildStore();
	},


	buildStore: function(){
		this.store = NextThought.store.NTI.create({
			url: this.getRecord().getLink('contents')
		});

		this.mon(this.store,{
			scope: this,
			add: this.addComments,
			load: this.loadComments
		});

		this.store.load();
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);

		var me = this,
			r = this.record,s;

		if(!r || !r.getData){
			Ext.defer(this.destroy,1,this);
			return;
		}
		s = r.getPublishState();
		r = this.renderData = Ext.apply(this.renderData||{}, r.getData());
		Ext.apply(r, {
			'publish-state': s,
			path: this.path
		});

		if(!r.headline || !r.headline.getData){
			console.warn('The record does not have a story field or it does not implement getData()',r);

			Ext.defer(this.destroy,1,this);
			return;
		}
		r.headline = r.headline.getData();

		UserRepository.getUser(r.headline.Creator,function(u){
			r.headline.Creator = u;
			me.user = u;
			if(me.rendered){
				me.nameEl.update(u.getName());
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		var h = this.record.get('headline'),
			box = this.responseEl;
		if(!h){return;}

		//TODO: move this into a mixin so we can share it in the other post widgets (and forum post items)
		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);

		this.mon(this.navigationBarEl,'click',this.closeTopic,this);

		this.mon(this.nextPostEl,'click',this.navigationClick,this);
		this.mon(this.prevPostEl,'click',this.navigationClick,this);

		this.updateRecord(this.record);

		this.on('beforeactivate', this.onBeforeActivate, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.mon(Ext.get('forums'),'scroll',this.handleScrollHeaderLock,this);


		this.enableProfileClicks(this.nameEl);

		this.updateContent();
		this.bodyEl.selectable();

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if( this.editEl ){
			this.mon(this.editEl,'click',this.onEditPost,this);
		}

		if(this.publishStateEl){
			this.publishMenu = Ext.widget('blog-toggle-publish', {record: this.record, owner: this});
			this.mon(this.publishStateEl, 'click', this.showPublishMenu, this);
			this.record.addObserverForField(this, 'published', this.markAsPublished, this);
		}

		this.reflectFlagged(this.record);
		this.listenForFlagChanges(this.record);

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);

		box.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.commentEditorBox});
		this.mon(this.replyLinkEl,'click',this.showEditor,this);
		this.mon(this.editor,{
			scope: this,
			'activated-editor':Ext.bind(box.hide,box),
			'deactivated-editor':Ext.bind(box.show,box),
			'no-body-content': function(editor,bodyEl){
				editor.markError(bodyEl,'You need to type something');
				return false;
			}
		});
	},


	scrollCommentIntoView: function(commentId){
		function scrollIntoView(){
			if(typeof(commentId)==='boolean'){
				el = me.getTargetEl();
			}
			else {
				el = me.el.down('[data-commentid="'+commentId+'"]');
			}

			if( el ) {
				Ext.defer(el.scrollIntoView,500,el,[Ext.get('forums'),false,true]);
			}
		}

		var el, images, me = this;
		if(commentId){
			images = this.el.query('img');
			Ext.each(images, function(img){
				img.onload = function(){ scrollIntoView(); };
			});
			scrollIntoView();
		}
		else{
			Ext.get('forums').scrollTo('top', 0, true);
		}
	},


	onReady: function(){
		console.debug('ready',arguments);
		if(this.scrollToComment){
			this.scrollCommentIntoView(this.scrollToComment);
		}
	},


	showPublishMenu: function(){
		this.publishMenu.updateFromRecord(this.record);
		this.publishMenu.showBy(this.publishStateEl,'tl-bl',[0,0]);
	},


	markAsPublished: function(key, value){
		var val = value ? 'public' : 'only me',
			removeCls = value ? 'only me' : 'public';
		this.publishStateEl.addCls(val);
		this.publishStateEl.update(Ext.Array.map(val.split(' '),Ext.String.capitalize).join(' '));
		this.publishStateEl.removeCls(removeCls);
	},


	updateRecord: function(record){
		var s = record && record.store,
			max = s && (s.getCount()-1),
			idx = s && s.indexOf(record);

		this.nextPostEl.addCls('disabled');
		this.prevPostEl.addCls('disabled');

		if(!s){ return; }

		if(idx > 0) {
			this.nextPostEl.removeCls('disabled');
		}

		if(idx < max){
			this.prevPostEl.removeCls('disabled');
		}
	},


	onBeforeDeactivate: function(){
		if(this.isVisible() && this.headerLocked){
			this.navigationBarEl.insertBefore(this.el.first());
		}
		return true;
	},


	onBeforeActivate: function(){
		var parentDom, forumDom;
		if(this.isVisible() && this.headerLocked && this.navigationBarEl){
			forumDom = this.el.up('.forums-view');
			parentDom = forumDom ? forumDom.dom.parentNode : forumDom.dom;
			this.navigationBarEl.appendTo(parentDom);
		}

		if(this.isVisible() && this.down('')){

		}
	},


	handleScrollHeaderLock: function(e,dom){
		var domParent = dom && dom.parentNode,
			scroll = Ext.fly(dom).getScroll().top,
			navBarParent = Ext.getDom(this.navigationBarEl).parentNode,
			cutoff = 0,
			cls = 'scroll-pos-right';

		if(navBarParent === domParent && scroll <= cutoff){
			delete this.headerLocked;
			this.navigationBarEl.removeCls(cls).appendTo(this.navigationBarCtrEl);
		}
		else if(navBarParent !== domParent && scroll > cutoff){
			this.headerLocked = true;
			this.navigationBarEl.addCls(cls).appendTo(domParent);
		}
	},


	navigationClick: function(e){
		e.stopEvent();
		var direction = Boolean(e.getTarget('.next')),
			disabled = Boolean(e.getTarget('.disabled'));

		if(!disabled){
			this.fireEvent('navigate-topic',this, this.record, direction?'next':'prev');
		}

		return false;
	},


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		if( this.editor ){
			ret.push(this.editor);
		}
		return ret;
	},


	showEditor: function(){
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
		Ext.get('forums').scrollChildIntoView(this.editor.getEl());
	},


	updateField: function(key, value){
		var el = this.el.down('.'+key);
		if(el){ el.update(value); }
	},


	updateContent: function(){
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData );
	},


	closeTopic: function(){
		this.fireEvent('pop-view', this);
	},


	onDestroy: function(){
		this.navigationBarEl.remove();

		delete this.editor.ownerCt;
		this.editor.destroy();
		var h = this.record.get('headline');

		h.removeObserverForField(this, 'title', this.updateField, this);
		h.removeObserverForField(this, 'body', this.updateField, this);
		h.removeObserverForField(this, 'tags', this.updateField, this);

		this.callParent(arguments);
	},


	onDeletePost: function(e){
		e.stopEvent();
		var me = this;
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'Deleting your thought will permanently remove it and any comments.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.fireEvent('delete-post',me.record, me);
				}
			}
		});
	},


	onEditPost: function(e){
		e.stopEvent();
		this.fireEvent('edit-topic', this, this.record);
	},


	getRecord: function(){
		return this.record;
	},


	setContent: function(html){
		this.bodyEl.update(html);
		DomUtils.adjustLinks(this.bodyEl, window.location.href);

		this.bodyEl.select('img.whiteboard-thumbnail').each(function(el){
			var wrapper = el.up('.body-divider');
			el.replace(wrapper);
		});
	},


	addComments: function(store,records){
		if(!Ext.isEmpty(records)){
			//Umm it renders sorted ASC but we pass DESC
			records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime','DESC'));
			this.add(Ext.Array.map(records,function(r){return {record: r};}));
		}
	},


	loadComments: function(store,records){
		this.removeAll(true);
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime','DESC'));
		this.add(Ext.Array.map(records,function(r){return {record: r};}));

		this.ready = true;
		Ext.defer(this.fireEvent,1,this,['ready',this,this.queryObject]);
	},


	addIncomingComment: function(item){
		if(item.get('ContainerId') === this.record.getId() && isMe(this.record.get('Creator'))){
			this.addComments(this.store, [item]);

			//Adding a comment in this way doesn't trigger updating the containerView, so we will update the record ourselves.
			this.record.set({'PostCount': (this.store.getCount() + 1)});
		}
	},


	goToComment: function(commentId){
		if(!this.ready){
			this.scrollToComment = commentId;
			return;
		}

		if(commentId){
			this.scrollCommentIntoView(commentId);
		}
		else{
			this.scrollCommentIntoView(null);
		}
	},

	getSearchHitConfig: function(){
		return {
			key: 'forum',
			mainViewId: 'forums'
		};
	}

});
