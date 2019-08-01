const Ext = require('@nti/extjs');

const AssignmentStatus = require('../../AssignmentStatus');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.student.assignments.ListItem', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignment-list-item',
	cls: 'item',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'tpl', 'if': 'canEdit', cn: [
			{cls: 'edit-assignment', html: 'Edit'}
		]},
		{ cls: 'name-container', cn: [
			{ tag: 'span', cls: 'name', html: '{name:htmlEncode}'}
		]},
		{ cls: 'status-container'}
	]),

	renderSelectors: {
		statusEl: '.status-container'
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.addClasses();

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.assignment.get('title'),
			canEdit: this.assignment.canEdit()
		});
	},

	addClasses: function () {
		const cls = [];
		const attempt = this.history && this.history.getMostRecentHistoryItem();
		const completed = attempt && attempt.get('completed');

		this.assignment.getInterfaceInstance()
			.then((assignment) => {
				if (assignment.CompletedItem && !assignment.CompletedItem.Success) {
					this.addCls('failed');
				}
			});

		if (!this.assignment.isOpen()) {
			cls.push('closed');
		}

		if (completed && completed > new Date(0)) {
			cls.push('completed');
		}

		if (this.assignment.canEdit()) {
			cls.push('editable');
		}


		this.addCls(cls);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.addStatusCmp();

		this.mon(this.el, 'click', this.onItemClick.bind(this));


		this.assignment.on('update', () => this.updateItem());
	},

	updateItem () {
		if(!this.rendered || !this.assignment.hasLink('edit')) {
			return;
		}

		const nameEl = this.el.down('.name');
		const pointsEl = this.el.down('.name-container .points');

		if (nameEl) {
			nameEl.update(this.assignment.get('title'));
		}

		if (pointsEl) {
			pointsEl.update(this.assignment.getTotalPointsLabel());
		}

		this.removeCls(['closed', 'completed', 'nosubmit', 'late', 'editable']);
		this.addClasses();
	},

	addStatusCmp: function () {
		var me = this;

		me.statusCmp = new AssignmentStatus({
			renderTo: me.statusEl,
			assignment: me.assignment,
			history: me.history,
			onEditorOpen: function () {
				if (me.rendered) {
					me.addCls('editor-open');
				}
			},
			onEditorClose: function () {
				if (me.rendered) {
					me.removeCls('editor-open');
				}
			}
		});

		me.on('destroy', me.statusCmp.destroy.bind(me.statusCmp));
	},

	onItemClick: function (e) {
		if (this.editAssignment && this.assignment && e.getTarget('.edit-assignment')) {
			this.editAssignment(this.assignment);
		} else if (this.navigateToItem && this.assignment && !e.getTarget('.status-container')) {
			this.navigateToItem(this.assignment);
		}
	}
});
