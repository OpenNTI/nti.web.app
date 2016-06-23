const Ext = require('extjs');
const {Editor} = require('nti-assignment-editor');
const ReactHarness = require('legacy/overrides/ReactHarness');

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

		this.EditorCmp = this.add(new ReactHarness({
			component: Editor,
			NTIID: this.assignmentId
		}));
	},


	afterRender () {
		this.callParent(arguments);

		this.el.dom.style.paddingTop = '20px';
	},


	onBack () {

	},


	gotoAssignment (/*ntiid, title*/) {

	}
});
