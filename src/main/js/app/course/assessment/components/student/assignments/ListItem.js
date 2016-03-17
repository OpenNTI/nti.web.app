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
		var me = this;

		me.statusCmp = new NextThought.app.course.assessment.components.AssignmentStatus({
			renderTo: me.statusEl,
			assignment: me.assignment,
			history: me.history,
			onEditorOpen: function() {
				me.addCls('editor-open');
			},
			onEditorClose: function() {
				me.removeCls('editor-open');
			}
		});

		me.on('destroy', me.statusCmp.destroy.bind(me.statusCmp));
	},


	onItemClick: function(e) {
		if (this.navigateToItem && this.assignment && !e.getTarget('.status-container')) {
			this.navigateToItem(this.assignment);
		}
	}
});
