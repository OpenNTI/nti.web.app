Ext.define('NextThought.model.courseware.CourseCatalogEntry', {
	alternateClassName: 'NextThought.model.courseware.CourseCatalogLegacyEntry',
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseware.coursecataloglegacyentry',
	requires: ['NextThought.model.converters.Date'],
	mixins: {
		PresentationResources: 'NextThought.mixins.PresentationResources'
	},

	fields: [
		{ name: 'Credit', type: 'arrayItem', persist: false },
		{ name: 'Description', type: 'string', persist: false },
		{ name: 'Duration', type: 'string', persist: false },
		{ name: 'Instructors', type: 'arrayItem', persist: false },
		{ name: 'Prerequisites', type: 'auto', persist: false },
		{ name: 'ProviderDepartmentTitle', type: 'string', persist: false },
		{ name: 'ProviderUniqueID', type: 'string', persist: false },
		{ name: 'Schedule', type: 'auto', persist: false },
		{ name: 'StartDate', type: 'ISODate', persist: false },
		{ name: 'EndDate', type: 'ISODate', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Video', type: 'string', persist: false },
		{ name: 'Preview', type: 'bool' },
		{ name: 'enrolled', type: 'bool' },


		{ name: 'DCCreator', type: 'auto' },
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },

		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator'},

		{ name: 'PlatformPresentationResources', type: 'auto' },

		{ name: 'contributors', type: 'auto' },
		{ name: 'creators', type: 'auto' },
		{ name: 'description', type: 'string' },
		{ name: 'publisher', type: 'string' },
		{ name: 'subjects', type: 'auto' },
		{ name: 'title', type: 'string' },

		//ui data
		{ name: 'isOpen', type: 'bool'},
		{ name: 'isAdmin', type: 'bool'},
		{ name: 'isChanging', type: 'bool', convert: function(v, rec) {
			return rec.get('enrolled') && v;
		}},

		//Legacy
		{ name: 'Communities', type: 'auto', persist: false },
		{ name: 'ContentPackageNTIID', type: 'string', persist: false },
		{ name: 'icon', type: 'string', mapping: 'LegacyPurchasableThumbnail' },//These look backwards, they are not... and are ONLY for fallback
		{ name: 'thumb', type: 'string', mapping: 'LegacyPurchasableIcon' }
	],


	constructor: function() {
		this.callParent(arguments);
		wait().then(this.__setImage.bind(this));
	},


	__setImage: function() {
		var me = this;
		me.getImgAsset('landing')
				.then(function(url) { me.set('icon', url); });
		me.getImgAsset('thumb')
				.then(function(url) { me.set('thumb', url); });
	},


	isActive: function() {
		return Boolean(this.get('enrolled'));
	},

	isExpired: function() {
		var d, s;
		try {
			d = new Date().getTime() - (new Duration(this.get('Duration')).inSeconds() * 1000);
			s = this.get('StartDate').getTime();
			return d > s;
		} catch (e) {}

		return false;
	},


	findByMyCourseInstance: function() {

		var myCoursInstance = this.getLink('CourseInstance');

		return function(instance) {
			var i = instance.get('CourseInstance') || instance;
			return myCoursInstance === getURL(i.get('href'));
		};
	},


	fireAcquisitionEvent: function(eventSource, callback) {
		return eventSource.fireEvent('show-enrollment', this, callback);
	},


	getSemester: function() {
		var start = this.get('StartDate'),
			month = start.getMonth(),
			s = getString('months')[month + 1];

		return s;
	}
});

