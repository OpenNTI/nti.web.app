const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');

const AssignmentStatus = require('../AssignmentStatus');

const InlineEditor = require('./editing/InlineEditor');

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.AssignmentStatus',
	{
		extend: 'Ext.Component',
		alias: 'widget.course-assignment-status',

		statics: {
			setActiveMenu: function (menu) {
				this.activeMenu = menu;
			},

			getActiveMenu: function () {
				return this.activeMenu;
			},

			closeActiveMenu: function () {
				if (this.activeMenu && this.activeMenu.closeDueDateEditor) {
					this.activeMenu.closeDueDateEditor();
					delete this.activeMenu;
				}
			},
		},

		cls: 'assignment-status-container',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'labels-container',
				cn: [
					{ cls: 'required-container' },
					{ cls: 'status-container' },
				],
			},
			{ cls: 'menu-container' },
		]),

		renderSelectors: {
			statusEl: '.status-container',
			requiredEl: '.required-container',
			menuContainer: '.menu-container',
		},

		afterRender: function () {
			this.callParent(arguments);

			this.updateStatus();

			this.mon(this.assignment, 'update', this.updateStatus.bind(this));

			if (this.assignment.getDateEditingLink()) {
				this.addCls(['editable']);

				this.mon(
					this.statusEl,
					'click',
					this.toggleDueDateEditor.bind(this)
				);
			}
		},

		setAssignment: function (assignment) {
			this.assignment = assignment;
			this.updateStatus();
		},

		setHistory: function (history) {
			this.history = history;
			this.updateStatus();
		},

		setStatus: function (status) {
			this.status = Ext.DomHelper.markup({
				cls: 'assignment-status',
				cn: [{ cls: 'status-item due', html: status }],
			});

			if (this.rendered) {
				this.updateStatus();
			}
		},

		disableEditing: function () {
			this.addCls('disabled');
		},

		enableEditing: function () {
			this.removeCls('disabled');
		},

		updateStatus: function () {
			var me = this,
				assignment = me.assignment,
				history = me.history?.getMostRecentHistoryItem
					? me.history.getMostRecentHistoryItem()
					: me.history || null,
				completed = history?.get?.('completed'),
				grade = history?.get?.('Grade'),
				status =
					me.status ||
					AssignmentStatus.getStatusHTML({
						due: assignment.getDueDate(),
						start: assignment.get('availableBeginning'),
						completed:
							!assignment.getDateEditingLink() && completed,
						maxTime: assignment.isTimed && assignment.getMaxTime(),
						duration: assignment.isTimed && history?.getDuration(),
						isExcused: grade?.get('IsExcused'),
						isNoSubmitAssignment:
							assignment.isNoSubmit() ||
							history?.isSyntheticSubmission(),
						isDraft: assignment.isDraft(),
					});

			me.statusEl.dom.innerHTML = status;

			if (assignment.get('CompletionRequired')) {
				me.requiredEl.dom.innerHTML =
					'<div class="required-label">required</div>';
			}

			wait(100).then(function () {
				delete me.status;
			});
		},

		addDueDateEditor: function () {
			this.dueDateEditor = new InlineEditor({
				assignment: this.assignment,
				onSave: this.closeDueDateEditor.bind(this),
				onCancel: this.closeDueDateEditor.bind(this),
				renderTo: this.menuContainer,
			});

			this.on(
				'destroy',
				this.dueDateEditor.destroy.bind(this.dueDateEditor)
			);
		},

		dueDateEditorVisible: function () {
			if (!this.el) {
				return false;
			}

			return this.el.hasCls('menu-open');
		},

		showDueDateEditor: function () {
			var me = this;

			if (me.self.getActiveMenu() !== me) {
				me.self.closeActiveMenu();
			}

			me.self.setActiveMenu(me);

			if (!me.dueDateEditor) {
				me.addDueDateEditor();
			}

			if (me.el) {
				me.el.addCls('menu-open');
			}

			if (me.onEditorOpen) {
				me.onEditorOpen();
			}
		},

		closeDueDateEditor: function (savedAssignment) {
			if (this.el) {
				this.el.removeCls('menu-open');
				this.el.removeCls('allow-overflow');
			}

			if (this.onEditorClose) {
				this.onEditorClose(savedAssignment);
			}
		},

		toggleDueDateEditor: function (e) {
			if (e.getTarget('.disabled')) {
				return;
			}

			e.stopEvent();

			if (this.el.hasCls('menu-open')) {
				this.closeDueDateEditor();
			} else {
				this.showDueDateEditor();
				setTimeout(() => {
					this.el.addCls('allow-overflow');
				}, 500);
			}
		},
	}
);
