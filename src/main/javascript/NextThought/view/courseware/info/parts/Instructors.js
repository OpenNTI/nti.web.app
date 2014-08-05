Ext.define('NextThought.view.courseware.info.parts.Instructors', {
	extend: 'Ext.view.View',
	alias: 'widget.course-info-instructors',
	ui: 'course-info',
	cls: 'course-info-instructors',

	itemSelector: '.instructor',

	config: {
		info: null
	},

	constructor: function(config) {
		var me = this;
		config.tpl = new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
			{ cls: 'instructor', cn: [
				'{%  values.index = Ext.String.leftPad(xindex, 2, "0"); %}',
				{ cls: 'photo', style: {backgroundImage: 'url({[this.getRoot()]}instructor-photos/{index}.png)'}},
				{ cls: 'wrap', cn: [
					{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Instructors.instructors}}}' },
					{ cls: 'name', html: '{Name}' },
					{ cls: 'title', html: '{JobTitle}'}
				] }
			]}
		]}), {
			getRoot: function() {
				return me.root || '/no-root/';
			}
		});

		me.callParent([config]);
	},


	initComponent: function() {
		this.callParent(arguments);
		this.bindStore(this.buildStore());
	},


	buildStore: function() {
		var ifo = this.getInfo();

		this.root = ifo.getAssetRoot();

		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogInstructorInfo',
			data: ((ifo && ifo.get('Instructors')) || []).slice()
		});
	}
});
