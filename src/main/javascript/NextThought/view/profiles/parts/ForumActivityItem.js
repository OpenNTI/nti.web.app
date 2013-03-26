Ext.define('NextThought.view.profiles.parts.ForumActivityItem', {
	extend: 'Ext.Component',
	alias: ['widget.profile-activity-communityheadlinetopic-item', 'widget.profile-forum-activity-item'],

	mixins:{
		topicActions: 'NextThought.mixins.ForumTopicLinks'
	},

	ui: 'activity',
	cls: 'discussion-event',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
		{ cls: 'meta', cn:[
			{ cls: 'title', html: '{headline.title}' },
			{ cls: 'counts', cn:[
				{ tag: 'span', cls:'link comment-count', html: '{PostCount} Comment{[values.PostCount===1 ? "" : "s"]}', 'data-target':'comments' },
				{ tag: 'span', cls:'link likes', html: '{LikeCount} Like{[values.LikeCount===1 ? "" : "s"]}' },
				{ tag: 'span', html: '{date}'}
			] }
		]}
	]),

	constructor: function(){
		this.callParent(arguments);
		this.mixins.topicActions.constructor.call(this);
	},

	beforeRender: function(){
		var me = this, rd, r = me.record,
			username = me.record.get('Creator');

		me.callParent(arguments);

		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		rd.headline = rd.headline.getData();
		rd.date = Ext.Date.format(r.get('headline').get('CreatedTime'),'F j, Y');

		UserRepository.getUser(username, function(u){
			me.user = u;
			rd.avatarURL = u.get('avatarURL');
			rd.name = u.getName();
			if(me.rendered){
				//oops...we resolved later than the render...re-render
				me.renderTpl.overwrite(me.el,rd);
			}
		});
	}

});
