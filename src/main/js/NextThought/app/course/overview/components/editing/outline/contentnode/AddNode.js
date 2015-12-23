Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.AddNode', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-new-node',

	cls: 'new-node lesson',

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
			this.editor.onCancel = this.onCancel.bind(this);
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
			this.showEditor();	
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


	showEditor: function(){
		this.inlineEditorEl.show();
		if (this.editor.setSuggestTitle) {
			this.editor.setSuggestTitle();
		}
	},


	onSave: function(e){
		var record = this.getNewRecord(),
			shouldNavigate = e.getKey() === e.ENTER,
			me = this;

		if (!this.isValid()) {
			return Promise.reject();
		}

		if (!this.parentRecord) {
			return Promise.reject();
		}

		return this.doSave(record, shouldNavigate);
	},


	isValid: function() {
		if (this.editor.isValid && !this.editor.isValid()) {
			if (this.editor.showError) {
				this.editor.showError();
			}
			return false;
		}
		return true;
	},


	doSave: function(record, navigate) {
		var me = this;

		return this.parentRecord.appendContent(record && record.getData())
				.then(function(rec) {				
					if (navigate) {
						me.hideEditor();
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

					record.syncWith(rec);
					return rec;
				});
	},


	onCancel: function(e){
		this.hideEditor();
	},


	hideEditor: function(){
		if (this.inlineEditorEl) {
			this.inlineEditorEl.hide();
		}
	},


	getNewRecord: function(){
		var data = {
				'title': this.editor.getValue(),
				'ContentNTIID': null
			};
		
		return new NextThought.model.courses.navigation.CourseOutlineContentNode(data);
	}

});