Ext.define('NextThought.view.courseware.assessment.Performance', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-performance',
	ui: 'course-assessment',
	cls: 'course-performance',

	requires: [
		'NextThought.chart.Grade',
		'NextThought.chart.GradePerformance'
	],


	items: [
		{
			cls: 'course-performance-header',
			xtype: 'container',
			layout: 'auto',
			items: [
				{ xtype: 'grade-chart' },
				{ xtype: 'box', cls: 'label', html: 'Cumulative Grade' },
				{ xtype: 'grade-performance-chart' },
				{ xtype: 'box', cls: 'label', autoEl: {
					cn: [
						{ tag: 'span', cls: 'you', html: 'You'},
						{ tag: 'span', cls: 'avg', html: 'Class AVG'}
					]
				} }
			]
		},
		{xtype: 'course-assessment-assignment-group', title: 'All Grades', items: [
			//{xtype: 'grid'}
		]}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.chartGrade = this.down('grade-chart');
		this.chartPerformance = this.down('grade-performance-chart');
		this.grid = this.down('grid');

		this.chartGrade.setGrade(80);

		var store = new Ext.data.Store({
		    fields: [
		        {name: 'id', type: 'int'},
		        {name: 'AverageGrade', type: 'int'},
		        {name: 'Grade', type: 'int'}
		    ],
		    data: [
		        { id: 0, Grade: 77, AverageGrade: 61},
		        { id: 1, Grade: 17, AverageGrade: 57},
		        { id: 2, Grade: 74, AverageGrade: 38},
		        { id: 3, Grade: 24, AverageGrade: 69},
		        { id: 4, Grade: 1, AverageGrade: 75},
		        { id: 5, Grade: 8, AverageGrade: 43},
		        { id: 6, Grade: 45, AverageGrade: 48},
		        { id: 7, Grade: 95, AverageGrade: 79},
		        { id: 8, Grade: 5, AverageGrade: 19},
		        { id: 9, Grade: 57, AverageGrade: 19},
		        { id: 10, Grade: 48, AverageGrade: 31},
		        { id: 11, Grade: 2, AverageGrade: 78},
		        { id: 12, Grade: 69, AverageGrade: 92},
		        { id: 13, Grade: 50, AverageGrade: 68},
		        { id: 14, Grade: 57, AverageGrade: 36},
		        { id: 15, Grade: 48, AverageGrade: 24},
		        { id: 16, Grade: 92, AverageGrade: 58},
		        { id: 17, Grade: 70, AverageGrade: 64},
		        { id: 18, Grade: 72, AverageGrade: 83},
		        { id: 19, Grade: 48, AverageGrade: 64},
		        { id: 20, Grade: 28, AverageGrade: 1},
		        { id: 21, Grade: 23, AverageGrade: 12},
		        { id: 22, Grade: 63, AverageGrade: 91},
		        { id: 23, Grade: 32, AverageGrade: 40},
		        { id: 24, Grade: 26, AverageGrade: 29},
		        { id: 25, Grade: 30, AverageGrade: 64},
		        { id: 26, Grade: 33, AverageGrade: 65},
		        { id: 27, Grade: 40, AverageGrade: 27},
		        { id: 28, Grade: 88, AverageGrade: 95},
		        { id: 29, Grade: 94, AverageGrade: 85}
		    ]
		});

		this.chartPerformance.setStore(store);
	}
});
