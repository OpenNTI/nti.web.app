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
				{ cls: 'path', html:'forums / {board} / {forum}' },
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
					{ cls: 'body', html: '{body}' },
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


	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',

		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer',

		pathEl: '.path',
		subjectEl: '.subject',
		itemEl: '.item',

		commentsEl: '.comments',

		flagEl: '.foot .flag',
		deleteEl: '.foot .delete'
	},


	beforeRender: function(){
		var me = this, rd, r = me.record,
			h = r.get('headline'),
			username = me.record.get('Creator');

		me.callParent(arguments);

		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		rd.headline = h.getData();
		rd.date = Ext.Date.format(h.get('CreatedTime'),'F j, Y');
		h.compileBodyContent(me.setBody,me);

		UserRepository.getUser(username, function(u){
			me.user = u;
			rd.avatarURL = u.get('avatarURL');
			rd.Creator = u.getName();
			if(me.rendered){
				//oops...we resolved later than the render...update elements
				me.avatarEl.setStyle({backgroundImage:'url('+rd.avatarURL+');'});
				me.nameEl.update(rd.Creator);
			}
		});

	},


	afterRender: function(){
		this.callParent(arguments);


	},


	setBody: function(text){
		if(!this.rendered){
			this.renderData.body = text;
			return;
		}
		this.bodyEl.update(text);
	}

});
