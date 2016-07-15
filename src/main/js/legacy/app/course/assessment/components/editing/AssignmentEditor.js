const Ext = require('extjs');
const {Editor} = require('nti-assignment-editor');
require('legacy/overrides/ReactHarness');

require('legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.editing.AssignmentEditor', {
	extend: 'Ext.container.Container',//should prob extend the harness like Publish & Calendar did.
	alias: 'widget.assignment-editor',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none', //if you extended the react harness these two configs wouldn't be necessary.
	items: [],


	initComponent () {
		this.callParent(arguments);

		const {pageSource} = this;

		this.EditorCmp = this.add({
			xtype: 'react',
			component: Editor,
			NTIID: this.assignmentId,
			pageSource: new FakePageSource(pageSource),
			onDeleted: () => this.deletedAssignment(),
			gotoRoot: () => this.gotoRoot()
		});
	},


	afterRender () {
		this.callParent(arguments);

		this.el.dom.style.paddingTop = '20px';

		this.mon(this.el, 'click', (e) => this.onClick(e));
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



	gotoRoot () {
		if (this.gotoAssignments) {
			this.gotoAssignments();
		}
	},

	deletedAssignment () {
		const assignments = this.assignments;
		const assignment = assignments || assignments.findItem(this.assignmentId);

		if (assignment) {
			assignment.isDeleted = true;
		}
		this.gotoRoot();
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
