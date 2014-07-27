Ext.define('NextThought.view.courseware.enrollment.credit.Admission', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-credit-admission',

	requires: ['NextThought.view.courseware.enrollment.credit.parts.*'],

	defaultType: 'enrollment-credit-group',

	form: [
		{
			name: 'preliminary',
			label: 'Preliminary Questions',
			reveals: ['general', 'signature'],
			items: [
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you currently attending the University of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'attending', doNotSend: true, correct: 'false', options: [
							{text: 'Yes', value: true, content: 'Please sign up for the course using your <a href=\'http://www.ozone.ou.edu\'>Ozone account</a>.'},
							{text: 'No', value: false}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you attending High School?',
					name: 'attending-highschool',
					inputs: [
						{type: 'radio-group', name: 'highschool', doNotSend: true, correct: 'false', options: [
							{
								text: 'Yes',
								value: true,
								content: 'Please apply using our <a href=\'http://www.ou.edu/content/go2/admissions/concurrent.html\'>Concurrent Enrollment Appliation</a>'
							},
							{text: 'No', value: false}
						]}
					]
				}
			]
		},
		{
			name: 'general',
			label: 'General Information',
			items: [
				{
					xtype: 'enrollment-credit-set',
					label: 'What is your full name?',
					inputs: [
						{type: 'text', name: 'first_name', placeholder: 'First Name', required: true, size: 'third left'},
						{type: 'text', name: 'middle_name', placeholder: 'Middle Name', size: 'third left'},
						{type: 'text', name: 'last_name', placeholder: 'Last Name', required: true, size: 'third left last'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'What is your former name?',
					inputs: [
						{type: 'text', name: 'former-first-name', placeholder: 'First Name', size: 'third left'},
						{type: 'text', name: 'former-middle-name', placeholder: 'Middle Name', size: 'third left'},
						{type: 'text', name: 'former-last-name', placeholder: 'Last Name', size: 'third left last'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'What is your Date of Birth?',
					inputs: [
						{type: 'date', name: 'date_of_birth', size: 'third'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'What is your gender?',
					inputs: [
						{type: 'radio-group', name: 'gender', required: true, omitIfBlank: true, options: [
							{text: 'Male', value: 'M'},
							{text: 'Female', value: 'F'},
							{text: 'I\'d rather not say...', value: null}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Permanent Address',
					name: 'permanent-address',
					inputs: [
						{type: 'text', name: 'street_line1', placeholder: 'Address', required: true, size: 'full'},
						{type: 'text', name: 'street_line2', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'street_line3', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'street_line4', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'street_line5', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'city', placeholder: 'City / Town', size: 'large'},
						{type: 'text', name: 'state', placeholder: 'State / Province / Territory / Region', size: 'full'},
						{type: 'dropdown', name: 'nation_code', placeholder: 'Country', required: true, size: 'large left', options: []},
						{type: 'text', name: 'postal_code', placeholder: 'ZIP / Postal Code', size: 'small left'}
					],
					help: [
						{text: 'Add Address Line', type: 'event', event: 'add-address-line'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					inputs: [
						{type: 'checkbox', text: 'My mailing address is different', name: 'show-mailing', doNotSend: true, reveals: 'mailing-address', correct: true}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					name: 'mailing-address',
					label: 'Mailing Address',
					inputs: [
						{type: 'text', name: 'mailing_street_line1', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line2', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line3', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line4', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line5', hidden: true, placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_city', placeholder: 'City / Town', size: 'large'},
						{type: 'text', name: 'mailing_state', placeholder: 'State / Province / Territory / Region', size: 'full'},
						{type: 'dropdown', name: 'mailing_nation_code', placeholder: 'Country', size: 'large left', options: []},
						{type: 'text', name: 'mailing_postal_code', placeholder: 'ZIP / Postal Code', size: 'small left'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Phone Number',
					inputs: [
						{type: 'text', name: 'telephone_number', placeholder: 'Primary Phone', required: true, size: 'large'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Email Address',
					inputs: [
						{type: 'text', name: 'email', placeholder: 'Primary Email', required: true, size: 'large'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Social Security Number',
					inputs: [
						{
							type: 'text',
							name: 'social_security_number',
							placeholder: 'XXX - XX - XXXX',
							help: 'Your Social Security Number is not requred for admission, but it is used for submission of a 1098T to the IRS.'
						}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you a U.S. Citizen?',
					inputs: [
						{type: 'radio-group', name: 'country_of_citizenship', required: true, options: [
							{text: 'Yes', value: 'united states'},
							{text: 'No. I am a citizen of {input}.', value: 'input'}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you a resident of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'years_of_oklahoma_residency', valType: 'number', required: true, options: [
							{text: 'Yes. I\'ve been a resident for {input} years', value: 'input', inputWidth: 48},
							{text: 'No.', value: 0}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you a highschool graduate?',
					inputs: [
						{type: 'radio-group', name: 'completed-highschool', required: true, options: [
							{text: 'Yes.', value: 'Y'},
							{text: 'No.', value: 'N'}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Have you ever attended the University of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'sooner_id', required: true, omitIfBlank: true, valType: 'number', options: [
							{text: 'Yes, and my Sooner ID was {input}.', value: 'input'},
							{text: 'No.', value: ''}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Have you ever attended another college or university?',
					inputs: [
						{type: 'checkbox-group', name: 'attended_other_institution', required: true, options: [
							{type: 'checkbox', text: 'I am still attending.', name: 'still_attending'},
							{type: 'checkbox', text: 'I am in good academic standing.', name: 'good_academic_standing'},
							{type: 'checkbox', text: 'I have obtained a Bachelor\'s degree or higher.', name: 'bachelors_or_higher'}
						]}
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
					xtype: 'enrollment-credit-set',
					inputs: [
						{type: 'checkbox', name: 'affirm', doNotSend: true, text: [
							'I affirm that I am not prohibited from enrolling in any University of Oklahoma program.',
							'I understand that submitting any false information to the University,',
							'including but not limited to, any information contained on this form,',
							'or withholding information about my previous academic history will make my application for admission to the University,',
							'as well as any future applications, subject to denial, or will result in expulsion from the University.',
							'I pledge to conduct myself with academic integrity and abide by the tenets of',
							'The University of Oklahoma\'s Integrity Pledge'
						].join(' '), correct: true}
					],
					help: [
						{text: 'Why would I be prohibited?', type: 'text', info: {
							title: 'Policy on Non-Academic Criteria in the Admission of Students',
							body: [
								'In addition to the academic criteria used as the basis for the admission of students,',
								'the University shall consider the following non-academic criteria in deciding whether a student shall be granted admission:',
								'whether an applicant has been expelled, suspended, or denied admission or readmission by any other educational institution;',
								'whether an applicant has been convicted of a felony or lesser crime involving moral turpitude;',
								'whether an applicant\'s conduct would be grounds for expulsion, suspension, dismissal or denial of readmission,',
								'had the student been enrolled at the University of Oklahoma.',
								'An applicant may be denied admission to the University if the University determines that there is substantial evidence,',
								'based on any of the instances described above, to indicate the applicant\'s unfitness to be a student at the University of Oklahoma.'
							].join(' ')
						}},
						{text: 'Integrity Pledge', type: 'link', href: 'http://integrity.ou.edu/', target: '_blank'}
					]
				}
			]
		},
		{
			name: 'enable-submit',
			items: [
				{
					xtype: 'enrollment-credit-set',
					inputs: [
						{
							type: 'description',
							text: 'After your admission application is sent to OU and processed, we will proceed to enrolling in this course'
						},
						{
							type: 'submit-button'
						}
					]
				}
			]
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.enableBubble('show-msg');

		me.on({
			'reveal-item': 'revealItem',
			'hide-item': 'hideItem',
			'send-application': 'maybeSubmitApplication',
			'add-address-line': 'addAddressLine'
		});

		if (me.status === 'pending') {
			me.add([
				{
					name: 'pending',
					label: 'Admission Pending',
					items: [
						{
							xtype: 'enrollment-credit-set',
							inputs: [
								{
									type: 'description',
									text: [
										'Your application for admission is being processed by OU.',
										'To check on the process you can contact the OU Admissions Office.',
										'Once you are admitted comeback here to enroll in ' + this.course.get('Title')
									].join(' ')
								}
							],
							help: [
								{text: 'OU Admissions Office', type: 'link', href: '#', target: '_blank'}
							]
						}
					]
				}
			]);

			return;
		}

		if (me.status === 'rejected') {
			me.form.unshift({
				name: 'rejected',
				label: 'Application Rejected',
				items: [
					{
						xtype: 'enrollment-credit-set',
						inputs: [
							{
								type: 'description',
								text: [
									'Your last application for admission was rejected by OU.',
									'For more information you can contact OU Enrollment services.',
									'Feel free to apply again below.'
								].join(' ')
							}
						],
						help: [
							{text: 'OU Enrollment Services', type: 'link', href: '#', target: '_blank'}
						]
					}
				]
			});
		} else {
			me.form.unshift({
				name: 'intro',
				label: 'Admission to OU Janux',
				items: [
					{
						xtype: 'enrollment-credit-set',
						inputs: [
							{type: 'description', text: [
								'Before you can start to earn college credit from the University of Oklahoma,',
								'we need you to answer some questions.',
								'Don\'t worry, the admission process is totally free and should only take a few minutes.'
							].join(' ')}
						],
						help: [
							{text: 'Take the free course instead.', type: 'event', event: 'goto-free'},
							{text: 'View the FAQ\'s', type: 'link', href: '#', target: '_blank'}
						]
					}
				]
			});
		}
		me.fillInNations();
		me.add(me.form);
	},


	fillInNations: function() {
		var me = this,
			nationsLink = $AppConfig.userObject.getLink('fmaep.country.names');

		Service.request(nationsLink)
			.then(function(response) {
				var nations = Ext.JSON.decode(response, true),
					nationInput = me.down('[name=nation_code]'),
					mailingNationInput = me.down('[name=mailing_nation_code]');

				function updateInputs() {
					if (nationInput) {
						nationInput.addOptions(nations);
					}

					if (mailingNationInput) {
						mailingNationInput.addOptions(nations);
					}
				}

				if (!me.rendered) {
					me.on('afterrender', updateInputs);
				} else {
					updateInputs();
				}
			})
			.fail(function(reason) {
				console.error('Failed to load nation list ', reason);
			});
	},


	addAddressLine: function() {
		var line = this.numberofaddressline || 2,
			streetAddress = this.down('[name=permanent-address]'),
			help;

		line = this.numberofaddressline = line + 1;

		if (line >= 5) {
			help = streetAddress.el.query('a.help');

			(help || []).forEach(function(h) {
				if (h.innerText === 'Add Address Line') {
					Ext.fly(h).destroy();
				}
			});
		}

		this.revealItem('street_line' + line);
		this.revealItem('mailing_street_line' + line);
	},


	hideItem: function(name) {
		var me = this, item, parent;

		if (Ext.isArray(name)) {
			name.forEach(function(n) {
				me.hideItem(n);
			});

			return;
		}

		item = me.down('[name=' + name + ']');

		if (item) {
			item.hide();

			if (item.reveals) {
				this.hideItem(item.reveals);
			}

			if (item.hides) {
				this.hideItem(item.hides);
			}
		} else {
			console.error('No item to hide: ', name);
		}
	},


	revealItem: function(name) {
		var me = this, item, parent;

		if (Ext.isArray(name)) {
			name.forEach(function(n) {
				me.revealItem(n);
			});

			return;
		}

		item = me.down('[name="' + name + '"]');

		if (item) {
			item.show();

			if (item.changed) {
				item.changed();
			}
		} else {
			console.error('No item to reveal: ', name);
		}
	},


	getValue: function() {
		var value = {};

		this.items.each(function(item) {
			value = Ext.apply(value, item.getValue && item.getValue());
		});

		return value;
	},


	isValid: function() {
		var valid = true;

		this.items.each(function(item) {
			if (Ext.isFunction(item.isValid) && !item.isValid()) {
				valid = false;
			}

			return true;
		});

		return valid;
	},


	maybeSubmitApplication: function() {
		var preflightlink = $AppConfig.userObject.getLink('fmaep.admission.preflight'),
			submitlink = $AppConfig.userObject.getLink('fmaep.admission'),
			me = this,
			value = me.getValue();

		if (!me.isValid()) {
			me.fireEvent('show-msg', 'Please fill out all required information.', true, 5000);
			return;
		}

		if (!submitlink || !preflightlink) {
			me.fireEvent('show-msg', 'An error occured, please try again later', true);
			console.error('no admission links');
			return;
		}

		function showError(json) {
			var input;

			if (json.field) {
				input = me.down('[name="' + json.field + '"]');

				if (input && input.addError) {
					input.addError();
					input.el.scrollIntoView(me.el.up('.credit-container'));
				}
			}

			if (json.message) {
				me.fireEvent('show-msg', json.message.replace('${field}', json.field), true, 5000);
			} else {
				me.fireEvent('show-msg', 'An unkown error occured. Please try again later.', true, 5000);
			}
		}

		Service.post(preflightlink, value)
			.then(function() {
				Service.post(submitlink, value)
					.then(function(response) {
						var json = Ext.JSON.decode(response, true);

						if (json.Status === 500) {
							showError(json);
						}

						//if (json.status === 202) {
						//	//do pending logic here
						//}

						//if (json.status === 201) {
						//	//do success logic here
						//}
					})
					.fail(function(response) {
						var json = Ext.JSON.decode(response && response.responseText, true);

						showError(json);
					});
			})
			.fail(function(response) {
				var json = Ext.JSON.decode(response && response.responseText, true);

				showError(json);
			});
	}
});
