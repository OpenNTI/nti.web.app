const Ext = require('@nti/extjs');

const DISCUSSION_ASSIGNMENT = 'discussion-assignment';
const PLAIN_ASSIGNMENT = 'plain-assignment';

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.CreateMenu', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.create-assignment-menu',
	cls: 'create-assignment-menu',
	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		height: 50,
		plain: true
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({cls: 'discussion', text: 'Discussion Assignment', assignmentType: DISCUSSION_ASSIGNMENT, listeners: {
			scope: this,
			'click': (item) => {
				this.onDiscussionAssignmentCreate(item);
			}
		}});
		this.add({cls: 'plain', text: 'Assignment', assignmentType: PLAIN_ASSIGNMENT, listeners: {
			scope: this,
			'click': (item) => {
				this.onPlainAssignmentCreate(item);
			}
		}});
	},

});
