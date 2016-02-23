Ext.define('NextThought.app.course.assessment.components.student.assignments.ListItem', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignment-list-item',

	requires: [
		'NextThought.app.course.assessment.components.AssignmentStatus'
	],


	cls: 'item',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'name', html: '{name:htmlEncode}'},
		{ cls: 'status-container'}
	]),


	renderSelectors: {
		statusEl: '.status-container'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.addClasses();

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.assignment.get('title')
		});
	},


	addClasses: function() {
		var cls = [],
			completed = this.history && this.history.get('completed');

		if (!this.assignment.isOpen()) {
			cls.push('closed');
		}

		if (completed && completed > new Date(0)) {
			cls.push('completed');
		}

		this.addCls(cls);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.addStatusCmp();

		this.mon(this.el, 'click', this.onItemClick.bind(this));
	},


	addStatusCmp: function() {
		this.statusCmp = new NextThought.app.course.assessment.components.AssignmentStatus({
			renderTo: this.statusEl,
			assignment: this.assignment,
			history: this.history
		});

		this.on('destroy', this.statusCmp.destroy.bind(this.statusCmp));
	},


	onItemClick: function() {
		if (this.navigateToItem && this.assignment) {
			this.navigateToItem(this.assignment);
		}
	}
});
