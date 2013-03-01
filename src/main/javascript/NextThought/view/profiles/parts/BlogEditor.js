Ext.define('NextThought.view.profiles.parts.BlogEditor',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-editor',

	requires:['NextThought.view.annotations.note.EditorActions'],

	cls: 'blog-editor',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'editor active',
			cn:[{
				cls: 'main',
				cn:[{
					cls: 'title',
					cn:[{tag:'input', type:'text', placeholder: 'My Next Thought...'}]
				},{
					cls: 'aux',
					cn:[
						{cls: 'action publish', 'data-qtip': 'Publish'},
						{cls: 'action share'},
						{cls: 'tags'}
					]
				},{
					cls: 'toolbar',
					cn: [{
						cls: 'left',
						cn: [{cls: 'action bold', 'data-qtip': 'Bold'},
							{cls:'action italic', 'data-qtip': 'Italic'},
							{cls:'action underline', 'data-qtip': 'Underline'}]
					}]
				},{
					cls: 'content',
					contentEditable: true,
					tabIndex: 1,
					unselectable: 'off',
					cn: [{ //inner div for IE
						html: '&#8203;' //default value (allow the cursor in to this placeholder div, but don't take any space)
					}]
				}]
			},{
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [{cls: 'action whiteboard', 'data-qtip': 'Create a whiteboard'}]
				},{
					cls: 'right',
					cn: [{cls:'action save', html: 'Save'},{cls:'action cancel', html: 'Cancel'}]
				}]
			}]
		}
	]),


	renderSelectors: {
		editor: '.editor',
		cancelEl: '.action.cancel',
		saveEl: '.action.save'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['save-post']);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.editorActions = new NoteEditorActions(this,this.editor);

		this.mon(this.saveEl,'click', this.onSave, this);
		this.mon(this.cancelEl,'click', this.onCancel, this);
	},


	onSave: function(e){
		e.stopEvent();
		var v = this.editorActions.getValue();
		//console.debug('Save:',v);
		//If new there will not be a record on this, it will be undefined
		this.fireEvent('save-post',this, this.record, v.title, v.tags, v.body, v.publish);
	},


	onSaveSuccess: function(){
		this.destroy();
	},


	onSaveFailure: function(){

	},


	onCancel: function(e){
		e.stopEvent();

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});
