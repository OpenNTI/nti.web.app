export default Ext.define('NextThought.app.course.overview.components.editing.content.timeline.TimelineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-timeline-editor',
	
	cls: 'content-editor content-link',
	
	requires: [
		'NextThought.app.course.overview.components.editing.content.timeline.items.Items',
		'NextThought.app.course.overview.components.editing.content.timeline.Actions'
	],
	
	showEditor: function() {
		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord);
		this.TimelineEditorActions = NextThought.app.course.overview.components.editing.content.timeline.Actions.create();
		
		this.addItems();
		
		if (this.record) {
			this.addDeleteButton();
		}
	},
	
	addItems: function() {
		this.itemsCmp = this.add({
			xtype: 'overview-editing-timeline-items',
			record: this.record,
			selectedItems: this.selectedItems,
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord
		});
	},
	
	onSave: function() {
		var parentSelection = this.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			values = this.itemsCmp.getItems && this.itemsCmp.getItems(),
			rec = this.record;

		return this.TimelineEditorActions.saveTimeline(values, rec, originalPosition, currentPosition, this.rootRecord);
	}
});
