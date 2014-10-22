Ext.define('NextThought.view.courseware.enrollment.Admission', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-admission',

	requires: [
		'NextThought.view.courseware.enrollment.parts.*',
		'NextThought.mixins.enrollment-feature.Form'
	],

	mixins: {
		form: 'NextThought.mixins.enrollment-feature.Form'
	},

	defaultType: 'enrollment-group',

	defaultMessages: {
		Message: '',
		ContactInformation: 'Please contact the <a href=\'mailto:support@nextthought.com\'>help desk</a> for further information.'
	},

	buttonCfg: [
		{name: 'Submit Application', disabled: true, action: 'submit-application'},
		{name: 'Cancel', disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'admission-form',

	form: [
		{
			name: 'general',
			label: 'General Information',
			items: [
				{
					xtype: 'enrollment-set',
					label: 'What is your full name?',
					inputs: [
						{type: 'text', name: 'first_name', placeholder: 'First Name', required: true, size: 'third left'},
						{type: 'text', name: 'middle_name', placeholder: 'Middle Name (optional)', size: 'third left'},
						{type: 'text', name: 'last_name', placeholder: 'Last Name', required: true, size: 'third left last'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Do you have a former last name? (optional)',
					inputs: [
						{type: 'text', name: 'former_name', placeholder: 'Former Last Name', size: 'third'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'What is your Date of Birth?',
					inputs: [
						{type: 'date', name: 'date_of_birth', size: 'third', required: true}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'What is your gender?',
					inputs: [
						{type: 'radio-group', name: 'gender', required: true, omitIfBlank: true, options: [
							{text: 'Male', value: 'M'},
							{text: 'Female', value: 'F'},
							{text: 'Prefer not to disclose', value: null}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Permanent Address',
					name: 'permanent-address',
					inputs: [
						{type: 'text', name: 'street_line1', placeholder: 'Address', required: true, size: 'full'},
						{type: 'text', name: 'street_line2', placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'street_line3', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'street_line4', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'street_line5', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'link', name: 'add_address_line', text: 'Add Address Line', eventName: 'add-address-line'},
						{type: 'text', name: 'city', placeholder: 'City / Town', size: 'large', required: true},
						{type: 'dropdown', name: 'state', placeholder: 'State / Province / Territory / Region', size: 'full', options: [], editable: false},
						{type: 'dropdown', name: 'nation_code', placeholder: 'Country', required: true, size: 'large left', options: []},
						{type: 'text', name: 'postal_code', placeholder: 'ZIP / Postal Code', size: 'small left', required: false}
					]
				},
				{
					xtype: 'enrollment-set',
					inputs: [
						{type: 'checkbox', text: 'My mailing address is different.', name: 'has_mailing_address', reveals: 'mailing-address', correct: true}
					]
				},
				{
					xtype: 'enrollment-set',
					name: 'mailing-address',
					label: 'Mailing Address',
					inputs: [
						{type: 'text', name: 'mailing_street_line1', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line2', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line3', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line4', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line5', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_city', placeholder: 'City / Town', size: 'large'},
						{type: 'dropdown', name: 'mailing_state', placeholder: 'State / Province / Territory / Region', size: 'full', options: [], editable: false},
						{type: 'dropdown', name: 'mailing_nation_code', placeholder: 'Country', size: 'large left', options: []},
						{type: 'text', name: 'mailing_postal_code', placeholder: 'ZIP / Postal Code', size: 'small left'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Phone Number',
					inputs: [
						{type: 'text', name: 'telephone_number',
							/*valueType: 'numeric',
							valuePattern: [
								{ '^\\d{0,10}$': '({{999}}) {{999}}-{{9999}}' },
								{ '*': '{{' + ((new Array(128)).join('*')) + '}}' }
							],*/
							valueValidation: /^.{1,128}$/,
							placeholder: 'Primary Phone', required: true, size: 'large'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Email Address',
					inputs: [
						{type: 'text', name: 'email', placeholder: 'Primary Email', required: true, size: 'large'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Social Security Number (optional)',
					inputs: [
						{
							type: 'text',
							name: 'social_security_number',
							valueType: 'numeric',
							valuePattern: '{{999}}-{{99}}-{{9999}}',
							valueValidation: /\d{9}/,
							placeholder: 'XXX - XX - XXXX',
							doNotStore: true,
							help: 'Your Social Security Number is not requred for admission, but it is used for submission of a ' +
								  Ext.DomHelper.markup({tag: 'a', target: '_blank', html: '1098T', href: 'http://www.irs.gov/uac/Form-1098-T,-Tuition-Statement'}) +
								  ' to the IRS.'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Are you a U.S. Citizen?',
					inputs: [
						{type: 'radio-group', name: 'country_of_citizenship', required: true, options: [
							{text: 'Yes', value: 'United States'},
							{text: 'No. I am a citizen of {input}', value: 'dropdown', options: []}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Are you a resident of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'years_of_oklahoma_residency', /*valType: 'number',*/ required: true, omitIfBlank: true, allowEmptyInput: false, options: [
							{text: 'Yes. I\'ve been a resident for {input} years.', value: 'input', inputWidth: 48},
							{text: 'No.', value: 0}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Are you a highschool graduate?',
					inputs: [
						{type: 'radio-group', name: 'high_school_graduate', required: true, options: [
							{text: 'Yes.', value: 'Y'},
							{text: 'No.', value: 'N'}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Have you ever attended the University of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'sooner_id', required: true, omitIfBlank: true, allowEmptyInput: true, /*valType: 'number',*/ options: [
							{text: 'Yes, and my Sooner ID was {input}', value: 'input', help: 'If you do not remember your Sooner ID number, please leave this field blank.'},
							{text: 'No.', value: ''}
						]}
					]
				},
				{
					xtype: 'enrollment-grouped-set',
					label: 'Have you ever attended another college or university?',
					name: 'attended_other_institution',
					required: true,
					options: [
						{text: 'Yes.', value: 'Y', inputs: [
							{type: 'checkbox', text: 'I am still attending.', name: 'still_attending', useChar: true, defaultAnswer: 'N'},
							{type: 'checkbox', text: 'I have obtained a Bachelor\'s degree or higher.', name: 'bachelors_or_higher', useChar: true, defaultAnswer: 'N'},
							{type: 'radio-group', label: 'I am in good academic standing.', name: 'good_academic_standing', defaultAnswer: 'N', required: true, options: [
								{text: 'Yes.', value: 'Y'},
								{text: 'No.', value: 'N'}
							]}
						]},
						{text: 'No.', value: 'N'}
					]
				}
			]
		},
		{
			name: 'signature',
			label: 'Signature',
			reveals: 'enable-submit',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{type: 'checkbox', name: 'affirm', doNotSend: true, doNotStore: true, correct: true, text:
							'I affirm that I am not <a data-event=\'prohibited\'>prohibited</a> from enrolling in any University of Oklahoma program. ' +
							'I understand that submitting any false information to the University, ' +
							'including but not limited to, any information contained on this form, ' +
							'or withholding information about my previous academic history will make my application for admission to the University, ' +
							'as well as any future applications, subject to denial, or will result in expulsion from the University. ' +
							'I pledge to conduct myself with academic integrity and abide by the tenets of ' +
							'The University of Oklahoma\'s <a href=\'http://integrity.ou.edu/\' target=\'_blank\'>Integrity Pledge.</a>'
						}
					]
				}
			]
		},
		{
			name: 'enable-submit',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: 'After your admission application is sent to OU and processed, we will proceed to enrolling in this course.'
						}
					]
				}
			]
		}
	],


	prohibitedPopover: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'help-popover hidden', cn: [
			{cls: 'close'},
			{cls: 'title', html: 'Policy on Non-Academic Criteria in the Admission of Students'},
			{
				cls: 'body',
				html: 'In addition to the academic criteria used as the basis for the admission of students, ' +
					'the University shall consider the following non-academic criteria in deciding whether a student shall be granted admission: ' +
					'whether an applicant has been expelled, suspended, or denied admission or readmission by any other educational institution; ' +
					'whether an applicant has been convicted of a felony or lesser crime involving moral turpitude; ' +
					'whether an applicant\'s conduct would be grounds for expulsion, suspension, dismissal or denial of readmission, ' +
					'had the student been enrolled at the University of Oklahoma. ' +
					'An applicant may be denied admission to the University if the University determines that there is substantial evidence, ' +
					'based on any of the instances described above, to indicate the applicant\'s unfitness to be a student at the University of Oklahoma.'
			}
		]}
	])),


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			form = me.form.slice(),
			courseSpecific = this.course ? getString('CourseSpecific')[this.course.getId()] : null,
			currentStudent;

		if (courseSpecific && courseSpecific.AlreadyEnrolled) {
			currentStudent = courseSpecific.AlreadyEnrolled;
		} else {
			currentStudent = Ext.DomHelper.markup([
				'Please sign up for the course using your ',
				{tag: 'a', href: 'http://ozone.ou.edu', target: '_blank', html: 'Ozone account.'}
			]);
		}


		form.unshift({
				name: 'preliminary',
				label: 'Preliminary Questions',
				reveals: ['general', 'signature'],
				items: [
					{
						xtype: 'enrollment-set',
						label: 'Are you currently attending the University of Oklahoma?',
						inputs: [
							{type: 'radio-group', name: 'is_currently_attending_ou', correct: 'N', options: [
								{text: 'Yes', value: 'Y',	content: currentStudent},
								{text: 'No', value: 'N'}
							]}
						]
					},
					{
						xtype: 'enrollment-set',
						label: 'Are you an Oklahoma resident currently attending High School?',
						name: 'attending-highschool',
						inputs: [
							{type: 'radio-group', name: 'is_currently_attending_highschool', correct: 'N', options: [
								{
									text: 'Yes',
									value: 'Y',
									content: 'Please apply using our ' +
											 Ext.DomHelper.markup({
												 tag: 'a', href: 'http://www.ou.edu/content/go2/admissions/concurrent.html',
												 target: '_blank', html: 'Concurrent Enrollment Application'}) +
											 '.'
								},
								{text: 'No', value: 'N'}
							]}
						]
					}
				]
		});

		me.submitBtnCfg = me.buttonCfg[0];

		me.enableBubble(['show-msg', 'enable-submission', 'update-buttons']);

		me.addressLines = ['street_line', 'mailing_street_line'];

		me.nationsLink = $AppConfig.userObject.getLink('fmaep.country.names');
		me.statesLink = $AppConfig.userObject.getLink('fmaep.state.names');

		me.addListeners();

		if (me.status === 'Pending') {
			me.showPending();
		}else if (me.status === 'Rejected') {
			me.showRejection();
		} else {
			form.unshift({
				name: 'intro',
				label: 'Admission to OU Janux',
				items: [
					{
						xtype: 'enrollment-set',
						inputs: [
							{
								type: 'description',
								text:
									'Before you can earn college credit from the University of Oklahoma, ' +
									'we need you to answer some questions. ' +
									'Don\'t worry, the admission process is free and should only take a few minutes.'
							},
							{type: 'link', text: 'Take the free course instead.', eventName: 'go-back'}
						]
					}
				]
			});

			me.add(form);
			me.updateFromStorage();
			me.fillInNations();
			me.fillInStates();
		}

		me.on('prohibited', function(anchor) {
			var popover, parent;

			anchor = Ext.get(anchor);

			parent = anchor.up('.body-container');

			popover = me.prohibitedPopover.append(parent, {}, true);

			popover.on('click', function(e) {
				if (e.getTarget('.close')) {
					e.stopEvent();
					popover.destroy();
				}
			});
		});
	},


	afterRender: function() {
		this.callParent(arguments);
	},


	getButtonCfg: function() {
		return this.buttonCfg;
	},


	buttonClick: function(action) {
		if (action === 'submit-application') {
			this.maybeSubmit();
		}
	},


	fillInDefaults: function(values) {
		var user = $AppConfig.userObject,
			firstName = user.get('FirstName'),
			lastName = user.get('LastName'),
			email = user.get('email');

		if (!values.first_name && firstName) {
			values.first_name = firstName;
		}

		if (!values.last_name && lastName) {
			values.last_name = lastName;
		}

		if (!values.email && email) {
			values.email = email;
		}

		return values;
	},


	stopClose: function() {
		var me = this,
			r;

		if (me.completed) {
			r = Promise.resolve();
		}else if (me.hasMask()) {
			r = Promise.reject();
		} else {
			r = new Promise(function(fulfill, reject) {
				Ext.Msg.show({
					title: 'Your application has not been submitted.',
					msg: 'If you leave now all progress will be lost.',
					icon: 'warning-red',
					buttons: {
						primary: {
							text: 'Stay and Finish',
							handler: reject
						},
						secondary: {
							text: 'Leave this Page',
							handler: function() {
								me.clearStorage();
								fulfill();
							}
						}
					}
				});
			});
		}

		return r;
	},


	showRejection: function(json) {
		this.removeAll(true);

		var fields = this.form.slice(),
			defaults = {
				Message: 'An unknown error occurred. Please try again later.',
				ContactInformation: 'Please contact the <a href=\'mailto:support@nextthought.com\'>help desk</a> for further information or resubmit your application.'
			};

		if (json && json.Message) {
			fields.unshift({
				name: 'rejected',
				label: 'A Problem Occurred. Please Correct the Following:',
				labelCls: 'error',
				items: [
					{
						xtype: 'enrollment-set',
						inputs: [
							{
								type: 'description',
								text: json.Message,
								cls: 'error-detail'
							},
							{
								type: 'description',
								text: json.ContactInformation || defaults.ContactInformation
							}
						]
					}
				]
			});
		} else {
			fields.unshift({
				name: 'rejected',
				label: 'We are unable to confirm your eligibility to enroll through this process.',
				labelCls: 'error',
				items: [
					{
						xtype: 'enrollment-set',
						inputs: [
							{
								type: 'description',
								text: defaults.ContactInformation
							}
						]
					}
				]
			});
		}

		this.add(fields);
		this.fillInNations();
		this.fillInStates();
		this.updateFromStorage();
	},


	showPending: function(json) {
		var defaults = {
			Message: 'Your application for admission is being process by OU.' +
				' Once you are admitted comeback here to enroll in ' + this.course.get('Title') + '.',
			ContactInformation: this.defaultMessages.ContactInformation
		};

		json = json || {};
		this.removeAll(true);

		this.add({
			name: 'rejected',
			label: 'We are unable to confirm your eligibility to enroll through this process.',
			labelCls: 'error',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: json.Message || defaults.Message
						},
						{
							type: 'description',
							text: json.ContactInformation || defaults.ContactInformation
						}
					]
				}
			]
		});
	},


	showAlreadyExisted: function(json) {
		var defaults = {
			Message: 'Your application could not be processed at this time.',
			ContactInformation: this.defaultMessages.ContactInformation
		};

		json = json || {};

		this.removeAll(true);

		this.add({
			name: 'rejected',
			label: json.Message || defaults.Message,
			labelCls: 'error',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: json.ContactInformation || defaults.ContactInformation
						}
					]
				}
			]
		});
	},


	showErrorState: function(json) {
		var defaults = {
			Message: 'An unknown error occurred. Please try again later.',
			ContactInformation: this.defaultMessages.ContactInformation
		};

		json = json || {};

		this.removeAll(true);

		this.hidePricingInfo();

		this.add({
			name: 'rejected',
			label: 'We are unable to confirm your eligibility to enroll through this process.',
			labelCls: 'error',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{type: 'description', text: json.Message || defaults.Message, cls: 'error-detail'},
						{type: 'description', text: json.ContactInformation || defaults.ContactInformation}
					]
				}
			]
		});
	},


	shouldAllowSubmission: function(value) {
		var me = this,
			preflightlink = $AppConfig.userObject.getLink('fmaep.admission.preflight');

		value = value || me.getValue();

		return new Promise(function(fulfill, reject) {
			if (!me.isValid()) {
				me.fireEvent('show-msg', 'Please fill out all required information.', true, 5000);
				reject();
				return;
			}

			if (!preflightlink) {
				console.error('No Preflight to validate the admission form, allowing submitt anyway');
				fulfill();
				return;
			}

			Service.post(preflightlink, value)
				.then(function(response) {
					fulfill();
				})
				.fail(function(response) {
					var json = Ext.JSON.decode(response && response.responseText, true);

					me.showError(json);
					reject();
				});
		});
	},


	handleResponse: function(json) {
		this.completed = true;

		if (json.State) {
			$AppConfig.userObject.set('admission_status', json.State);
		}

		if (json.Status === 422) {
			delete this.completed;
			this.showError(json);
			this.showRejection(json);
			this.fireEvent('enable-submission', true);
		} else if (json.Status === 202) {
			this.showError({
				Message: 'We are unable to confirm your eligibility to enroll through this process.'
			});
			this.showPending(json);
			this.clearStorage();
		} else if (json.Status === 201) {
			this.course.setEnrollmentLinks(json.Links);
			this.fireEvent('show-msg', json.Message || 'Your application was successful.', false, 5000);
			this.clearStorage();
			this.pricingInfo.hide();
			this.done(this);
		} else if (json.Status === 409) {
			this.showError(json);
			this.clearStorage();
			this.error(this);
			this.showAlreadyExisted(json);
		} else {
			this.showError(json);
			this.clearStorage();
			this.error(this);
			this.showErrorState(json);
		}
	},


	maybeSubmit: function() {
		var me = this, isValid,
			value = me.getValue();

		me.shouldAllowSubmission(value)
			.then(function() {
				isValid = true;
				me.submitBtnCfg.disabled = true;
				me.fireEvent('update-buttons');
				me.addMask('Your application is being processed. This may take a few moment.');

				return me.complete(me, value);
			}, function() {
				isValid = false;

				return Promise.reject();
			})
			.then(function(response) {
				var json = Ext.JSON.decode(response, true);

				me.removeMask();


				me.handleResponse(json);
			})
			.fail(function(response) {
				me.removeMask();

				if (!isValid) {
					return;
				}

				if (!response) {
					me.handleResponse({
						message: 'An unknown error occurred. Please try again later.'
					});
					return;
				}

				var json = Ext.JSON.decode(response.responseText || response, true);

				me.handleResponse(json);
			});
	}
});
