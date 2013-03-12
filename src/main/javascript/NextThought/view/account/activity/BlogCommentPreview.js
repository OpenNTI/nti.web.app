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
					{tag:'span', cls: 'link commentCount', html:'{commentCount}', 'data-label':' comments'},
					{tag:'span', cls: 'link likeCount', html:'{likeCount}', 'data-label': ' likes'}
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

			rec.container = r;

			if(me.rendered){
				me.title.update(title);
				me.body.update(body);
				me.authorTime.update(timeDiff);
				me.commentCount.update(r.get('PostCount')+me.commentCount.getAttribute('data-label'));
				me.likeCount.update(r.get('LikeCount')+me.likeCount.getAttribute('data-label'));
			}
			else{
				Ext.apply(me.renderData, {
					title:title,
					body:body,
					authorTime:timeDiff,
					commentCount:r.get('PostCount')+' Comments',
					likeCount:r.get('LikeCount')+' Likes'
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
		this.fireEvent('navigate-to-blog', this.user, this.record.container.get('ID'), this.record.get('ID'));
	}
});