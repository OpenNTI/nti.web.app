Ext.define('NextThought.editor.Editor',{
	extend: 'Ext.Component',
	alias: 'widget.nti-editor',

	enableShareControls:false,
	enablePublishControls:false,
	enableTextControls:false,
	enableTabs:false,
	enableTitle:false,
	enableWhiteboards:false,

	saveButtonLabel: 'Save',
	cancelButtonLabel: 'Cancel'

	//TODO: refactor editor & editorActions into this component and renderTo placeholder divs where they once were
});
