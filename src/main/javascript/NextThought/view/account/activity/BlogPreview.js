Ext.define('NextThought.view.account.activity.BlogPreview', {
	extend: 'Ext.Component',
	alias: ['widget.activity-preview-blog', 'widget.activity-preview-PersonalBlogEntry'],

	cls: 'activity-preview',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'header',
			cn:[
				{cls: 'title blog-label', html:'{title: ellispis(150)}'},
				{cls: 'tags blog-label', html:'{tags:ellipsis(150)}'}
			]
		},
		{ cls: 'footer', cn: [
			{cls:'counts', cn:[
				{tag:'span', cls: 'link comment', html:'{commentCount}', 'data-label':' comments'},
				{tag:'span', cls: 'link likes', html:'{likeCount}', 'data-label': ' likes'}
			]}
	 ]}
	]),

	renderSelectors: {
		author: '.author',
		title: '.title',
		commentCountEl: '.counts .comment',
		likeCountEl: '.counts .likes'
	},

	initComponent: function(){
		this.callParent(arguments);

		var me = this,
			headline = me.record.get('headline');

		me.renderData = Ext.apply(me.renderData||{},{
			title: headline.get('title'),
			tags: headline.get('tags') ? 'Tags: '+headline.get('tags'):'',
			commentCount:me.record.get('PostCount')+' Comments',
			likeCount:me.record.get('LikeCount')+' Likes'
		});
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick, this);
	},

	onClick: function(e){
		e.stopEvent();
		this.fireEvent('navigate-to-blog', this.user, this.record.get('ID'));
	}
});