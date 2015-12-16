Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.AddNode', {
	extend: 'NextThought.app.course.overview.components.editing.outline.contentnode.AddNode',
	alias: 'widget.overview-editing-new-unit-node',

	cls: 'new-node unit',

	requires: [
		'NextThought.app.course.overview.components.editing.Actions'
	],

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
	},


	/**
	 * Handle saving a new unit node.
	 * On top of save new unit node, we would also like to publish them right away. 
	 * That's what we're doing after successfully creating a new unit node.
	 * That behavior may eventually change, in which case this will need to be adjusted too. 
	 * 
	 * @param  {Event} e  Browser click event
	 * @return {Promise}   returns a promise that fulfills after the record is published.
	 */
	onSave: function(e){
		var record = this.getNewRecord(),
			shouldNavigate = e.getKey() === e.ENTER,
			me = this;

		if (!this.EditorActions) {
			this.EditorActions = new NextThought.app.course.overview.components.editing.Actions();
		}

		if (!this.parentRecord) {
			return Promise.reject();
		}

		return this.doSave(record, shouldNavigate)
			.then(function(rec){
				return me.EditorActions.publish(rec);
			});
	}

});