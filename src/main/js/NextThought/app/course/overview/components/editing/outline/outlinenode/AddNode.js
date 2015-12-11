Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.AddNode', {
	extend: 'NextThought.app.course.overview.components.editing.outline.contentnode.AddNode',
	alias: 'widget.overview-editing-new-unit-node',

	cls: 'new-node unit',

	showEditor: function(){
		this.inlineEditorEl.show();
		if (this.ownerCt) {
			this.ownerCt.el.addCls('editor-open');
		}

		if (this.editor.setSuggestTitle) {
			this.editor.setSuggestTitle();
		}
	},


	hideEditor: function(){
		this.inlineEditorEl.hide();
		if (this.ownerCt) {
			this.ownerCt.el.removeCls('editor-open');
		}
	},


	getNewRecord: function(){
		var data = {
				'title': this.editor.getValue(),
				'ContentNTIID': null
			};

		return new NextThought.model.courses.navigation.CourseOutlineNode(data);
	}

});