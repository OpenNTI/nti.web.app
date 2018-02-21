const Ext = require('extjs');
const {SelectBox} = require('nti-web-commons');

const QuestionSetRef = require('legacy/model/QuestionSetRef');
const AssignmentRef = require('legacy/model/AssignmentRef');

require('legacy/overrides/ReactHarness');
require('../../../parts/QuestionSet');
require('../ListItem');

const REQUIRED = 'Required';
const OPTIONAL = 'Optional';
const DEFAULT = 'Default';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-questionset-listitem',

	statics: {
		isAssessmentWidget: true,
		getSupported: function () {
			return [
				QuestionSetRef.mimeType,
				AssignmentRef.mimeType
			];
		}
	},


	getPreControls: function (record, bundle) {
		const onChange = (value) => {
			// TODO: do something with value, either REQUIRED, OPTIONAL, or DEFAULT
			// once the server API is available
		};

		return [{
			xtype: 'react',
			component: SelectBox,
			value: DEFAULT,	// TODO: pull the actual value from the record
			onChange,
			options: [
				{ label: REQUIRED, value: REQUIRED },
				{ label: OPTIONAL, value: OPTIONAL },
				{ label: DEFAULT, value: DEFAULT }
			]
		}];
	},


	getControls: function (record, bundle) {
		var controls = [this.callParent(arguments)];

		// override to make a wrapper to help properly position the controls with
		// the required select box with wrapper-specific styling
		return {
			xtype: 'container',
			cls: 'controls-wrapper',
			layout: 'none',
			items: controls
		};
	},


	updateRecord: function (record) {
		var me = this;

		me.course.getAssignments()
			.then(function (assignments) {
				me.IsAssignment = assignments.isAssignment(record.get('Target-NTIID'));
				me.assignment = assignments.getItem(record.get('Target-NTIID'));

				me.setRecord(record);
			});
	},


	setUpRecord (record) {
		const target = record.get('Target-NTIID');

		return this.course.getAssignments()
			.then((assignments) => {
				this.IsAssignment = assignments.isAssignment(target);
				this.assignment = assignments.getItem(target);

				if (this.IsAssignment && !this.assignment) {
					this.hide();
				}
			});
	},


	getPreviewType: function () {
		return this.IsAssignment ? 'course-overview-assignment' : 'course-overview-naquestionset';
	},


	doNavigation (config) {
		if (this.navigate) {
			this.navigate(config, null, this.IsAssignment);
		}
	}
});
