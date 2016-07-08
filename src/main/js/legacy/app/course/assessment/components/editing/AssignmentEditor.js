const Ext = require('extjs');
const {Editor} = require('nti-assignment-editor');
require('legacy/overrides/ReactHarness');

require('legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.editing.AssignmentEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.assignment-editor',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		const {pageSource} = this;

		this.EditorCmp = this.add({
			xtype: 'react',
			component: Editor,
			NTIID: this.assignmentId,
			pageSource: {
				getPagesAround : () => {
					return {
						next: pageSource.next && {
							title: pageSource.nextTitle,
							ref: '#nextPage'
						},
						prev: pageSource.previous && {
							title: pageSource.previousTitle,
							ref: '#prevPage'
						},
						index: pageSource.currentIndex,
						total: pageSource.total
					};
				}
			},
			onDeleted: () => this.gotoRoot(),
			gotoRoot: () => this.gotoRoot()
		});
	},


	afterRender () {
		this.callParent(arguments);

		this.el.dom.style.paddingTop = '20px';

		this.mon(this.el, 'click', (e) => this.onClick(e));
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
	}
});
