Ext.define('NextThought.util.courseware.options.Base', {
	NAME: '', //the name of the option

	EnrolledWording: '',

	/*
	Enrollment steps are object that contain info about which views/forms users need to fill out before
		they are enrolled in a course.

		Steps look like

		{
			isComplete: function //returns a promise that fulfills if this step is completed, rejects if they need to complete it
			enrollmentOption: Object //the object from the CCE's EnrollmentOptions
			xtype: String //the view to show for this step if empty this step is just a placeholder in the breadcrumb thingy
			name: String //the name that displays in the progress bread crumb thingy
			buttonCfg: Object //the buttons to show in the window, see the documentation in NextThought.view.library.available.CourseWindow
								these should be defined on the components themselves
			complete: function //completes that step takes the cmp to fire events from and data from the ui, returns a promise
			done: function //moves the ui forward after complete is successful
			goBackOnError: Boolean //if there is an error show the previous step
			//other data necessary for the step to complete
		}

	 */

	__stepTpl: {
		xtype: '',
		name: '',
		enrollmentOption: {},
		isActive: false,
		isComplete: function() {},
		comlete: function() {},
		done: function(cmp) {
			cmp.fireEvent('step-completed');
		},
		error: function(cmp) {
			cmp.fireEvent('step-error');
		}
	},

	//make sure the steps have all the functions that need to be on there
	__addStep: function(cfg, steps) {
		steps.push(Ext.applyIf(cfg, this.__stepTpl));
	},


	buildEnrollmentSteps: function(course) {},


	/**
	 * The wording to present to the user for how state this enrollment option is in for the enrollment card.
	 * Each state looks like, no fields are implicitly required here required means the ui
	 * could look weird with out it
	 *
	 * {
	 *		title: String, //required, short description of what this state is
	 *		information: String, //required, longer description of the state, present some options to the user
	 *		warning: String, //red text below the information, ex cutoff for picking this option
	 *		drop: String, //text about how to drop this option
	 *		cls: String, //cls to add the card, we have styles for enrolled, checkbox, pending, rejected, and down
	 *		links: Array, //a list of links to show on this action,
	 *		buttonText: String, //text to show in the button with this option is active
	 * }
	 *
	 * @type {Object}
	 */
	ENROLLMENT_STATES: {},

	DateFormat: 'F j, g:i A T',


	getWording: function(state, data) {
		var text = this.ENROLLMENT_STATES[state],
			prop, key;

		if (!text) {
			console.error('No enrollment state defined', this.NAME, state);
			return {};
		}

		text = Ext.clone(text);

		for (prop in data) {
			if (data.hasOwnProperty(prop)) {
				key = '{' + prop + '}';
				text.information = text.information.replace(key, data[prop]);
				text.title = text.title.replace(key, data[prop]);

				if (text.warning) {
					text.warning = text.warning.replace(key, data[prop]);
				}

				if (text.drop) {
					text.drop = text.drop.replace(key, data[prop]);
				}
			}
		}

		return text;
	},

	/**
	 * Takes the details of the option, and returns the wording for the state
	 * @param  {Object} details the details of course and option, return value from __getOptionDetails
	 * @return {Object}        the wording for the state it is in
	 */
	__getEnrollmentText: function(course, option) {
		var details = this.__getOptionDetails(course, option);
	},

	/*
		Enrollment details for the option have the following information
		{
			Name: String, // the name of the option
			BaseOption: Boolean, //if the option is a base or add on
			Enrolled: Boolean, //if they are enrolled in this option
			Price: Number, //how much this option costs, null if its free
			Wording: Object, //the wording for the state the option is in
			doEnrollment: Function, //a function to fire the navigation/enrollment events to get the process started
			undoEnrollment: Function, //drops the course, null if they cannot drop the course in the app
		}
	 */

	/**
	 * Parse out all the information needed to build the enrollment text
	 * @param  {Object} course  details about the course
	 * @param  {Object} option details about the option
	 * @return {Object}         parsed details
	 */
	__getOptionDetails: function(course, option) {},

	/**
	 * Returns a promise that fulfills with the enrollment details
	 * @param {CourseCatalogEnrty} course the course we are looking at
	 * @param {Object} details parsed enrollment details for the course
	 * @return {Promise}
	 */
	buildEnrollmentDetails: function(course, details) {}
});
