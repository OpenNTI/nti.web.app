Ext.define('NextThought.view.annotations.note.Templates',{
	singleton: true,

	getNoteEditorTpl: function(){
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
	}


},function(){
	window.TemplatesForNotes = this;
});
