(function() {
	var states = [
		{value: 'AL', text: 'Alabama'},
		{value: 'AK', text: 'Alaska'},
		{value: 'AZ', text: 'Arizona'},
		{value: 'AR', text: 'Arkansas'},
		{value: 'CA', text: 'California'},
		{value: 'CO', text: 'Colorado'},
		{value: 'CT', text: 'Connecticut'},
		{value: 'DE', text: 'Delaware'},
		{value: 'DC', text: 'District Of Columbia'},
		{value: 'FL', text: 'Florida'},
		{value: 'GA', text: 'Georgia'},
		{value: 'HI', text: 'Hawaii'},
		{value: 'ID', text: 'Idaho'},
		{value: 'IL', text: 'Illinois'},
		{value: 'IN', text: 'Indiana'},
		{value: 'IA', text: 'Iowa'},
		{value: 'KS', text: 'Kansas'},
		{value: 'KY', text: 'Kentucky'},
		{value: 'LA', text: 'Louisiana'},
		{value: 'ME', text: 'Maine'},
		{value: 'MD', text: 'Maryland'},
		{value: 'MA', text: 'Massachusetts'},
		{value: 'MI', text: 'Michigan'},
		{value: 'MN', text: 'Minnesota'},
		{value: 'MS', text: 'Mississippi'},
		{value: 'MO', text: 'Missouri'},
		{value: 'MT', text: 'Montana'},
		{value: 'NE', text: 'Nebraska'},
		{value: 'NV', text: 'Nevada'},
		{value: 'NH', text: 'New Hampshire'},
		{value: 'NJ', text: 'New Jersey'},
		{value: 'NM', text: 'New Mexico'},
		{value: 'NY', text: 'New York'},
		{value: 'NC', text: 'North Carolina'},
		{value: 'ND', text: 'North Dakota'},
		{value: 'OH', text: 'Ohio'},
		{value: 'OK', text: 'Oklahoma'},
		{value: 'OR', text: 'Oregon'},
		{value: 'PA', text: 'Pennsylvania'},
		{value: 'RI', text: 'Rhode Island'},
		{value: 'SC', text: 'South Carolina'},
		{value: 'SD', text: 'South Dakota'},
		{value: 'TN', text: 'Tennessee'},
		{value: 'TX', text: 'Texas'},
		{value: 'UT', text: 'Utah'},
		{value: 'VT', text: 'Vermont'},
		{value: 'VA', text: 'Virginia'},
		{value: 'WA', text: 'Washington'},
		{value: 'WV', text: 'West Virginia'},
		{value: 'WI', text: 'Wisconsin'},
		{value: 'WY', text: 'Wyoming'},
		{value: 'AS', text: 'American Samoa'},
		{value: 'GU', text: 'Guam'},
		{value: 'MP', text: 'Northern Mariana Islands'},
		{value: 'PR', text: 'Puerto Rico'},
		{value: 'UM', text: 'United States Minor Outlying Islands'},
		{value: 'VI', text: 'Virgin Islands'},
		{value: 'AA', text: 'Armed Forces Americas'},
		{value: 'AP', text: 'Armed Forces Pacific'},
		{value: 'AE', text: 'Armed Forces Others'},
		{value: '', text: 'Other'}
	];

	Ext.define('NextThought.view.courseware.enrollment.credit.Admission', {
		extend: 'Ext.container.Container',
		alias: 'widget.enrollment-credit-admission',

		requires: ['NextThought.view.courseware.enrollment.credit.parts.*'],

		defaultType: 'enrollment-credit-group',

		STATE_VALUES: {},

		STATE_NAME: 'admission-form',

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
							{type: 'radio-group', name: 'is_currently_attending_ou', correct: 'N', options: [
								{text: 'Yes', value: 'Y', content: 'Please sign up for the course using your ' +
																   Ext.DomHelper.markup({tag: 'a', href: 'http://ozone.ou.edu', target: '_blank', html: 'Ozone account'}) +
																   '.'},
								{text: 'No', value: 'N'}
							]}
						]
					},
					{
						xtype: 'enrollment-credit-set',
						label: 'Are you attending High School?',
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
						label: 'What is your former name? (optional)',
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
							{type: 'date', name: 'date_of_birth', size: 'third', required: true}
						]
					},
					{
						xtype: 'enrollment-credit-set',
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
						xtype: 'enrollment-credit-set',
						label: 'Permanent Address',
						name: 'permanent-address',
						inputs: [
							{type: 'text', name: 'street_line1', placeholder: 'Address', required: true, size: 'full'},
							{type: 'text', name: 'street_line2', placeholder: 'Address', size: 'full'},
							{type: 'text', name: 'street_line3', hidden: true, placeholder: 'Address', size: 'full'},
							{type: 'text', name: 'street_line4', hidden: true, placeholder: 'Address', size: 'full'},
							{type: 'text', name: 'street_line5', hidden: true, placeholder: 'Address', size: 'full'},
							{type: 'text', name: 'city', placeholder: 'City / Town', size: 'large', required: true},
							{type: 'dropdown', name: 'state', placeholder: 'State / Province / Territory / Region', size: 'full', options: states, required: true},
							{type: 'dropdown', name: 'nation_code', placeholder: 'Country', required: true, size: 'large left', options: []},
							{type: 'text', name: 'postal_code', placeholder: 'ZIP / Postal Code', size: 'small left', required: true}
						],
						help: [
							{text: 'Add Address Line', type: 'event', event: 'add-address-line'}
						]
					},
					{
						xtype: 'enrollment-credit-set',
						inputs: [
							{type: 'checkbox', text: 'My mailing address is different.', name: 'has_mailing_address', reveals: 'mailing-address', correct: true}
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
							{type: 'dropdown', name: 'mailing_state', placeholder: 'State / Province / Territory / Region', size: 'full', options: states},
							{type: 'dropdown', name: 'mailing_nation_code', placeholder: 'Country', size: 'large left', options: []},
							{type: 'text', name: 'mailing_postal_code', placeholder: 'ZIP / Postal Code', size: 'small left'}
						]
					},
					{
						xtype: 'enrollment-credit-set',
						label: 'Phone Number',
						inputs: [
							{type: 'text', name: 'telephone_number',
								valueType: 'numeric',
								valuePattern: [
									{ '^\\d{0,10}$': '({{999}}) {{999}}-{{9999}}' },
									{ '*': '{{' + ((new Array(128)).join('*')) + '}}' }
								],
								valueValidation: /.{10,128}/,
								placeholder: 'Primary Phone', required: true, size: 'large'}
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
						xtype: 'enrollment-credit-set',
						label: 'Are you a U.S. Citizen?',
						inputs: [
							{type: 'radio-group', name: 'country_of_citizenship', required: true, options: [
								{text: 'Yes', value: 'United States'},
								{text: 'No. I am a citizen of {input}', value: 'dropdown', options: []}
							]}
						]
					},
					{
						xtype: 'enrollment-credit-set',
						label: 'Are you a resident of Oklahoma?',
						inputs: [
							{type: 'radio-group', name: 'years_of_oklahoma_residency', valType: 'number', required: true, options: [
								{text: 'Yes. I\'ve been a resident for {input} years.', value: 'input', inputWidth: 48},
								{text: 'No.', value: 0}
							]}
						]
					},
					{
						xtype: 'enrollment-credit-set',
						label: 'Are you a highschool graduate?',
						inputs: [
							{type: 'radio-group', name: 'high_school_graduate', required: true, options: [
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
								{text: 'Yes, and my Sooner ID was {input}', value: 'input', help: 'If you do not remember your Sooner ID number, please leave this field blank.'},
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
							{type: 'checkbox', name: 'affirm', doNotSend: true, doNotStore: true, text: [
								'I affirm that I am not prohibited from enrolling in any University of Oklahoma program.',
								'I understand that submitting any false information to the University,',
								'including but not limited to, any information contained on this form,',
								'or withholding information about my previous academic history will make my application for admission to the University,',
								'as well as any future applications, subject to denial, or will result in expulsion from the University.',
								'I pledge to conduct myself with academic integrity and abide by the tenets of',
								'The University of Oklahoma\'s Integrity Pledge.'
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
								text: 'After your admission application is sent to OU and processed, we will proceed to enrolling in this course.'
							}
						]
					}
				]
			}
		],


		initComponent: function() {
			this.callParent(arguments);

			var me = this,
				form = me.form.slice();

			me.enableBubble(['show-msg', 'enable-submission']);

			me.on({
				'reveal-item': 'revealItem',
				'hide-item': 'hideItem',
				'send-application': 'maybeSubmitApplication',
				'add-address-line': 'addAddressLine'
			});

			if (me.status === 'Pending') {
				me.showPending();
			}else if (me.status === 'Rejected') {
				me.showRejected();
			} else {
				form.unshift({
					name: 'intro',
					label: 'Admission to OU Janux',
					items: [
						{
							xtype: 'enrollment-credit-set',
							inputs: [
								{type: 'description', text: [
									'Before you can earn college credit from the University of Oklahoma,',
									'we need you to answer some questions.',
									'Don\'t worry, the admission process is free and should only take a few minutes.'
								].join(' ')}
							],
							help: [
								{text: 'Take the free course instead.', type: 'event', event: 'goto-free'}
							]
						}
					]
				});

				me.add(form);
				me.updateFromStorage();
				me.fillInNations();
			}
		},


		updateFromStorage: function() {
			var me = this,
				values = TemporaryStorage.get(me.STATE_NAME) || {},
				keys = Object.keys(values),
				waitOnRender = [];

			(keys || []).forEach(function(key) {
				var input = me.down('[name="' + key + '"]'),
					parent;

				if (input) {

					if (input.setValue) {
						input.setValue(values[key]);
					} else {
						parent = input.up('[setValue]');

						if (parent) {
							parent.setValue(value, key);
						}
					}
				} else {
					//We don't have an item with that name
					waitOnRender.push(key);
				}
			});

			if (!Ext.isEmpty(waitOnRender)) {
				//If we don't have an item with for the key, its probably a sub input of another item
				//so wait until we are rendered, get the input element with that name and set its value
				me.onceRendered
					.then(function() {
						return wait();
					})
					.then(function() {
						waitOnRender.forEach(function(key) {
							var input = me.el.down('input[name="' + key + '"]'),
								type = input && input.getAttribute('type'),
								value = values[key];

							if (!type) {
								console.error('No input for key: ', key);
							} else if (type === 'text') {
								input.dom.value = value;
							} else if (type === 'radio' || type === 'checkbox') {
								input.dom.checked = value || value === 'Y';
							}
						});
					});
			}

			me.STATE_VALUES = values;
		},


		changed: function(name, value, doNotStore) {
			if (!name || doNotStore) { return; }

			this.STATE_VALUES[name] = value;

			TemporaryStorage.set(this.STATE_NAME, this.STATE_VALUES);
		},


		clearStorage: function() {
			TemporaryStorage.set(this.STATE_NAME, {});
		},


		fillInNations: function() {
			var me = this,
				nationsLink = $AppConfig.userObject.getLink('fmaep.country.names');

			Service.request(nationsLink)
				.then(function(response) {
					var nations = Ext.JSON.decode(response, true),
						nationInput = me.down('[name=nation_code]'),
						mailingNationInput = me.down('[name=mailing_nation_code]'),
						citizenshipInput = me.down('[name=country_of_citizenship]');

					function updateInputs() {
						if (nationInput) {
							nationInput.addOptions(nations);
						}

						if (mailingNationInput) {
							mailingNationInput.addOptions(nations);
						}

						if (citizenshipInput) {
							citizenshipInput.addOptions(nations);
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

			if (name === 'enable-submit') {
				me.fireEvent('enable-submission', false);
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

			if (name === 'enable-submit') {
				me.shouldAllowSubmission()
					.then(me.fireEvent.bind(me, 'enable-submission', true))
					.fail(me.fireEvent.bind(me, 'enable-submission', true));
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


		showRejection: function(json) {
			this.removeAll(true);

			var fields = this.form.slice();

			fields.unshift({
				name: 'rejected',
				label: 'Your Application to Earn College Credit Has Been Denied',
				labelCls: 'error',
				items: [
					{
						xtype: 'enrollment-credit-set',
						inputs: [
							{
								type: 'description',
								text: json.Message
							}
						]
					},
					{
						xtype: 'enrollment-credit-set',
						inputs: [
							{
								type: 'description',
								text: [
									'Your request to earn college credit has been denied',
									'If you believe there has been an error,',
									'please contact the OU Admissions Office or resubmit your application.'
								].join(' ')
							}
						],
						help: [
							{text: 'OU Admissions Office', type: 'link', href: 'http://www.ou.edu/admissions.html', target: '_blank'}
						]
					}
				]
			});

			this.add(fields);
			this.fillInNations();
			this.fillInFromStorage();
		},


		showPending: function(json) {
			this.removeAll(true);

			this.add({
				name: 'rejected',
				label: 'Your Application to Earn College Credit is Pending',
				labelCls: 'error',
				items: [
					{
						xtype: 'enrollment-credit-set',
						inputs: [
							{
								type: 'description',
								text: json.Message || [
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
			});
		},


		showError: function(json) {
			var input;

			if (json.field) {
				input = this.down('[name="' + json.field + '"]');

				if (input && input.addError) {
					input.addError();
					input.el.scrollIntoView(this.el.up('.credit-container'));
				}
			}

			if (json.Message || json.message) {
				this.fireEvent('show-msg', (json.Message || json.message).replace('${field}', json.field), true, 5000);
			} else {
				this.fireEvent('show-msg', 'An unkown error occured. Please try again later.', true, 5000);
			}
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


		maybeSubmit: function() {
			var submitlink = $AppConfig.userObject.getLink('fmaep.admission'),
				me = this,
				maskCmp = this.up('enrollment-credit'),
				value = me.getValue();

			if (!submitlink) {
				me.fireEvent('show-msg', 'An error occured, please try again later', true);
				console.error('no admission links');
				return;
			}

			me.shouldAllowSubmission(value)
				.then(function() {
					me.fireEvent('enable-submission', false);
					maskCmp.el.mask('Your application is being processed. This may take a few moments.');

					return Service.post(submitlink, value);
				})
				.then(function(response) {
					var json = Ext.JSON.decode(response, true);

					maskCmp.el.unmask();


					if (json.Status === 403) {
						$AppConfig.userObject.set('admission_status', 'Rejected');
						me.showError(json);
						me.showRejection(json);
						me.fireEvent('enable-submission', true);
						return;
					}

					if (json.Status === 202) {
						$AppConfig.userObject.set('admission_status', 'Pending');
						me.showError({
							Message: 'Your application is pending.'
						});
						me.showPending(json);
					}

					if (json.Status === 201) {
						me.course.setEnrollmentLinks(json.Links);
						$AppConfig.userObject.set('admission_status', 'Admitted');
						me.fireEvent('show-msg', json.Message || 'Your application was successful.', false, 5000);
						me.fireEvent('admission-complete', true);
					}

					ne.clearStorage();
					me.showError(json);
					me.fireEvent('enable-submission', true);
				})
				.fail(function(response) {
					maskCmp.el.unmask();

					if (!response) { return; }

					var json = Ext.JSON.decode(response.responseText, true);

					if (json.Status === 403) {
						$AppConfig.userObject.set('admission_status', 'Rejected');
						me.showError(json);
						me.showRejection(json);
						me.fireEvent('enable-submission', true);
						return;
					}

					me.showError(json);

					me.fireEvent('enable-submission', true);
				});
		}
	});

}());
