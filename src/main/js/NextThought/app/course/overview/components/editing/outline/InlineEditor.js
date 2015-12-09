Ext.define('NextThought.app.course.overview.components.editing.outline.InlineEditor', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-inline-editor',

	mixins: {
		OrderedContents: 'NextThought.mixins.OrderedContents'
	},
	
	statics: {
		getTypes: function(){
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
				types: []
			}
		}
	},

	cls: 'inline-editor',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'field', cn: [
			{tag: 'input', cls: 'title', name: 'title', value: '{defaultValue}'}
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
		var childrenCount = (this.parentRecord.get('Items') || []).length;
		return 'Lesson ' + (childrenCount + 1);
	},


	afterRender: function(){
		this.callParent(arguments);
		var me = this;

		this.mon(this.inputEl, {
			'keyup': this.onKeyup.bind(this)
		});

		if (this.defaultValue) {
			wait()
				.then(function(){
					me.inputEl.dom.select();
				});
		}
	},


	onKeyup: function(e){
		var record;
		if (e.getKey() === e.ENTER) {
			if (this.onSave) {
				record = new NextThought.model.courses.navigation.CourseOutlineNode();
				record.set('title', this.inputEl.getValue());
				this.onSave(record);
			}
		}
	}


	onSave: function(record){
 		// TODO 
 		console.log(arguments);
	},
	

});