Ext.define('NextThought.view.profiles.parts.ForumActivityItem', {
	extend: 'Ext.container.Container',
	alias: [
		'widget.profile-activity-communityheadlinetopic-item',
		'widget.profile-forum-activity-item'
	],

	mixins:{
		topicActions: 'NextThought.mixins.ForumTopicLinks'
	},

	ui: 'activity',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'topic profile-activity-item',
			cn:[
				{ cls: 'path' },
				{ cls:'item', cn:[
					{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'} },
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject', html: '{title}' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link', html: '{Creator}'},
							{tag: 'span', cls: 'separator', html: ' '},
							{tag: 'span', cls: 'time', html:'{date}'},
							{tag: 'span', cls: 'separator', html: ' &middot; '},
							{tag: 'span', cls: 'shared-to link', html: 'Private'}
						]}
					]},
					{ cls: 'body' },
					{
						cls: 'foot',
						cn: [
							{ cls: 'comments', 'data-label': ' Comments', html: ' ' },
							{ cls: 'flag', html: 'Report' },
							{ cls: 'delete', html: 'Delete' }
						]
					}]
				}
			]
		},{
			id: '{id}-body',
			cls: 'topic-replies',
			tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
		},{
			cls: 'respond', cn: {
			cn: [ {
				cls: 'reply-options',
				cn: [
					{ cls: 'reply', html: 'Add a comment' }
				]
			} ]}
		}
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
			rd.Creator = u.getName();
			if(me.rendered){
				//oops...we resolved later than the render...update elements
				console.debug('TODO: update elements');
			}
		});
	}

});
