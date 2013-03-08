Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-blog-post',

	mixins: {
		likeAndFavorateActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	requires:[
		'NextThought.editor.Editor',
		'NextThought.view.menus.BlogTogglePublish',
		'NextThought.view.annotations.note.Templates',
		'NextThought.view.profiles.parts.BlogComment'
	],

	cls: 'entry',
	layout: 'auto',
	defaultType: 'profile-blog-comment',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'datetime', html: '{Last Modified:date("F j, Y")} at {Last Modified:date("g:m A")}'},
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
			]}
		]},
		{ id: '{id}-body', tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}') },
		{ cls: 'comment-box', cn: [{ cls: 'comment', html: 'Comment...' },{cls:'editor-box'}] }
	]),


	renderSelectors: {
		bodyEl: '.body',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		publishStateEl: '.meta .state',
		commentBoxEl: '.comment-box',
		commentHeaderEl: '.comment-box .comment',
		commentEditorBox: '.comment-box .editor-box'
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
		this.mixins.likeAndFavorateActions.constructor.call(this);
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
			commentHeader = this.commentHeaderEl;
		if(!h){return;}

		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);
		this.setPublishState();
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData );
		this.bodyEl.selectable();

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if( this.editEl ){
			this.mon(this.editEl,'click',this.onEditPost,this);
		}

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);

		commentHeader.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.commentEditorBox});
		this.mon(commentHeader,'click',this.showEditor,this);
		this.mon(this.editor,{
			scope: this,
			'activated-editor':Ext.bind(commentHeader.hide,commentHeader),
			'deactivated-editor':Ext.bind(commentHeader.show,commentHeader),
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


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		ret.push(this.editor);
		return ret;
	},


	showEditor: function(){
		this.editor.activate();
		this.editor.focus(true);
		Ext.get('profile').scrollChildIntoView(this.editor.getEl());
	},


	updateField: function(key, value){
		var el = this.el.down('.'+key);
		if(el){ el.update(value); }
	},


	updateContent: function(key, value){
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData );
	},


	onDestroy: function(){
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
		if(this.scrollToComment){
			console.log(this.scrollToComment, this.el.down('[data-commentid="'+this.scrollToComment+'"]'));
		}
	}
});
