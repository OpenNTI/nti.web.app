Ext.define('NextThought.view.annotations.note.Templates',{
	singleton: true,

	getEditorTpl: function(){
		return {
			cls: 'editor',
			cn:[{
				cls: 'main',
				cn:[{
					cls: 'toolbar',
					cn: [{
						cls: 'left',
						cn: [{cls: 'action bold'},{cls:'action italic'},{cls:'action underline'}]
					},{
						cls: 'right',
						cn: [{cls: 'action share', html: 'Only Me'}]
					}]
				},{
					cls: 'content',
					contentEditable: true,
					unselectable: 'off',
					html: '&nbsp;'
				}]
			},{
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [{cls: 'action whiteboard'}]
				},{
					cls: 'right',
					cn: [{cls:'action save', html: 'Save'},{cls:'action cancel', html: 'Cancel'}]
				}]
			}]
		};
	},


	getReplyOptions: function(){
		return {
			cls: 'reply-options',
			cn: [
				{ cls: 'reply', html: 'Reply' },
				{ cls: 'chat', html: 'Start a chat' },
				{ cls: 'more', title: 'Options', html: '&nbsp;',
					cn:[{
						tag: 'ol',
						cn: [
							{ tag: 'li', cls: 'share', html: 'Share' },
							{ tag: 'li', cls: 'flag',  html: 'Flag for Moderation' },
							{ tag: 'li', cls: 'add-contact', html: 'Add to Contacts' },
							{ tag: 'li', cls: 'follow', html: 'Follow {name}' },
							{ tag: 'li', cls: 'block', html: 'Block {name}' },
							{ tag: 'li', cls: 'delete', html: 'Delete' }
						]
					}]
				}
			]

		};
	}


},function(){
	window.TemplatesForNotes = this;
});
