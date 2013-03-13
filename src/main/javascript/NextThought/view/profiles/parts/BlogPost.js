Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog-post',

	mixins: {
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	requires:[
		'NextThought.editor.Editor',
		'NextThought.view.menus.BlogTogglePublish',
		'NextThought.view.annotations.note.Templates',
		'NextThought.view.profiles.parts.BlogComment',
		'NextThought.ux.SearchHits'
	],

	cls: 'entry',
	layout: 'auto',
	defaultType: 'profile-blog-comment',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'blog-post navigation-bar', cn:[
			{cls:'path', cn:['Thoughts / ',{tag:'span',cls:'title-part', html:'{title}'}]},
			{cls:'pager',cn:[{cls:'prev'},{cls:'next'}]}
		]},
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:m A")}'},
			{ tag:'span', cls: 'state {publish-state:lowercase}', html: '{publish-state}'},
			{ tag: 'tpl', 'if':'headline.isModifiable', cn:[
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
					{ tag:'span', cls:'reply link', html: 'Reply' },
					{ tag:'span', cls:'report link', html: 'Report' }
				]},
				{ cls:'editor-box'}
			]}
		]},
		{ id: '{id}-body', cls: 'comment-container',
			tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') }
	]),


	renderSelectors: {
		bodyEl: '.body',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		flagEl: '.report.link',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		publishStateEl: '.meta .state',
		commentBoxEl: '.comment-box',
		responseEl: '.comment-box .response',
		replyLinkEl: '.comment-box .response .reply',
		reportLinkEl: '.comment-box .response .report',
		commentEditorBox: '.comment-box .editor-box',
		navigationBarEl: '.navigation-bar',
		nextPostEl: '.navigation-bar .next',
		prevPostEl: '.navigation-bar .prev'
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
		this.store = NextThought.store.Blog.create();
		this.store.proxy.url = this.getRecord().getLink('contents');

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
		var r = this.record;
		if(!r || !r.getData){
			Ext.defer(this.destroy,1,this);
			return;
		}

		this.renderData = Ext.apply(this.renderData||{}, r.getData());
		this.renderData = Ext.apply(this.renderData, {'publish-state': r.getPublishState()});
		r = this.renderData;
		if(!r.headline || !r.headline.getData){
			console.warn('The record does not have a story field or it does not implement getData()',r);

			Ext.defer(this.destroy,1,this);
			return;
		}
		r.headline = r.headline.getData();
	},


	afterRender: function(){
		this.callParent(arguments);
		var h = this.record.get('headline'),
			commentId,
			box = this.responseEl;
		if(!h){return;}

//Animation code
		this.navigationBarEl.addCls('animateIn');
		Ext.defer(this.navigationBarEl.removeCls,1000,this.navigationBarEl,['animateIn animateOut']);
//Animation code end


		//TODO: move this into a mixin so we can share it in the other post widgets (and forum post items)
		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);
		this.setPublishState();

		this.mon(this.navigationBarEl,'click',this.closePost,this);

		this.mon(this.nextPostEl,'click',this.navigationClick,this);
		this.mon(this.prevPostEl,'click',this.navigationClick,this);

		this.updateRecord(this.record);

		this.mon(Ext.get('profile'),'scroll',this.handleScrollHeaderLock,this);

		this.updateContent();
		this.bodyEl.selectable();

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if( this.editEl ){
			this.mon(this.editEl,'click',this.onEditPost,this);
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

		if(!Ext.isEmpty(this.selectedSections)){
			commentId = this.selectedSections[1];
			console.debug('Do something with this/these:',this.selectedSections);
			if(this.selectedSections[0]==='comments' && !commentId){
				Ext.defer(this.showEditor,500,this);
			}
			else if(commentId){
				this.scrollToComment = commentId;
			}
		}
	},


	closePost: function(){
		if(this.closedPost){
			return;
		}

		this.closedPost = true;

		//All of this belongs somewhere else... its animation code (css implements the keyframes)
		var bar = this.navigationBarEl;
		if( bar ) {
			bar.removeCls('animateIn animateOut').addCls('animateOut');
		}

		Ext.get('profile').scrollTo('top',0,true);

		if(!this.destroying){
			this.destroy();
		}
	},


	updateRecord: function(record){
		var s = record && record.store,
			max = s && (s.getCount()-1),
			idx = record && record.index;

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


	handleScrollHeaderLock: function(e,profileDom){
		var profileDomParent = profileDom && profileDom.parentNode,
			profileScroll = Ext.fly(profileDom).getScroll().top,
			navBarParent = Ext.getDom(this.navigationBarEl).parentNode,
			cutoff = 268;

		if(navBarParent === profileDomParent && profileScroll < cutoff){
			delete this.headerLocked;
			this.navigationBarEl.insertBefore(this.getEl().first());
		}
		else if(navBarParent !== profileDomParent && profileScroll >= cutoff){
			this.headerLocked = true;
			this.navigationBarEl.appendTo(profileDomParent);
		}
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


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		ret.push(this.editor);
		return ret;
	},


	showEditor: function(){
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
		Ext.get('profile').scrollChildIntoView(this.editor.getEl());
	},


	updateField: function(key, value){
		var el = this.el.down('.'+key);
		if(el){ el.update(value); }
	},


	updateContent: function(){
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData );
	},


	onDestroy: function(){
		this.navigationBarEl.remove();

		this.closePost();

		delete this.editor.ownerCt;
		this.editor.destroy();
		var h = this.record.get('headline');

		h.removeObserverForField(this, 'title', this.updateField, this);
		h.removeObserverForField(this, 'body', this.updateField, this);
		h.removeObserverForField(this, 'tags', this.updateField, this);
		this.record.removeObserverForField(this, 'published', this.markAsPublished, this);

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
		this.fireEvent('show-post',this.record.get('ID'),'edit');
	},


	getRecord: function(){
		return this.record;
	},


	showPublishMenu: function(){
		this.publishMenu.updateFromRecord(this.record);
		this.publishMenu.showBy(this.publishStateEl,'tl-bl',[0,0]);
	},


	setPublishState: function(){
		if(!this.record.isModifiable()){
			this.publishStateEl.remove();
			return;
		}

		this.publishMenu = Ext.widget('blog-toggle-publish', {record: this.record});
		this.mon(this.publishStateEl, 'click', this.showPublishMenu, this);
		this.record.addObserverForField(this, 'published', this.markAsPublished, this);
	},


	markAsPublished: function(key, value){
		var val = value ? 'public' : 'only me',
			removeCls = value ? 'only me' : 'public';
		this.publishStateEl.addCls(val);
		this.publishStateEl.update(Ext.Array.map(val.split(' '),Ext.String.capitalize).join(' '));
		this.publishStateEl.removeCls(removeCls);
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
			records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime','DESC'));
			this.add(Ext.Array.map(records,function(r){return {record: r};}));
		}
	},


	loadComments: function(store,records){
		this.removeAll(true);
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime','DESC'));
		this.add(Ext.Array.map(records,function(r){return {record: r};}));

		Ext.defer(this.fireEvent,1,this,['ready',this,this.queryObject]);
	},


	onReady: function(){
		console.debug('ready',arguments);
		var el;
		if(this.scrollToComment){
			el = this.el.down('[data-commentid="'+this.scrollToComment+'"]');
			if( el ) {
				Ext.defer(el.scrollIntoView,500,el,[Ext.get('profile'),false,true]);
			}
			console.log(this.scrollToComment, el);
		}
	},


	//Search hit highlighting
	showSearchHit: function(hit) {
		this.clearSearchHit();
		this.searchAnnotations = Ext.widget('search-hits', {hit: hit, ps: hit.get('PhraseSearch'), owner: this});
	},


	//Returns an array of objects with two propertes.  ranges is a list
	//of dom ranges that should be used to position the highlights.
	//key is a string that used to help distinguish the type of content when we calculate the adjustments( top and left ) needed.
	rangesForSearchHits: function(hit){
		var phrase = hit.get('PhraseSearch'),
			fragments = hit.get('Fragments'),
			regex, ranges,
			searchIn = this.el.dom,
			doc = searchIn.ownerDocument,
			result = [];


		console.log('Getting ranges for search hits');

		regex = SearchUtils.contentRegexForSearchHit(hit, phrase);
		ranges = TextRangeFinderUtils.findTextRanges(searchIn, doc, regex);
		result.push({ranges: ranges.slice(),
					 key: 'blog'});
		return result;
	},


	//	@returns an object with top and left properties used to adjust the
	//  coordinate space of the ranges bounding client rects.
	//  It decides based on the type of container( main content or overlays).
	getRangePositionAdjustments: function(key){
		return {top: -1*this.el.getTop(), left: -1*this.el.getLeft()};
	},


	clearSearchHit: function() {
		if (!this.searchAnnotations) {
			return;
		}

		this.searchAnnotations.cleanup();
		delete this.searchAnnotations;
	},


	getInsertionPoint: function(){
		return this.el;
	}


});
