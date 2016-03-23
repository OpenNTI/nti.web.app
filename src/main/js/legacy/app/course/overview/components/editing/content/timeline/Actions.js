var Ext = require('extjs');
var EditingActions = require('../../Actions');
var ModelTimeline = require('../../../../../../../model/Timeline');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.timeline.Actions', {
	extend: 'NextThought.app.course.overview.components.editing.Actions',

	saveTimeline: function(timelines, record, originalPosition, newPosition, root) {
		if (record) {
			return this.__updateSingleTimeline(timelines, record, originalPosition, newPosition, root);		
		}
		
		return this.__createSingleTimeline(timelines, newPosition);
	},

	__updateSingleTimeline: function(timelines, record, originalPosition, newPosition, root) {
		var newTimeline = timelines[0],
			newParent = newPosition.parent,
			oldParent = originalPosition.parent,
			samePosition = newParent === oldParent && originalPosition.index === newPosition.index,
			sameRecord = newTimeline.getId() === record.getId(),
			save;

		//If we are the same record in the same position don't do anything
		if (samePosition && sameRecord) {
			save = Promise.resolve();
		}
		else {
			newTimeline = this.__getTimelineData(newTimeline);
			save = this.__removeAndAdd(record, originalPosition, newTimeline, newPosition, root);
		}
	},

	__createSingleTimeline: function(timelines, newPosition) {
		var values = this.__getTimelineData(timelines[0]);

		return this.__createRecordValues(values, newPosition);
	},

	__getTimelineData: function(timeline){
		return {
			NTIID: timeline && timeline.getId()
		};
	}
});
