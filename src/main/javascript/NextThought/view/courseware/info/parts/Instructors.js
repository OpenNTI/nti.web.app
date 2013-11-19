Ext.define('NextThought.view.courseware.info.parts.Instructors', {
	extend: 'Ext.view.View',
	alias: 'widget.course-info-instructors',
	ui: 'course-info',
	cls: 'course-info-instructors',

	itemSelector: '.instructor',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'instructor {[(values.hasProfile && "has-profile")||""]}', cn: [
			{ cls: 'photo', style: {backgroundImage: 'url({photo})'}},
			{ cls: 'wrap', cn: [
				{ cls: 'label', html: 'Course Instructor' },
				{ cls: 'name', html: '{Name}' },
				{ cls: 'title', html: '{JobTitle}'}
			] }
		]}
	]})),

	config: {
		info: null
	},

	initComponent: function() {
		this.callParent(arguments);
		this.bindStore(this.buildStore());
	},


	buildStore: function() {
		var ifo = this.getInfo(),
			i = ((ifo && ifo.get('Instructors')) || []).slice(),
			locInfo = ifo && ifo.locationInfo,
			store;

		Ext.each(i, function(o, i, a) {
			try {
				o = a[i] = o.data || o;
				if (!/^data:image/i.test(o.defaultphoto)) {
					o.defaultphoto = getURL(locInfo.root + o.defaultphoto);
				}
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		});

		store = new Ext.data.Store({
				model: 'NextThought.model.courseware.CourseCatalogInstructorInfo',
				data: i
			});

		function update(u) {

			var instructor;
			if (!u.Unresolved) {
				instructor = store.findRecord('Username', u.getId(), 0, false, false, true);
				if (!instructor) {
					console.warn('This SHOULD NOT happen! Could not find instructor that I just queried for...', u, store);
					return;
				}

				instructor.set({
					hasProfile: true,
					photo: u.get('avatarURL'),
					associatedUser: u
				});
			}
		}

		UserRepository.getUser(Ext.Array.clean(Ext.Array.pluck(i, 'username')), function(u) {
			Ext.each(u, update);
		});

		return store;
	}
});
