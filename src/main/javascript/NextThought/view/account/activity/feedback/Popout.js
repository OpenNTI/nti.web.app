Ext.define('NextThought.view.account.activity.feedback.Popout', {
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.activity-popout-userscourseassignmenthistoryitemfeedback'],

	statics: {

		popupAfterResolvingParent: function(record, el, viewRef, anchor, cb) {
			record.getSubmission();
			record.getCourse();
			this.popupNow.apply(this, arguments);
		}

	}
},function() {
	this.popupNow = this.popup;
	this.popup = this.popupAfterResolvingParent;
});
