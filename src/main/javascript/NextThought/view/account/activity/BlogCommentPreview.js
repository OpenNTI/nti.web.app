Ext.define('NextThought.view.account.activity.BlogCommentPreview', {
	extend: 'Ext.Component',
	alias: ['widget.activity-preview-comment-blog', 'widget.activity-preview-PersonalBlogComment'],

	cls: 'activity-blog-preview',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn:[{
			tag: 'img', cls:'avatar author', src: '{authorAvatarURL}'},
			{ cls: 'meta', cn: [
				{cls:'title', html:'{title: ellipsis(150)}'},
				{cls:'meta-tag', cn:[
					{tag:'span', cls:'name author', html:'by: {name: ellipsis(60)}'},
					{tag:'span', cls:'authorTime', html:'{authorTime}'}
				]},
				{cls:'body', html:'{body}'},
				{cls:'counts', cn:[
					{tag:'span', cls: 'link commentCount', html:'{commentCount} Comment{[values.commentCount===1 ? "" : "s"]}'},
					{tag:'span', cls: 'link likeCount', html:'{likeCount} Like{[values.likeCount===1 ? "" : "s"]}'}
				]}
			]}
		]},

		{cls:'footer', cn:[
			{tag: 'img', cls:'avatar', src: '{commenterAvatarURL}'},
			{cls:'meta', cn:[
				{cls:'meta-tag', cn:[
					{tag:'span', cls:'name link', html:'{commenterName: ellipsis(60)}'},
					{tag:'span', html:'{commentTime}'}
				]},
				{cls:'body', html:'{commentBody}'}
			]}
		]}
	]),

	renderSelectors: {
		body:'.body',
		authorAvatar: 'img.author',
		title: '.title',
		authorName: '.name.author',
		authorTime:'.authorTime',
		commentCount:'.commentCount',
		likeCount:'.likeCount'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.enableBubble('resize');

		var lastModified = this.record.get('Last Modified'),
			timeDiff = this.record.timeDifference(Ext.Date.now(), lastModified),
			body = Ext.String.format('{0}', Ext.String.ellipsis(this.record.getBodyText(),120,true));

		this.renderData = Ext.apply(this.renderData||{},{
			commenterAvatarURL: this.user.get('avatarURL'),
			commenterName: this.user.getName(),
			commentBody: body,
			commentTime: timeDiff
		});

		this.fillInData();
	},

	fillInData: function(){
		var me = this,
			containerId = this.record.get('ContainerId'), rec = me.record;

		function success(r){
			var headline= r.get('headline'),
				title = headline.get('title'),
				body = Ext.String.format('{0}', Ext.String.ellipsis(headline.getBodyText(),250,true)),
				lastModified = headline.get('Last Modified'),
				timeDiff = headline.timeDifference(Ext.Date.now(), lastModified);

			me.container = r;

			if(me.rendered){
				me.title.update(title);
				me.body.update(body);
				me.authorTime.update(timeDiff);
				me.commentCount.update(r.get('PostCount') + ' Comment' + (r.get('PostCount')=== 1 ? "":"s")) ;
				me.likeCount.update(r.get('LikeCount')+ ' Like'+ (r.get('LikeCount') === 1 ? "":"s"));
			}
			else{
				Ext.apply(me.renderData, {
					title:title,
					body:body,
					authorTime:timeDiff,
					commentCount:r.get('PostCount'),
					likeCount:r.get('LikeCount')
				});
			}

			UserRepository.getUser(r.get('Creator'), function(user){
				if(me.rendered){
					me.authorName.update('By '+user.getName());
					me.authorAvatar.set({'src':user.get('avatarURL')});
				}else{
					Ext.apply(me.renderData, {name: user.getName(), authorAvatarURL: user.get('avatarURL')});
				}
			});

			if(me.rendered){
				Ext.defer( function(){
					me.fireEvent('resize', me, me.getWidth(), me.getHeight());
				}, 1);
			}
		}

		function fail(){
			console.log('there was an error retrieving the object.', arguments);
		}

		$AppConfig.service.getObject(containerId, success, fail, me);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick, this);
	},

	onClick: function(e){
		e.stopEvent();
		var me = this;
		UserRepository.getUser(me.container.get('Creator'),function(u){
			me.fireEvent('navigate-to-blog', u, me.container.get('ID'), me.record.get('ID'));
		});
	}
});
