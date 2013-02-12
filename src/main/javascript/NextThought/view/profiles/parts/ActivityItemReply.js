Ext.define('NextThought.view.profiles.parts.ActivityItemReply',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: ['NextThought.util.Content'],
	alias: 'widget.profile-activity-item-reply',
	defaultType: 'profile-activity-item-reply',

	renderSelectors: {
		avatar: '.avatar'
	}

},function(){

	this.prototype.renderTpl = Ext.DomHelper.markup([{
		cls: 'note',
		cn: [
			{ cls: 'avatar' },
			{ cls: 'meta', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite-spacer' },
					{ cls: 'like' }]},
				{ tag: 'span', cls: 'name' },
				{ tag: 'span', cls: 'time' }
			]},
			{ cls: 'body' },{
				cls: 'respond',
				cn: [
					TemplatesForNotes.getReplyOptions(),
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
