const Ext = require('extjs');
const {Publish} = require('nti-web-commons');
const Actions = require('../Actions');
require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Publish', {
	extend: 'NextThought.ReactHarness',
	alias: 'widget.overview-editing-controls-publish',

	constructor (config) {
		this.callParent([{...config, component: Publish}]);
		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();

		this.PUBLISH_ACTIONS = {
			'PUBLISH': () => this.savePublish(),
			'DRAFT': () => this.saveDraft()
		};
	},

	getProps () {
		return {
			onChange: (...args) => this.onSave(...args),
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
		let action = this.PUBLISH_ACTIONS[value];
		if (action) {
			return action();
		}

		if(value instanceof Date) {
			return this.saveSchedule(value);
		}

		console.warn('Error unexpected value saving publish controls');
	},

	savePublish () {
		const me = this;

		Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publish(me.contents)
		])
		.then(() => {
			if (me.saveSuccess) {
				me.saveSuccess();
			}
		})
		.catch(() => {
			me.saveError();
		});
	},

	saveDraft () {
		const me = this;

		Promise.all([
			me.EditingActions.unpublish(me.record),
			me.EditingActions.unpublish(me.contents)
		])
		.then(() => {
			if (me.saveSuccess) {
				me.saveSuccess();
			}
		})
		.catch(() => {
			me.saveError();
		});
	},

	saveSchedule (value) {
		const me = this;

		if (!value) { return; }

		Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publishOnDate(me.contents, value)
		])
		.then(() => {
			if (me.saveSuccess) {
				me.saveSuccess();
			}
		})
		.catch(() => {
			me.saveError();
		});
	},

	saveSuccess () {
		this.componentInstance.closeMenu();
		this.setState({ value: this.resolveValue(), changed: false });
	},


	saveError () {
		this.setState({ value: this.resolveValue(), changed: false });
	}
});
