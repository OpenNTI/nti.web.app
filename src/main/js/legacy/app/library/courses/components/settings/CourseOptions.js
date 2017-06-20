const Ext = require('extjs');
const {wait} = require('nti-commons');

const {getString, getFormattedString} = require('legacy/util/Localization');
const EnrollmentActions = require('legacy/app/course/enrollment/Actions');
const EnrollmentStateStore = require('legacy/app/course/enrollment/StateStore');
const WindowsActions = require('legacy/app/windows/Actions');


require('../available/CourseDetailWindow');


module.exports = exports = Ext.define('NextThought.app.library.courses.components.settings.CourseOptions', {
	extend: 'Ext.Component',
	alias: 'widget.library-course-options',
	cls: 'course-setting-options',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'enrollment {enrollCls}', html: '{enrollText}'},
		//{cls: 'contact', html: 'Contact the Instructor'},
		{ tag: 'a', cls: 'support', href: '{supportLink}', html: 'Request Support'},
		//{ tag: 'a', cls: 'report', html: 'Report an Issue'},
		{ tag: 'tpl', 'if': 'isDroppable', cn: {cls: 'drop', html: 'Drop Course'}}
	]),

	beforeRender: function () {
		this.callParent(arguments);

		var isOpen = this.course.isOpen(),
			registered,
			catalog = this.course.getCourseCatalogEntry(),
			isDroppable = catalog && catalog.isDroppable();

		this.CourseEnrollmentStore = EnrollmentStateStore.getInstance();
		this.WindowActions = WindowsActions.create();

		registered = this.CourseEnrollmentStore.getEnrolledText(this.course.getCourseCatalogEntry());

		this.renderData = Ext.apply(this.renderData || {}, {
			enrollCls: isOpen ? 'open' : 'enrolled',
			enrollText: registered,// || isOpen ? 'You are taking the Open Course.' : 'You are taking the Credit Course.',
			supportLink: 'mailto:support@nextthought.com?subject=Support%20Request',
			reportLink: '',
			isDroppable: isDroppable
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onClick', this);
		this.CourseEnrollmentStore = EnrollmentStateStore.getInstance();
		this.CourseEnrollmentActions = EnrollmentActions.create();

		this.enrollmentOptions = {};

		this.statusToOptionMap = {
			'Open': 'OpenEnrollment',
			'Store': 'StoreEnrollment',
			'ForCredit': 'FiveminuteEnrollment'
		};

		const catalog = this.course && this.course.getCourseCatalogEntry();
		if (catalog) {
			catalog.on('dropped', this.onDrop.bind(this, catalog));
		}
	},

	onClick: function (e) {
		if (e.getTarget('.drop')) {
			this.dropHandler(this.course);
		}

		this.fireEvent('close');
	},

	dropHandler: function (course) {
		const me = this;
		const catalog = course && course.getCourseCatalogEntry();
		const courseTitle = catalog && catalog.get('Title');

		function undoEnrollment (cmp) {
			return new Promise(function (fulfill, reject) {
				cmp.CourseEnrollmentActions.dropEnrollment(catalog, course, function (success, changed, status) {
					if (success) {
						fulfill(changed);
					} else {
						reject(status);
					}
				});
			});
		}

		me.changingEnrollment = true;

		Ext.Msg.show({
			msg: getFormattedString('NextThought.view.courseware.enrollment.Details.DropDetails', {course: courseTitle}),
			title: getString('NextThought.view.courseware.enrollment.Details.AreSure'),
			icon: 'warning-red',
			buttons: {
				primary: {
					text: getString('NextThought.view.courseware.enrollment.Details.DropCourse'),
					cls: 'caution',
					handler: function () {
						me.addMask();
						undoEnrollment(me)
										.catch(function (reason) {
											var msg;

											if (reason === 404) {
												msg = getString('NextThought.view.courseware.enrollment.Details.AlreadyDropped');
											} else {
												msg = getString('NextThought.view.courseware.enrollment.Details.ProblemDropping');
											}

											console.error('failed to drop course', reason);
											//already dropped?? -- double check the string to make sure it's correct
											alert(msg);
										});
					}
				},
				secondary: {
					text: getString('NextThought.view.courseware.enrollment.Details.DropCancel')
				}
			}
		});
	},

	addMask: function () {
		try {
			var maskEl = this.el && this.el.up('.body-container');
			if (maskEl) {
				maskEl.mask('Loading...');
			}
		} catch (e) {
			console.warn('Error masking. %o', e);
		}
	},


	onDrop (catalog) {
		const courseTitle = catalog && catalog.get('Title');

		Ext.Msg.show({
			msg: (getFormattedString('NextThought.view.courseware.enrollment.Details.dropped', {
				course: courseTitle
			})),
			title: 'Done',
			icon: 'success'
		});
	},

	removeMask: function () {
		var maskEl = this.el.up('.body-container'),
			mask = maskEl && maskEl.down('.x-mask'),
			maskMsg = maskEl && maskEl.down('.x-mask-msg');

		if (mask) {
			mask.addCls('removing');
		}

		if (maskMsg) {
			maskMsg.addCls('removing');
		}

		if (maskEl) {
			wait(1000).then(maskEl.unmask.bind(maskEl));
		}
	},


	/**
	 * Given a base enrollment option, fetch all the data
	 * @param  {Object} option option to load
	 * @return {Promise}	   fulfills when its loaded
	 */
	__addEnrollmentBase: function (option) {
		var me = this, loading;

		if (option) {
			loading = option.loaded
				.then(function (data) {
					me.enrollmentOptions[data.Name] = data;

					// me.__addBaseOption(option, data);
				});
		} else {
			loading = Promise.reject();
		}

		return loading;
	},

	/**
	 * Given an enrollment option, fetch all the data for the option given
	 * @param  {Object} option the enrollment details
	 * @return {Promise}		 resolved if the option is available, reject if not;
	 */
	__addEnrollmentOption: function (option) {
		var me = this, loading;

		if (option) {
			loading = option.loaded.then(function (data) {
				me.enrollmentOptions[data.Name] = data;

				// me.__addAddOnOption(option, data);
			});
		} else {
			loading = Promise.reject();
		}

		return loading;
	},

	/**
	 * Takes the enrollment details for the course and build the
	 * data necessary to make the enrollment card
	 * @param  {Object} details enrollment details
	 * @return {Promise}		 fulfills when its done, a rejection is not expected
	 */
	__onDetailsLoaded: function (details) {
		var loading,
			base, addOns = [],
			priority = this.CourseEnrollmentStore.getBasePriority(),
			me = this;

		function addBase (option, optionDetails) {
			optionDetails.name = optionDetails.name || option.name;

			//if we are enrolled in an option it is the base
			//and any other base is would be an add on
			if (optionDetails.IsEnrolled) {
				addOns.push(base);
				base = optionDetails;
			//if we don't already have a base option, it is by default
			} else if (!base) {
				base = optionDetails;
			//if we are enrolled in current base, we are an addon
			} else if (base.IsEnrolled) {
				addOns.push(optionDetails);
			//if the current base is a higher priority, we are an addon
			} else if (priority[base.name] > priority[optionDetails.name]) {
				addOns.push(optionDetails);
			//otherwise the current base is an add on and we are the base
			} else {
				addOns.push(base);
				base = optionDetails;
			}
		}

		//iterate through all the options and figure out which one
		//should be the base and what the add ons should be
		this.CourseEnrollmentStore.forEachOption(function (option) {
			var optionDetails = details.Options[option.name];

			//if we're not available stop here
			if (!optionDetails.IsAvailable) { return; }

			if (option.base || optionDetails.IsEnrolled) {
				addBase(option, optionDetails);
			} else {
				addOns.push(option);
			}
		});

		if (!base) {
			return Promise.reject('No base enrollment found');
		}

		loading = me.__addEnrollmentBase(base);

		addOns = addOns.map(function (addOn) {
			if (!addOn) { return; }

			return me.__addEnrollmentOption(addOn);
		});

		return loading;
	}

});
