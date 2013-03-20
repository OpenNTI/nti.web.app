Ext.define('NextThought.view.account.activity.BlogPreview', {
	extend: 'Ext.Component',
	alias: ['widget.activity-preview-blog', 'widget.activity-preview-PersonalBlogEntry'],

	requires: ['NextThought.util.Time'],

	cls: 'activity-blog-preview',

	renderTpl: Ext.DomHelper.markup([
		{cls:'header', cn:[
			{tag: 'img', cls:'avatar', src: '{avatarURL}'},
			{ cls: 'meta', cn: [
				{cls:'title', html:'{title: ellipsis(150)}'},
				{cls:'meta-tag', cn:[
					{tag:'span', cls:'name', html:'by: {name: ellipsis(60)}'},
					{tag:'span', html:'{time}'}
				]},
				{cls:'body', html:'{body}'},
				{cls:'counts', cn:[
					{tag:'span', cls: 'link comment', html:'{commentCount} Comment{[values.commentCount===1 ? "" : "s"]}'},
					{tag:'span', cls: 'link likes', html:'{likeCount} Like{[values.likeCount===1 ? "" : "s"]}'}
				]}
			]}
		]}
	]),

	renderSelectors: {
		title: '.title',
		commentCountEl: '.counts .comment',
		likeCountEl: '.counts .likes'
	},

	initComponent: function(){
		this.callParent(arguments);

		var me = this,
			headline = me.record.get('headline'),
			body = Ext.String.format('{0}', Ext.String.ellipsis(headline.getBodyText(),250,true)),
			lastModified = me.record.get('Last Modified'),
			timeDiff = TimeUtils.timeDifference(Ext.Date.now(), lastModified);

		me.renderData = Ext.apply(me.renderData||{},{
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			title: headline.get('title'),
			time: timeDiff,
			body: body,
			commentCount:me.record.get('PostCount'),
			likeCount:me.record.get('LikeCount')
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
