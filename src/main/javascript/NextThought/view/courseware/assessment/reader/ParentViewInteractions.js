Ext.define('NextThought.view.courseware.assessment.reader.ParentViewInteractions', {

	notifyParentView: function() {
		if (this.parentView) {
			this.parentView.fireEvent('reader-closing', this);
		}
	},


	constructor: function() {
		this.on('destroy', 'notifyParentView');
		if (this.parentView) {
			this.parentView.fireEvent('reader-initializing', this);
		}
	}
});
