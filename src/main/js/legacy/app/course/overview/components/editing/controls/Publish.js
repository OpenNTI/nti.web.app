const Ext = require('extjs');
const {Publish} = require('@nti/web-commons');

const Actions = require('../Actions');

require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Publish', {
	extend: 'NextThought.ReactHarness',
	alias: 'widget.overview-editing-controls-publish',

	localeContext: 'lesson',

	constructor (config) {
		this.callParent([{...config, component: Publish}]);
		this.EditingActions = new Actions();

		this.PUBLISH_ACTIONS = {
			'PUBLISH': () => this.savePublish(),
			'DRAFT': () => this.saveDraft()
		};
	},

	getProps () {
		return {
			onChange: (...args) => this.onSave(...args),
			localeContext: this.localeContext,
			value: this.resolveValue()
		};
	},


	resolveValue () {
		const {record: node, contents: lesson} = this;

		const isNodePublished = node && node.isPublished && node.isPublished();
		const isLessonPublished = lesson && lesson.isPublished && lesson.isPublished();
		const lessonPublishDate = lesson && lesson.get('publishBeginning');
		const hasPublishDatePassed = lesson && lesson.hasPublishDatePassed && lesson.hasPublishDatePassed();


		if (isNodePublished && ((isLessonPublished && !lessonPublishDate) || hasPublishDatePassed))	 {
			return Publish.States.PUBLISH;
		}
		else if (!isNodePublished && !isLessonPublished) {
			return Publish.States.DRAFT;
		}
		else if (isNodePublished && lessonPublishDate) {
			return new Date(lessonPublishDate);
		}
		else {
			console.warn('Not expected. The node should be published if its lesson is published. ', node, lesson);
		}
	},


	onSave (value) {
		const action = this.PUBLISH_ACTIONS[value];
		let work = action
			? action()
			: (value instanceof Date)
				? this.saveSchedule(value)
				: null;

		if (work) {
			work = work
				.then(() => {
					this.setProps({value: this.resolveValue()});
				})
				.catch(reason => {
					//Cleanup reason to not be an ExtJS object...
					return Promise.reject(reason);
				});
		}

		return work;
	},

	savePublish () {
		const me = this;

		return Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publish(me.contents)
		]);
	},

	saveDraft () {
		const me = this;

		return Promise.all([
			me.EditingActions.unpublish(me.record),
			me.EditingActions.unpublish(me.contents)
		]);
	},

	saveSchedule (value) {
		const me = this;

		if (!value) { return; }

		return Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publishOnDate(me.contents, value)
		]);
	}
});
