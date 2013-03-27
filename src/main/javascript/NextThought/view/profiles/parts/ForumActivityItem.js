Ext.define('NextThought.view.profiles.parts.ForumActivityItem', {
	extend: 'Ext.container.Container',
	alias: [
		'widget.profile-activity-communityheadlinetopic-item',
		'widget.profile-forum-activity-item'
	],

	requires: [
		'NextThought.editor.Editor'
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
							{ cls: 'comments', 'data-label': ' Comments',
								html: '{PostCount} Comment{[values.PostCount!=1?\'s\':\'\']}' },
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
		deleteEl: '.foot .delete',
		replyEl: '.reply',
		replyBoxEl: '.respond > div',
		respondEl: '.respond'
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

		var box = this.replyBoxEl;


		this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.respondEl});

		this.mon(this.replyEl,'click',this.showEditor,this);

		box.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.mon(this.editor,{
			scope: this,
			'activated-editor':Ext.bind(box.hide,box,[false]),
			'deactivated-editor':Ext.bind(box.show,box,[false]),
			'no-body-content': function(editor,bodyEl){
				editor.markError(bodyEl,'You need to type something');
				return false;
			}
		});

	},


	showEditor: function(){
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
	},


	setBody: function(text){
		if(!this.rendered){
			this.renderData.body = text;
			return;
		}
		this.bodyEl.update(text);
	}

});
