Ext.define('NextThought.app.course.overview.components.editing.outline.InlineEditor', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-inline-editor',
	
	statics: {
		getTypes: function(){
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType,
				types: []
			}
		}
	},

	cls: 'inline-editor',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'field', cn: [
			{tag: 'input', name: 'title', value: '{defaultValue}', autocomplete: '{autocomplete}'}
		]}
	]),


	renderSelectors: {
		inputEl: '.field input[name=title]'
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			defaultValue: this.getSuggestedNodeTitle(),
			autocomplete: this.autocomplete || 'off'
		});
	},


	getSuggestedNodeTitle: function(){
		var childrenCount = (this.parentRecord.get('Items') || []).length, childType;

		if (this.parentRecord) {
			if (this.parentRecord._depth === 0) {
				childType = 'Unit';
			}
			else if (this.parentRecord._depth === 1){
				childType = 'Lesson';
			}
			
			if (childType) {
				return childType + (childrenCount + 1);
			}
		}

		return "";
	},


	afterRender: function(){
		this.callParent(arguments);
		var me = this;

		this.mon(this.inputEl, {
			'keyup': this.onKeyup.bind(this)
		});

		wait()
			.then(function(){
				me.inputEl.dom.select();
			});
	},


	onKeyup: function(e){
		var record;
		if (e.getKey() === e.ENTER) {
			if (this.onSave) {
				this.onSave(e);	
			}
		}
		if (e.getKey() === e.ESC) {
			if (this.onCancel) {
				this.onCancel(e);
			}
		}
		if (this.inputEl.dom.value !== null && this.inputEl.dom.value.length > 0) {
			this.clearError();
		}
	},


	getValue: function(){
		return this.inputEl.getValue();
	},


	setSuggestTitle: function(){
		this.inputEl.dom.value = this.getSuggestedNodeTitle();
		this.inputEl.dom.select();
	},


	isValid: function() {
		return !Ext.isEmpty(this.getValue());
	},


	showError: function() {
		this.inputEl.addCls('error');
	},


	clearError: function() {
		if (this.inputEl.hasCls('error')) {
			this.inputEl.removeCls('error');
		}
	}
});
