Ext.define('NextThought.view.courseware.coursecatalog.Collection', {
	extend: 'NextThought.view.store.Collection',
	alias: 'widget.course-catalog-collection',

	hidden: true,//start hidden
	courseList: true,
	store: 'courseware.AvailableCourses',
	cls: 'courses',


	entryTpl: Ext.DomHelper.markup({
		cls: '{inGrid} item {Class:lowercase} {featured:boolStr("featured")} {enrolled:boolStr("activated")} row-{rows} col-{cols}',
		'data-qtip': '{Title:htmlEncode}', cn: [
			{ tag: 'tpl', 'if': 'featured', cn:
				{ cls: 'cover', style: { backgroundImage: 'url({icon})' }}},
			{ tag: 'tpl', 'else': '', cn:
				{ cls: 'cover', style: { backgroundImage: 'url({thumbnail})' }}},
			{ cls: 'meta', cn: [
				{ cls: 'courseName', html: '{Name}' },
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author provider-id', html: '{ProviderUniqueID}' },
				{ cls: 'description', html: '{Description}'}
			]}
		]
	}),


	prepareData: function(data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments));

		i.isCourse = true;

		return i;
	},


	handleSelect: function(selModel, record) {
		selModel.deselect(record);
	}
});
