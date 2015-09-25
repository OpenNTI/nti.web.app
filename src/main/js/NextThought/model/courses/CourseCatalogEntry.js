export default Ext.define('NextThought.model.courses.CourseCatalogEntry', {
	alternateClassName: 'NextThought.model.courses.CourseCatalogLegacyEntry',
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courses.coursecataloglegacyentry',
	statics: {
		mimeType: 'application/vnd.nextthought.courses.coursecataloglegacyentry'
	},
	requires: [
		'NextThought.model.converters.Date',
		'NextThought.model.courses.EnrollmentOptions',
		'NextThought.model.courses.CourseCreditLegacyInfo',
		'NextThought.model.courses.CourseCatalogInstructorInfo'
	],
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
		{ name: 'DisableOverviewCalendar', type: 'bool', persist: false},

		{name: 'EnrollmentOptions', type: 'singleItem', persist: false},

		{ name: 'NTI_FiveminuteEnrollmentCapable', type: 'bool', persist: false },
		{ name: 'NTI_CRN', type: 'string', persist: false },
		{ name: 'NTI_Term', type: 'string', persist: false },

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
		{ name: 'background', type: 'string', persis: false},

		//Legacy
		{ name: 'Communities', type: 'auto', persist: false }
	],


	constructor: function() {
		this.callParent(arguments);
		//this.onceAssetsLoaded = wait().then(this.__setImage.bind(this));
	},

	onceAssestsLoadedPromise: function() {
		if (!this.onceAssetsLoaded) {
			this.onceAssetsLoaded = wait().then(this.__setImage.bind(this));
		}
		return this.onceAssetsLoaded;
	},

	getAuthorLine: function() {
		function makeName(instructor) {
			return instructor.get('Name');
		}


		function notTA(instructor) {
			return !taRe.test(instructor.get('JobTitle'));
		}

		var taRe = (/Teaching Assistant/i),
			instructors = this.get('Instructors'),
			creator = this.get('author');

		return creator || (instructors && instructors.filter(notTA).map(makeName).join(', ')) || '';
	},


	__setImage: function() {
		var me = this;
		me.getBackgroundImage();
		me.getThumbImage();
		me.getIconImage();
	},


	__ensureAsset: function(key, asset) {
	   var existing = null,
	   me = this;

	   if (!this.__assetPromises) {
		   this.__assetPromises = {};
		}

		existing = this.__assetPromises[key];
		if (!existing) {
		   existing = this.getImgAsset(asset || key).then(function(url) { me.set(key, url); }, me.set.bind(me, [key, null]));
		   this.__assetPromises[key] = existing;
		}

		return existing;
	},


	getBackgroundImage: function() {
		return this.getAsset('background');
	},


	getThumbImage: function() {
		return this.getAsset('thumb');
	},


	getIconImage: function() {
		return this.getAsset('icon', 'landing');
	},


	getAsset: function(key, asset) {
		return this.__ensureAsset(key, asset).then(this.get.bind(this, key));
	},


	//update the enrollment scopes enrollment
	setEnrolled: function(enrolled) {
		var options = this.get('EnrollmentOptions'),
			open = options && options.getType('OpenEnrollment'),
			fmaep = options && options.getType('FiveminuteEnrollment'),
			store = options && options.getType('StoreEnrollment');

		//if we are dropping the course, we won't update our scopes
		//when the library reloads so set all the options as not enrolled
		if (!enrolled) {
			if (open) {
				open.IsEnrolled = false;
				options.setType('OpenEnrollment', open);
			}

			if (fmaep) {
				fmaep.IsEnrolled = false;
				options.setType('FiveminuteEnrollment', fmaep);
			}

			if (store) {
				store.IsEnrolled = false;
				options.setType('StoreEnrollment', store);
			}
		}

		this.set({
			'enrolled': enrolled,
			'EnrollmentOptions': options
		});
	},

	/**
	 * Mark the appropriate enrollment option as enrolled
	 * @param  {String} status the scope they are enrolled in
	 * @param  {Boolean} open   if they are open enrolled
	 * @param  {Boolean} admin  if they are an admin
	 */
	updateEnrollmentState: function(status, open, admin) {
		var options = this.get('EnrollmentOptions'),
			openOption = options && options.getType('OpenEnrollment'),
			fmaepOption = options && options.getType('FiveminuteEnrollment'),
			storeOption = options && options.getType('StoreEnrollment'),
			isOpen = open;

		//assume the option option isn't enrolled in
		openOption.IsEnrolled = false;
		if ((status === 'Open' || status === 'Public') && open && openOption) {
			openOption.IsEnrolled = true;
		//stripe and fmaep enrollment will both be in the forcreditnondegree scope
		} else if (status === 'ForCreditNonDegree' || status === 'Purchased') {
			if (storeOption && storeOption.IsEnrolled) {
				//treat the stripe enrollment as open
				isOpen = true;

				//if we have a fmaep option but are enrolled in store enrollment
				//set the fmaep as unavailable for now
				//TODO: Figure out how to remove this
				if (fmaepOption) {
					fmaepOption.isAvailable = false;
				}
			} else if (fmaepOption && fmaepOption.IsEnrolled) {
				//treat the fmaep enrollment as for credit
				isOpen = false;
			}
		}

		options.setType('OpenEnrollment', openOption);
		options.setType('FiveminuteEnrollment', fmaepOption);
		options.setType('StoreEnrollment', storeOption);

		this.set({
			'isOpen': isOpen,
			'isAdmin': admin,
			'EnrollmentOptions': options
		});
	},


	getTitle: function(isOnly) {
		return isOnly ? this.get('title') : '';
	},


	getEnrollmentOption: function(name) {
		var options = this.get('EnrollmentOptions');

		return options && options.getType(name);
	},


	getEnrollmentType: function() {
		var isEnrolled = this.get('enrolled'),
			isAdmin = this.get('isAdmin'),
			isOpen = this.get('isOpen'),
			enrollment;

		if (!isEnrolled) {
			enrollment = null;
		} else if (isAdmin) {
			enrollment = 'Admin';
		} else if (!isOpen) {
			enrollment = 'ForCredit';
		} else {
			enrollment = 'Open';
		}

		return enrollment;
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

	isArchived: function() {
		var end = this.get('EndDate'),
			now = new Date();
		return end && end.getTime() < now.getTime();
	},

	isCurrent: function() {
	   return !(this.isUpcoming() || this.isArchived());
	},

	isUpcoming: function() {
		var start = this.get('StartDate'),
			now = new Date();

		return start && start.getTime() > now.getTime();
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


	getSemesterBadge: function() {
		var start = this.get('StartDate'),
			year = start.getFullYear(),
			semester = this.getSemester();

		return semester + ' ' + year;
	},



	setEnrollmentLinks: function(links) {
		var me = this;

		(links || []).forEach(function(link) {
			if (link.rel === 'fmaep.pay.and.enroll') {
				me.enrollandpayLink = link.href;
			}
		});
	},


	getEnrollAndPayLink: function() {
		return this.enrollandpayLink || this.getLink('fmaep.pay.and.enroll');
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

		a.setAttribute('href', './paymentcomplete');
		a.search = query;

		return a.href;
	}
});
