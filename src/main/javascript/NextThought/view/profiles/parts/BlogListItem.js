Ext.define('NextThought.view.profiles.parts.BlogListItem',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-list-item',

	mixins: {
		likeAndFavorateActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	requires:[
		'NextThought.view.menus.BlogTogglePublish'
	],

	cls: 'entry',

	renderTpl: Ext.DomHelper.markup([
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
			{ tag:'span', cls: 'comment-count', html: '{PostCount} Comments' },
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
		this.callParent(arguments);
		this.addEvents(['delete-post','show-post']);
		this.enableBubble(['delete-post','show-post']);
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavorateActions.constructor.call(this);
		var r = this.record;
		if(!r || !r.getData){
			Ext.defer(this.destroy,1,this);
			return;
		}

		r = this.renderData = Ext.apply(this.renderData||{}, r.getData());
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
		this.publishStateEl.update(this.record.get('publish-state'));
		this.mon(this.titleEl,'click', this.goToPost,this);
		this.mon(this.commentsEl,'click', this.goToPostComments,this);
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData, 226 );

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if( this.editEl ){
			this.mon(this.editEl,'click',this.onEditPost,this);
		}
	},


	showPublishMenu: function(){
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


	onDestroy: function(){
		this.record.removeObserverForField(this, 'published', this.markAsPublished, this);
		this.callParent(arguments);
	},


	onDeletePost: function(e){
		e.stopEvent();
		this.fireEvent('delete-post',this.record, this);
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
