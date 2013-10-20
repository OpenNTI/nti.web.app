Ext.define('NextThought.view.course.info.parts.Instructors', {
	extend: 'Ext.view.View',
	alias: 'widget.course-info-instructors',
	ui: 'course-info',
	cls: 'course-info-instructors',

	itemSelector: '.instructor',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'instructor {[(values.hasProfile && "has-profile")||""]}', cn: [
			{ cls: 'photo', style: {backgroundImage:'url({photo})'}},
			{ cls: 'wrap', cn: [
				{ cls: 'label', html: 'Course Instructor' },
				{ cls: 'name', html: '{name}' },
				{ cls: 'title', html: '{title}'}
			] }
		]}
	]})),

	initComponent: function(){
		this.callParent(arguments);
		this.bindStore(this.buildStore());
	},


	buildStore: function() {
		var i = this.info && this.info.instructors,
			locInfo = this.info && this.info.locationInfo,
			store;

		Ext.each(i, function(o){
			o.defaultphoto = getURL(locInfo.root + o.defaultphoto);
		});

		store = new Ext.data.Store({
				fields: [
					{ name: 'username', type: 'string' },
					{ name: 'hasProfile', type: 'bool', defaultValue: false },
					{ name: 'photo', type: 'string', mapping: 'defaultphoto' },
					{ name: 'title', type: 'string' },
					{ name: 'name', type: 'string' },
					{ name: 'associatedUser', type: 'auto' }
				],
				data: i
			});

		function update(u){
			var instructor;
			if (!u.Unresolved) {
				instructor = store.findRecord('username', u.getId(), 0, false, false, true);
				if(!instructor){
					console.warn('This SHOULD NOT happen! Could not find instructor that I just queried for...',u,store);
					return;
				}

				instructor.set({
					hasProfile: true,
					photo: u.get('avatarURL'),
					associatedUser: u
				});
			}
		}

		UserRepository.getUser(Ext.Array.pluck(i, 'username'), function(u) {
			Ext.each(u,update);
		});

		return store;
	}
});
