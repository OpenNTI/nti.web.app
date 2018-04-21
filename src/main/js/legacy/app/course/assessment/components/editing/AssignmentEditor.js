const Ext = require('@nti/extjs');
const {Editor} = require('@nti/web-assignment-editor');
const {wait} = require('@nti/lib-commons');
require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.editing.AssignmentEditor', {
	extend: 'Ext.container.Container',//should prob extend the harness like Publish & Calendar did.
	alias: 'widget.assignment-editor',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'full-assignment-editor',

	layout: 'none', //if you extended the react harness these two configs wouldn't be necessary.
	items: [],


	initComponent () {
		this.callParent(arguments);

		const {pageSource} = this;

		this.EditorCmp = this.add({
			xtype: 'react',
			component: Editor,
			assignmentId: this.assignmentId,
			courseId: this.bundle.getId(),
			bundle: this.bundle,
			pageSource: new FakePageSource(pageSource),
			onDeleted: () => this.deletedAssignment(),
			gotoRoot: () => this.gotoRoot(),
			previewAssignment: () => this.gotoPreview()
		});
	},


	afterRender () {
		this.callParent(arguments);

		this.mon(this.el, 'click', (e) => this.onClick(e));
	},


	allowNavigation () {
		if (this.el) {
			this.el.mask('Saving...');
		}

		return wait(1000)
			.then(() => {
				if (this.el) {
					this.el.unmask();
				}
			});
	},


	onRouteActivate () {
		if (this.EditorCmp) {
			this.EditorCmp.onRouteActivate();
		}
	},


	onRouteDeactivate () {
		if (this.EditorCmp) {
			this.EditorCmp.onRouteDeactivate();
		}

		this.updateAssignment();
	},

	/**
	 * Updates the assignment that was passed to the Editor
	 *
	 * If we are passed a record, go ahead and update it.
	 * Also make sure you keep the background record (one belonging to the assignmentCollection)
	 * is updated. They could differ but they are both the same assignment
	 * and we need to make sure they are always in sync.
	 * @return {Null} No Return
	 */
	updateAssignment () {
		const assignment = this.assignment;

		// NOTE: since we want to make sure that the outline that a particular assignment belongs to
		// is updated when we exit the assignment editor, go ahead and refresh the assignments collection.
		// this allows us to place assignments correctly in lessons they belong to.
		if (this.updateAssignments) {
			this.updateAssignments();
		}
		else {
			if (assignment && assignment.isModel && !assignment.isDeleted) {
				assignment.updateFromServer();
			}

			if (this.findAssignment) {
				this.findAssignment(this.assignmentId)
					.then(a =>
						!a.isDeleted
						&& a !== assignment
						&& a.updateFromServer());
			}
		}
	},


	onClick (e) {
		const {target} = e;
		const {hash} = target || {};

		if (hash && hash.indexOf('nextPage') >= 0) {
			e.stopPropagation();
			e.preventDefault();
			this.gotoNextAssignment();
		} else if (hash && hash.indexOf('prevPage') >= 0) {
			e.stopPropagation();
			e.preventDefault();
			this.gotoPrevAssignment();
		}
	},


	gotoPrevAssignment () {
		const {previous, previousTitle} = this.pageSource;

		if (this.gotoAssignment) {
			this.gotoAssignment(previous, previousTitle);
		}
	},


	gotoNextAssignment () {
		const {next, nextTitle} = this.pageSource;

		if (this.gotoAssignment) {
			this.gotoAssignment(next, nextTitle);
		}
	},


	gotoPreview () {
		if (this.previewAssignment && this.assignment) {
			this.previewAssignment(this.assignment.get('NTIID'), this.assignment.get('title'));
		}
	},



	gotoRoot () {
		if (this.gotoAssignments) {
			this.gotoAssignments();
		}
	},

	deletedAssignment () {
		const assignment = this.assignment;

		if (assignment && assignment.isModel && assignment.getId() === this.assignmentId) {
			assignment.isDeleted = true;
		}

		const pending = this.findAssignment
			? this.findAssignment(this.assignmentId)
				.then(a => a.isDeleted = true)
			: Promise.resolve();

		wait.on(pending).then(() => this.gotoRoot());
	}
});


function FakePageSource (pageSource) {
	Object.assign(this, pageSource);

	this.getPagesAround = () => ({
		next: this.next && {
			title: this.nextTitle,
			ref: '#nextPage'
		},
		prev: this.previous && {
			title: this.previousTitle,
			ref: '#prevPage'
		},
		index: this.currentIndex,
		total: this.total
	});
}
