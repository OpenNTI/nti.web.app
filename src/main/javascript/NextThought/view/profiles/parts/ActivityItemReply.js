Ext.define('NextThought.view.profiles.parts.ActivityItemReply',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: ['NextThought.util.Content'],
	alias: 'widget.profile-activity-item-reply',
	defaultType: 'profile-activity-item-reply',

	renderSelectors: {
		noteBody: '.reply',
		avatar: '.avatar'
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
