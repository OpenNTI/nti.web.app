Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		//toolbar
		{
			cls: 'toolbar',
			cn: [
				{ cls: 'right controls', cn: [
					{ cls: 'page', cn: [
						{ tag: 'span', html: '{page}'}, ' of ', {tag: 'span', html: '{total}'}
					] },
					{ cls: 'up' },
					{ cls: 'down' }
				] },
				//path (bread crumb)
				{
					cn: [
						{ tag: 'span', cls: 'path part root', html: 'Assignments'},
						{ tag: 'span', cls: 'path part current', html: '{assignmentTitle}'}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			cn: [
				{ cls: 'title', html: '{assignmentTitle}' },
				{
					cls: 'subtitle',
					cn: [
						{ tag: 'span', cls: 'due', html: 'Due {due:date("l F j, Y")}'},
						{ tag: 'span', cls: 'link', html: 'Request a Change'}
					]
				}
			]
		},
		{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),

	items: [
		{
			xtype: 'grid',
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
			sealedColumns: true,
			enableColumnHide: false,
			enableColumnMove: false,
			enableColumnResize: false,
			columns: {
				ui: 'course-assessment',
				plain: true,
				border: false,
				frame: false,
				items: [
						   { text: 'Student', dataIndex: 'name', flex: 1, renderer: function(v) {
							   return this.studentTpl.apply(v);
						   } },
						   { text: 'Completed', dataIndex: 'completed', width: 80, renderer: function(v) {
							   return '';
						   } },
						   { text: 'Score', dataIndex: 'Grade', width: 70 },
						   { text: 'Feedback', dataIndex: 'feedback', width: 140, renderer: function(value) {
							   return value ? (value + ' Comments') : '';
						   } }
					   ].map(function(o) {
							return Ext.applyIf(o, {
								ui: 'course-assessment',
								border: false,
								sortable: true,
								menuDisabled: true
							});
						})
			},

			listeners: {
				sortchange: function(ct, column) { ct.up('grid').markColumn(column); },
				selectionchange: function(sm, selected) { sm.deselect(selected); },
				viewready: function(grid) {
					grid.mon(grid.getView(), 'refresh', function() {
						grid.markColumn(grid.down('gridcolumn[sortState]'));
					});
				}
			},

			markColumn: function(c) {
				var cls = 'sortedOn', el = this.getEl();
				if (el) {
					el.select('.' + cls).removeCls(cls);
					if (c) {
						Ext.select(c.getCellSelector()).addCls(cls);
					}
				}
			},

			studentTpl: Ext.DomHelper.createTemplate({})
		}],

	beforeRender: function() {
		this.callParent();
		this.renderData = Ext.apply(this.renderData || {}, {
			assignmentTitle: this.assignmentTitle,
			due: this.due,
			page: this.page,
			total: this.total
		});
	}
});
