export default Ext.define('NextThought.app.course.enrollment.StateStore', {
	extend: 'NextThought.common.StateStore',


	__Option_Map: {},

	__Options: [],

	requires: [
		'NextThought.app.course.enrollment.options.OpenEnrollment',
		'NextThought.app.course.enrollment.options.FiveminuteEnrollment',
		'NextThought.app.course.enrollment.options.StoreEnrollment',
		'NextThought.app.library.courses.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.addOption(NextThought.app.course.enrollment.options.OpenEnrollment);
		this.addOption(NextThought.app.course.enrollment.options.FiveminuteEnrollment);
		this.addOption(NextThought.app.course.enrollment.options.StoreEnrollment);
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
	},


	getBasePriority: function() {
		return {
			OpenEnrollment: 3,
			StoreEnrollment: 2,
			FiveminuteEnrollment: 1
		};
	},


	addOption: function(option) {
		this.__Option_Map[option.NAME] = option;

		this.__Options.push({
			name: option.NAME,
			base: option.isBase
		});
	},


	getOption: function(name) {
		return this.__Option_Map[name] || {};
	},


	getEnrolledText: function(course) {
		var me = this,
			text = '';

		if (course) {
			me.forEachOption(function(option) {
				var courseOption = course.getEnrollmentOption(option.name);

				if (courseOption && courseOption.IsEnrolled) {
					text = me.getOption(option.name).getEnrolledWording();
				}
			});
		}

		if (!text && course.get('enrolled')) {
			if (course.get('isOpen')) {
				text = getString('course-info.description-widget.open-enrolled');
			} else {
				text = getString('course-info.description-widget.enrolled');
			}
		}

		return text;
	},


	/**
	 * Takes a course and a type of enrollment and returns a list of steps
	 * that have to be completed to enroll in that course.
	 *
	 * @param  {CourseCatalogEntry} course the course we are building the steps for
	 * @param {String} enrollmentType the type of enrollment
	 * @param {String} type a subtype of the enrollment gift, or redeem
	 * @param {Array} config array of strings for the option to parse into the correct state
	 * @return {Array}        an array of steps
	 */
	getEnrollmentSteps: function(course, enrollmentType, type, config) {
		return this.getOption(enrollmentType).buildEnrollmentSteps(course, type, config);
	},


	/*
		Enrollment details are objects with the details about if the enrollment process is open, how long it will be open, when it
		closes, if they have already enrolled in this option and how much it is.

		Enrollment option details look like
		{
			StartDate: Date, //start date of the course
			EndDate: Date, //end date of the course
			Enrolled: String, //null if they aren't enrolled, the name of the option they are enrolled in otherwise
			EnrollStartDate: Date, //then they enrolled in the course
			DateFormat: String, //how the dates should be formatted in the details
			Options: {
				name: A Promise that fulfills with this data or rejects if that option is not available
			}
		}
	 */

	 /**
	  * Returns the details about the different enrollment options
	  *
	  * @param  {CourseCatalogEntry} course         The course we are getting the options for
	  * @return {Promise}                fulfills with information needed to show the enrollment options
	  */
	getEnrollmentDetails: function(course) {
		var p, catalogData = {
					StartDate: course.get('StartDate'),
					EndDate: course.get('EndDate'),
					Enrolled: course.isActive(),
					Options: {}
				}, c;

		if (catalogData.Enrolled) {
			c = this.CourseStore.findCourseBy(course.findByMyCourseInstance());
			p = Promise.resolve(c)
				.then(function(instance) {
					if (instance) {
						catalogData.EnrolledStartDate = instance.get('CreatedTime');
					}
				})
				.fail(function(reason) {
					console.error('Failed to find course instance', reason);
				});
		} else {
			p = Promise.resolve();
		}


		return p
				.then(function() {
					return catalogData;
				})
				.then(this.__fillInOptionDetails.bind(this, course));


	},


	getGiftDetails: function(course) {
		var me = this,
			catalogData = {
				Enrolled: course.isActive()
			};


		return new Promise(function(fulfill, reject) {
			var wording;

			me.forEachOption(function(option) {
				option = me.getOption(option.name);

				if (option.buildGiftOptions) {
					wording = option.buildGiftOptions(course, catalogData);
				}
			});

			fulfill(wording || {});
		});
	},


	__fillInOptionDetails: function(course, catalogData) {
		var me = this;

		this.forEachOption(function(option) {
			var name = option.name;

			catalogData.Options[name] = me.getOption(name).buildEnrollmentDetails(course, catalogData);
		});

		return catalogData;
	},


	//a shortcut for CourseWareUtils.Enrollment.__Options.forEach
	forEachOption: function(fn) {
		this.__Options.forEach(fn);
	}
});