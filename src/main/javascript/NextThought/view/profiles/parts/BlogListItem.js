Ext.define('NextThought.view.profiles.parts.BlogListItem',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-list-item',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	requires:[
		'NextThought.view.menus.BlogTogglePublish'
	],

	cls: 'entry list-item',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:m A")}'},
			{ tag:'span', cls: 'state {publish-state:lowercase}', html: '{publish-state}'},
			{ tag: 'tpl', 'if':'headline.isModifiable', cn:[
				{ tag:'span', cls: 'edit link', html: 'Edit'},
				{ tag:'span', cls: 'delete link', html: 'Delete'}
			]}//flag?
		]},
		{ cls: 'body' },
		{ cls: 'foot', cn: [
			{ tag:'span', cls: 'comment-count', html: '{PostCount} Comment{[values.PostCount===1 ? "" : "s"]}' },
			{ tag:'span', cls: 'tags', cn:[
				{tag:'tpl', 'for':'headline.tags', cn:[
					{tag:'span', cls:'tag', html: '{.}'}
				]}
			]}
		]}
	]),


	moreTpl: Ext.DomHelper.createTemplate([' ',{tag:'a', cls:'more', html:'Read More', href:'#'}]),


	renderSelectors: {
		bodyEl: '.body',
		titleEl: '.title',
		commentsEl: '.comment-count',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		publishStateEl: '.meta .state'
	},


	initComponent: function(){
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.callParent(arguments);
		this.addEvents(['delete-post','show-post']);
		this.enableBubble(['delete-post','show-post']);
		this.mon(this.record, 'destroy', this.destroy, this);
	},


	beforeRender: function(){
		this.callParent(arguments);
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
		var h = this.record.get('headline'), me = this;
		if(!h){return;}

		this.setPublishState();
		this.bodyEl.selectable();
		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);
		this.record.addObserverForField(this, 'PostCount', this.updatePostCount, this);
		this.mon(this.titleEl,'click', this.goToPost,this);
		this.mon(this.commentsEl,'click', this.goToPostComments,this);
		this.updateContent();

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if( this.editEl ){
			this.mon(this.editEl,'click',this.onEditPost,this);
		}

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);
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


	updateField: function(key, value){
		var el = this.el.down('.'+key);
		if(el){ el.update(value); }
	},


	updateContent: function(){
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData );
	},


	updatePostCount: function(k, v){
		var el = this.el.down('.comment-count');
		if(el){
			el.update(Ext.String.format('{0} Comment{1}', v, v === 1 ? '' : 's'));
		}
	},


	onDestroy: function(){
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


	setContent: function(html){
		var snip = ContentUtils.getHTMLSnippet(html,300),
			lastChild, appendTo = this.bodyEl;
		this.bodyEl.update(snip||html);
		if(snip){
			lastChild = this.bodyEl.last();//this will not return text nodes
			if(lastChild){ appendTo = lastChild; }

			this.moreEl = this.moreTpl.append(appendTo,null,true);
			this.mon(this.moreEl,'click', this.goToPost,this);
		}

		DomUtils.adjustLinks(this.bodyEl, window.location.href);

		this.bodyEl.select('img.whiteboard-thumbnail').each(function(el){
			var wrapper = el.up('.body-divider');
			el.replace(wrapper);
		});
	},


	markAsPublished: function(key, value){
		var val = value ? 'public' : 'only me',
			removeCls = value ? 'only me' : 'public';
		this.publishStateEl.addCls(val);
		this.publishStateEl.update(Ext.Array.map(val.split(' '),Ext.String.capitalize).join(' '));
		this.publishStateEl.removeCls(removeCls);
	},


	mapWhiteboardData: function(){},


	goToPost: function(e){
		e.stopEvent();
		this.fireEvent('show-post',this.record.get('ID'));
	},


	goToPostComments: function(e){
		e.stopEvent();
		this.fireEvent('show-post',this.record.get('ID'),'comments');
	}
});
