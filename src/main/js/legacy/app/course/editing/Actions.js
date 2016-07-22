const Ext = require('extjs');
const ParseUtils = require('../../../util/Parsing');

require('../../../common/Actions');
require('../../../model/conflict/DestructiveChallenge');
require('../../conflict/Actions');

const BEGINNING = 'available_for_submission_beginning';
const ENDING = 'available_for_submission_ending';


module.exports = exports = Ext.define('NextThought.app.course.editing.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.ConflictActions = NextThought.app.conflict.Actions.create();
	},


	__resolveConflict: function (conflict, data) {
		return this.ConflictActions.resolveConflict(conflict, data);
	},


	updateAssignmentPublish (assignment, publish) {
		const isPublished = assignment.isPublishedByState();
		let action;

		if (isPublished && !publish) {
			action = assignment.doUnpublish();
		} else if (!isPublished && publish) {
			action = assignment.doPublish();
		} else {
			action = Promise.resolve();
		}

		return action;
	},


	updateAssignment (assignment, {published, available}, {due}) {
		const now = new Date();
		const currentAvailable = assignment.get('availableBeginning') || null;

		//If we published and nulled out available (i.e publish now), and the assignment is currently available
		//don't unset the available date. This means the assignment was in the schedule state, the schedule date passed,
		//so it moved to published, then the user clicked save without changing it. (I think).
		if (published && !available && currentAvailable < now) {
			available = currentAvailable;
		}

		return this.updateAssignmentPublish(assignment, published)
			.then(() => {
				return this.updateAssignmentDates(assignment, available, due);
			});
	},


	updateAssignmentDates: function (assignment, available, due) {
		const link = assignment.getDateEditingLink();

		if (!link) {
			return Promise.reject('No edit link');
		}

		const currentAvailable = assignment.get('availableBeginning');
		const currentDue = assignment.get('availableEnding');


		let data = {};
		let doSave = false;

		if (available !== currentAvailable) {
			data[BEGINNING] = available;
			doSave = true;
		}

		if (due !== currentDue) {
			data[ENDING] = due;
			doSave = true;
		}

		if (!doSave) {
			return Promise.resolve();
		}

		return Service.put(link, data)
			.then((response) => {
				assignment.syncWithResponse(response);

				return assignment;
			}).catch((response) => {
				var conflict = response && response.status === 409 && response.responseText && ParseUtils.parseItems(response.responseText)[0];

				if (conflict) {
					return this.__resolveConflict(conflict, data)
						.then((conflictResponse) => {
							if (conflictResponse) {
								assignment.syncWithResponse(conflictResponse);
							}

							return assignment;
						});
				}

				return Promise.reject(response);
			});
	}
});
