const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');

const DISCUSSION_ASSIGNMENT = 'discussion-assignment';
const PLAIN_ASSIGNMENT = 'plain-assignment';

const t = scoped('nti-web-app.course.assessment.components.CreateMenu', {
	assignment: 'Assignment',
	discussionAssignment: 'Discussion Assignment',
});

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.CreateMenu',
	{
		extend: 'Ext.menu.Menu',
		alias: 'widget.create-assignment-menu',
		cls: 'create-assignment-menu',
		defaults: {
			ui: 'nt-menuitem',
			xtype: 'menuitem',
			height: 50,
			plain: true,
		},

		initComponent: function () {
			this.callParent(arguments);

			this.add({
				cls: 'discussion',
				autoEl: {
					tag: 'div',
					'data-testid': 'create-discussion-assignment-menu-item',
				},
				text: t('discussionAssignment'),
				assignmentType: DISCUSSION_ASSIGNMENT,
				listeners: {
					scope: this,
					click: item => {
						this.onDiscussionAssignmentCreate(item);
					},
				},
			});
			this.add({
				cls: 'plain',
				autoEl: {
					tag: 'div',
					'data-testid': 'create-plain-assignment-menu-item',
				},
				text: t('assignment'),
				assignmentType: PLAIN_ASSIGNMENT,
				listeners: {
					scope: this,
					click: item => {
						this.onPlainAssignmentCreate(item);
					},
				},
			});
		},
	}
);
