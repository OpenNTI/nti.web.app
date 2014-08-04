Ext.define('NextThought.model.courses.CourseCatalogEntry', {
	alternateClassName: 'NextThought.model.courses.CourseCatalogLegacyEntry',
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courses.coursecataloglegacyentry',
	requires: ['NextThought.model.converters.Date'],
	mixins: {
		PresentationResources: 'NextThought.mixins.PresentationResources'
	},

	fields: [
		{ name: 'ContentPackages', mapping: 'ContentPackageNTIID',
			convert: function(v) { return [v]; } },

		{ name: 'CourseEntryNTIID', type: 'string', persist: false},
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

		{ name: 'NTI_FiveminuteEnrollmentCapable', type: 'bool', persist: false },
		{ name: 'OU_CRN', type: 'string', persist: false },
		{ name: 'OU_Term', type: 'string', persist: false },

		{ name: 'DropCutOff', type: 'ISODate', mapping: 'OU_DropCutOffDate', persist: false },
		{ name: 'EnrollForCreditCutOff', type: 'ISODate', mapping: 'OU_EnrollCutOffDate', persist: false },
		{ name: 'OU_Price', type: 'number', persist: false},

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
		{ name: 'isOpen', type: 'bool', persist: false},
		{ name: 'isAdmin', type: 'bool', persist: false},
		{ name: 'isChanging', type: 'bool', convert: function(v, rec) { return rec.get('enrolled') && v; }},
		{ name: 'icon', type: 'string', mapping: 'LegacyPurchasableThumbnail' },//These look backwards, they are not... and are ONLY for fallback
		{ name: 'thumb', type: 'string', mapping: 'LegacyPurchasableIcon' },

		//Legacy
		{ name: 'Communities', type: 'auto', persist: false }
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


	isEnrolledForCredit: function() {
		return this.isActive() && !this.get('isOpen');
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
		//returns a string that can be compared. NOTE: not for use as a URL!
		function nomnom(href) {
			return (getURL(href) || '').split('/').map(decodeURIComponent).join('/');
		}

		var myCoursInstance = nomnom(this.getLink('CourseInstance'));

		return function(instance) {
			var i = instance.get('CourseInstance') || instance;
			return myCoursInstance === nomnom(getURL(i.get('href')));
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
	},


	setEnrollmentLinks: function(links) {
		var me = this;

		(links || []).forEach(function(link) {
			if (link.rel === 'fmaep.pay') {
				me.creditpaylink = link.href;
			} else if (link.rel === 'fmaep.enroll') {
				me.creditenrolllink = link.href;
			}
		});
	},


	getEnrollForCreditLink: function() {
		return this.creditenrolllink || this.getLink('fmaep.enroll');
	},


	getPaymentLink: function() {
		return this.creditpaylink || this.getLink('fmaep.pay');
	},


	buildPaymentReturnURL: function() {
		var id = this.get('NTIID'),
			params = {
				active: 'library',
				library: {
					paymentcomplete: true,
					cce: id
				}
			},
			query = Ext.Object.toQueryString(params, true),
			a = document.createElement('a');

		a.setAttribute('href', './');
		a.search = query;

		return a.href;
	}
});
