Ext.define('NextThought.view.profiles.parts.ActivityItemReply',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: ['NextThought.util.Content'],
	alias: 'widget.profile-activity-item-reply',
	defaultType: 'profile-activity-item-reply',

	renderSelectors: {
		noteBody: '.reply',
		avatar: '.avatar',
		editEl: '.reply-options .edit',
		flagEl: '.reply-options .flag',
		deleteEl: '.reply-options .delete'
	},

	afterRender: function(){
		var D = Ext.dom.Element.DISPLAY;
		this.flagEl.setVisibilityMode(D);
		this.editEl.setVisibilityMode(D);
		this.deleteEl.setVisibilityMode(D);

		try{
			if(!this.up('profile-activity-item').isExpanded()){
				this.mon( this.replyButton, 'click', this.shouldRevealReplies, this);
			}
		}
		catch(e){
			console.warn('ActivityItemReply was not in an ActivityItem');
		}

		this.callParent(arguments);
		this.mon( this.deleteEl, 'click', this.onDelete, this);
		this.mon( this.editEl, 'click', this.onEdit, this);
	},

	shouldRevealReplies: function(){
		this.mun( this.replyButton, 'click', this.shouldRevealReplies, this);

		var activityItem = this.up('profile-activity-item');
		if(!activityItem || activityItem.isExpanded()){ return; }
		activityItem.replyToId = this.record.getId();
		activityItem.fireEvent('reveal-replies');
	},

	setRecord: function(){
		this.callParent(arguments);

		if(!this.rendered){return;}

		if(isMe(this.record.get('Creator'))){ this.flagEl.hide(); }
		else {
			this.editEl.hide();
			this.deleteEl.hide();
			this.flagEl.addCls('last');
		}
	}

},function(){

	this.prototype.renderTpl = Ext.DomHelper.markup([{
		cls: 'reply profile-activity-reply-item',
		cn: [
			{ cls: 'avatar' },
			{ cls: 'meta', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite-spacer' },
					{ cls: 'like' }]},
				{ tag: 'span', cls: 'name' },' ',
				{ tag: 'span', cls: 'time' }
			]},
			{ cls: 'body' },
			{ cls: 'respond',
				cn: [
					{
						cls: 'reply-options',
						cn: [
							{ cls: 'reply', html: 'Reply' },
							{ cls: 'edit', html: 'Edit' },
							{ cls: 'flag', html: 'Report' },
							{ cls: 'delete', html: 'Delete' }
						]
					},
					TemplatesForNotes.getEditorTpl()
				]
			}
		]
	},{
		id: '{id}-body',
		cls: 'note-replies',
		tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
	}]);
});
