Ext.define('NextThought.app.course.assessment.components.AssignmentStatus', {
	extend: 'Ext.Component',
	alias: 'widget.course-assignment-status',

	statics: {
		setActiveMenu: function(menu) {
			this.activeMenu = menu;
		},


		getActiveMenu: function() {
			return this.activeMenu;
		},

		closeActiveMenu: function() {
			if (this.activeMenu && this.activeMenu.closeDueDateEditor) {
				this.activeMenu.closeDueDateEditor();
				delete this.activeMenu;
			}
		}
	},

	requires: [
		'NextThought.app.course.assessment.AssignmentStatus',
		'NextThought.app.course.assessment.components.editing.DueDate'
	],

	cls: 'assignment-status-container',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'assignment-status'},
		{cls: 'menu-container'}
	]),


	renderSelectors: {
		statusEl: '.assignment-status',
		menuContainer: '.menu-container'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.updateStatus();

		if (this.assignment.getLink('edit')) {
			this.addCls(['editable']);

			this.mon(this.el, 'click', this.toggleDueDateEditor.bind(this));
		}
	},


	updateStatus: function() {
		var assignment = this.assignment,
			history = this.history,
			grade = history && history.get && history.get('Grade'),
			status = NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
				due: assignment.getDueDate(),
				completed: history && history.get('completed'),
				maxTime: assignment.isTimed && assignment.getMaxTime(),
				duration: assignment.isTimed && assignment.getDuration(),
				isExcused: grade && grade.get('IsExcused'),
				isNoSubmitAssignment: assignment.isNoSubmit()
			});

		this.statusEl.dom.innerHTML = status;
	},


	addDueDateEditor: function() {
		this.dueDateEditor = new NextThought.app.course.assessment.components.editing.DueDate({
			assignment: this.assignment,
			onSave: this.onDueDateChanged.bind(this),
			renderTo: this.menuContainer
		});

		this.on('destroy', this.dueDateEditor.destroy.bind(this.dueDateEditor));
	},


	showDueDateEditor: function() {
		var me = this;

		if (me.self.getActiveMenu() !== me) {
			me.self.closeActiveMenu();
		}

		me.self.setActiveMenu(me);

		if (!me.dueDateEditor) {
			me.addDueDateEditor();
		}

		me.el.addCls('menu-open');

		me.bodyClickMon = me.mon(Ext.getBody(), 'click', function(e) {
			var el = e.getTarget('assignment-status-container');

			if (!el || el !== me.el.dom) {
				me.closeDueDateEditor();
			}
		});
	},


	closeDueDateEditor: function() {
		this.el.removeCls('menu-open');
		Ext.destroy(this.bodyClickMon);
	},


	toggleDueDateEditor: function(e) {
		e.stopEvent();

		if (this.el.hasCls('menu-open')) {
			this.closeDueDateEditor();
		} else {
			this.showDueDateEditor();
		}
	},


	onDueDateChanged: function() {
		debugger;
	}
});
