Ext.define('NextThought.app.course.overview.components.editing.creation.AddNode', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-new-node',

	cls: 'new-node',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'inline-editor-container'},
		{cls: 'icon {iconCls}'},
		{cls: 'title', html: '{title}'}
	]),


	renderSelectors: {
		inlineEditorEl: '.inline-editor-container',
		addLessonEl: '.title'
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			iconCls: this.iconCls,
			title: this.title
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.addLessonEl, 'click', this.onClick.bind(this));
		this.inlineEditorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.inlineEditorEl.hide();

		if (this.InlineEditor) {
			this.editor = this.InlineEditor.create();
			this.editor.onSave = this.onSave.bind(this);
			this.editor.parentRecord = this.parentRecord;
			
			this.editor.render(this.inlineEditorEl);
		}
	},

	/**
	 * handles a click on the addLesson Button
	 *
	 * Note: If the inline editor is visible, the click action implies that we should save the new node.
	 * However, if the inline editor is hidden, the click action implies that we should show it.
	 * 
	 * @param  {Event} e Browser Event
	 */
	onClick: function(e){
		var me = this;
		if (!this.inlineEditorEl.isVisible()) {
			this.inlineEditorEl.show();
			this.el.addCls('editor-open');
			if (this.editor.setSuggestTitle) {
				this.editor.setSuggestTitle();
			}
		}
		else {
			this.onSave(e)
				.then(function(rec) {
					if (me.afterSave) {
						me.afterSave(rec);
					}
				});
		}		
	},


	onSave: function(e){
		var record = this.getNewRecord(),
			me = this;

		if (!this.parentRecord) {
			return Promise.reject();
		}

		return this.parentRecord.appendContent(record && record.getData())
				.then(function(rec) {
					rec._depth = me.parentRecord._depth + 1;
				
					if (e.getKey() === e.ENTER) {
						if (me.doSelectNode) {
							me.doSelectNode(rec);
						}
					}
					else {
						// Update the suggest node name.
						wait().then(function() {
							if (me.editor.setSuggestTitle) {
								me.editor.setSuggestTitle();
							}
						});	
					}

					return rec;
				});
	},


	getNewRecord: function(){
		var data = {
				'title': this.editor.getValue(),
				'ContentNTIID': null
			};
		
		if (this.parentRecord instanceof NextThought.model.courses.CourseOutline) {
			return new NextThought.model.courses.navigation.CourseOutlineNode(data);
		}
		else if (this.parentRecord instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return new NextThought.model.courses.navigation.CourseOutlineContentNode(data);
		}
	}

});