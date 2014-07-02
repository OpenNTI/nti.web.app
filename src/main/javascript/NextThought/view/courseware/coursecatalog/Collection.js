Ext.define('NextThought.view.courseware.coursecatalog.Collection', {
	extend: 'NextThought.view.store.Collection',
	alias: 'widget.course-catalog-collection',

	//hidden: true,//start hidden
	courseList: true,
	store: 'courseware.AvailableCourses',
	cls: 'courses available-catalog',


	entryTpl: Ext.DomHelper.markup({
		cls: '{inGrid} item {Class:lowercase} {enrolled:boolStr("activated")} {isChanging:boolStr("changing")} row-{rows} col-{cols}',
		'data-qtip': '{Title:htmlEncode}', cn: [
			{ cls: 'cover', style: { backgroundImage: 'url({thumbnail})' }},
			{ tag: 'tpl', 'if': 'enrolled', cn: [
				{cls: 'enrollment', cn: [
					{cls: 'enrollment-text', html: '{enrolledText}'}
				]}
			]},
			{ cls: 'meta', cn: [
				{ cls: 'courseName', html: '{ProviderUniqueID}' },
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author', html: '{author}' },
				{ cls: 'description', html: '{Description}'}
			]}
		]
	}),


	prepareData: function(data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments)),
			instructors = record.get('Instructors'),
			name = instructors && instructors[0].get('Name'),
			isOpen = record.get('isOpen');

		i.author = name;
		i.isCourse = true;
		i.enrolledText = isOpen ? 'Enrolled (Non-Credit)' : 'Enrolled (For Credit)';

		return i;
	},


	handleSelect: function(selModel, record) {
		selModel.deselect(record);
	},


	onItemClick: function(rec, node, index, e) {
		if (e.getTarget('.changing')) {
			e.stopPropagation();
			return false;
		}
	}
});
