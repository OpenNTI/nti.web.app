var Ext = require('extjs');
var StoreCollection = require('../../store/Collection');


module.exports = exports = Ext.define('NextThought.app.course.catalog.Collection', {
	extend: 'NextThought.app.store.Collection',
	alias: 'widget.course-catalog-collection',

	//hidden: true,//start hidden
	courseList: true,
	store: 'courseware.AvailableCourses',
	cls: 'courses available-catalog',


	tpl: Ext.DomHelper.markup([
		{ cls: 'library-group-header', cn: [
			{cls: 'label', html: '{label}'},
			{cls: 'group', html: '{group}'}
		]},
		{ cls: 'grid', cn: { tag: 'tpl', 'for': 'items', cn: ['{entry}']} }
	]),


	entryTpl: Ext.DomHelper.markup({
		cls: '{inGrid} item {Class:lowercase} {enrolled:boolStr("activated")} row-{rows} col-{cols}',
		'data-qtip': '{Title:htmlEncode}', cn: [
			{ cls: 'cover', cn: [
				{tag: 'img', src: '{icon}'}
			]},
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


	prepareData: function (data, index, record) {

		var i = Ext.Object.chain(this.callParent(arguments)),
			isOpen = record.get('isOpen'),
			isAdmin = record.get('isAdmin');

		i.author = record.getAuthorLine();
		i.isCourse = true;
		i.enrolledText = isAdmin ? 'Administering' : isOpen ? 'Not For Credit' : 'For Credit';

		if (record.getIconImage) {
			record.getIconImage();
		}

		return i;
	},


	collectData: function () {
		var data = this.callParent(arguments);

		data.label = this.label;
		data.group = this.group;

		return data;
	},


	handleSelect: function (selModel, record) {
		selModel.deselect(record);
	},


	onItemClick: function (rec, node, index, e) {
		this.fireEvent('show-course-detail', rec);
		e.stopPropagation();
		return false;
	}
});
