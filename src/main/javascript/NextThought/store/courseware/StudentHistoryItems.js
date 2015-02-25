Ext.define('NextThought.store.courseware.StudentHistoryItems', {
	extend: 'NextThought.store.courseware.HistoryItems',

	load: function(options) {
		var me = this,
			oldCallBack;

		options = options || {};

		if (options.callback) {
			oldCallBack = options.callback.bind(options.scope || null);
		} else {
			oldCallBack = function() {};
		}

		options.callback = function() {
			oldCallBack.apply(null, arguments);

			me.fillInHistories();
		};

		this.callParent([options]);
	},

	__getEntryForAssignment: function(assignmentId) {
		return false;
	},


	fillInHistories: function() {
		var me = this;

		me.assignments.each(function(assignment) {
			var entry = me.__getEntryForAssignment(assignment.getId());

			if (entry) {
				entry.set('item', assignment);
			} else if (!assignment.doNotShow()) {
				me.add(me.assignments.createPlaceholderHistoryItem(assignment, me.student));
			}
		});
	}
});
