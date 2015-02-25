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

		return this.callParent([options]);
	},

	/**
	 * Find a record with the same assignment id as given
	 * @param  {NTIID} assignmentId Assignment to look up
	 * @return {HistoryItem}        history item for the assignment
	 */
	__getEntryForAssignment: function(assignmentId) {
		var range = this.getRange() || [],
			entry;

		range.forEach(function(item) {
			if (item.get('AssignmentId') === assignmentId) {
				entry = item;
			}
		});

		return entry;
	},


	fillInHistories: function() {
		var me = this;

		me.suspendEvents();

		me.assignments.each(function(assignment) {
			var entry = me.__getEntryForAssignment(assignment.getId());

			//if its a no submit assignment filter it out
			if (assignment.isNoSubmit()) {
				if (entry) {
					me.remove(entry);
				}
			} else if (entry) {
				entry.set('item', assignment);
				me.__replaceWithCachedInstance(entry);
			} else if (!assignment.doNotShow()) {
				me.add(me.assignments.createPlaceholderHistoryItem(assignment, me.student));
			}
		});

		me.resumeEvents();
		me.fireEvent('refresh');
	},


	__replaceWithCachedInstance: function(record) {
		var index = this.indexOf(record);

		this.remove(record);

		record = this.HistoryItemCache.getRecord(record);

		this.insert(index, record);
	}
});
