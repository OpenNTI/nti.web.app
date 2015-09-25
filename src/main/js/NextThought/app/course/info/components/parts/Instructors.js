export default Ext.define('NextThought.app.course.info.components.parts.Instructors', {
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
				{ cls: 'photo', style: {backgroundImage: 'url({photo})'}},
				{ cls: 'wrap', cn: [
					{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Instructors.instructors}}}' },
					{ cls: 'name', html: '{Name}' },
					{ cls: 'title', html: '{JobTitle}'}
				] }
			]}
		]}), {
		//template functions
		});

		me.callParent([config]);
	},


	initComponent: function() {
		this.callParent(arguments);
		this.bindStore(this.buildStore());
	},


	buildStore: function() {
		var ifo = this.getInfo(),
			data = ((ifo && ifo.get('Instructors')) || []).slice(),
			photo = '{0}instructor-photos/{1}.png',
			root = ifo.getAssetRoot() || '/no-root/';

		data.forEach(function(o, i) {
			var url = Ext.String.format(photo, root, Ext.String.leftPad(i + 1, 2, '0'));

			o.set('photo', url);
			Service.request({method: 'HEAD', url: url}).fail(o.set.bind(o, 'photo', User.BLANK_AVATAR));
		});

		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogInstructorInfo',
			data: data
		});
	},
	
	afterRender: function(){
	    this.callParent(arguments);
	    //Our parent doesn't participate in ext layout so if our store is
	    //bound when the view is hidden or collapsed the view is never initially rendered
	    //(assuming a later layout pass will trigger the rendering).  Therefore force
	    //view view to render here.
	    this.refresh();
	}
});
