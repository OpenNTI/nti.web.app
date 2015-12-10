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
			{tag: 'input', name: 'title', value: '{defaultValue}'}
		]}
	]),


	renderSelectors: {
		inputEl: '.field input[name=title]'
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			defaultValue: this.getSuggestedNodeTitle()
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
	},


	getValue: function(){
		return this.inputEl.getValue();
	},


	setSuggestTitle: function(){
		this.inputEl.dom.value = this.getSuggestedNodeTitle();
		this.inputEl.dom.select();
	}
});
