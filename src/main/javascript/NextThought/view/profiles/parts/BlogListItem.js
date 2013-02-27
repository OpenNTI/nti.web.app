Ext.define('NextThought.view.profiles.parts.BlogListItem',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-list-item',

	mixins: {
		likeAndFavorateActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	cls: 'entry',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:m A")}'},
			{ tag:'span', cls: 'state', html: 'Draft'}
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
		favorites: '.controls .favorite'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['show-comments','show-post']);
		this.enableBubble(['show-comments','show-post']);
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
		var h = this.record.get('headline');
		if(!h){return;}

		this.mon(this.titleEl,'click', this.goToPost,this);
		this.mon(this.commentsEl,'click', this.goToPostComments,this);
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData, 226 );
	},


	getRecord: function(){
		return this.record.get('headline');
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


	mapWhiteboardData: function(){},


	goToPost: function(e){
		e.stopEvent();
		this.fireEvent('show-post',this.record.get('ID'));
	},


	goToPostComments: function(e){
		e.stopEvent();
		this.fireEvent('show-comments',this.record.get('ID'));
	}
});
