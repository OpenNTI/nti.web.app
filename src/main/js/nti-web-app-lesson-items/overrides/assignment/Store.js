/*globals $AppConfig*/
import { Stores } from '@nti/lib-store';
import { getService } from '@nti/web-client';
import BaseModel from 'internal/legacy/model/Base';

async function getHistory(assignmentId, assignments) {
	try {
		const history = await assignments.getHistoryItem(assignmentId, true);

		return history;
	} catch (e) {
		return null;
	}
}

export default class NTIWebAppLessonItemsAssignmentStore extends Stores.BoundStore {
	async load() {
		const { assignment, course } = this.binding;

		if (this.assignment === assignment && this.course === course) {
			return;
		}

		this.assignment = assignment;
		this.course = course;

		this.set({
			loading: true,
			assignment: null,
			history: null,
		});

		try {
			const assignmentId =
				assignment['Target-NTIID'] || assignment.getID();
			const courseModel = BaseModel.interfaceToModel(course);
			const assignmentsModel = await courseModel.getAssignments();
			const assignmentModel = await assignmentsModel.fetchAssignment(
				assignmentId
			);
			const historyModel = await getHistory(
				assignmentId,
				assignmentsModel
			);

			this.set({
				loading: false,
				courseModel,
				assignmentsModel,
				assignmentModel,
				historyModel,
				student: $AppConfig.userObject,
			});
		} catch (e) {
			this.set({
				loading: false,
				error: e,
			});
		}
	}

	async updateHistoryItem(submittedId, historyItemLink) {
		const assignments = this.get('assignmentsModel');

		try {
			const service = await getService();
			const historyRaw = await service.get(historyItemLink);
			const history = await service.getObject(historyRaw);
			const historyModel = BaseModel.interfaceToModel(history);
			const container = await historyModel.resolveFullContainer();

			assignments.updateHistoryItem(submittedId, container);

			this.set({
				historyModel,
			});

			return {
				historyModel,
				container,
			};
		} catch (e) {
			return null;
		}
	}
}
