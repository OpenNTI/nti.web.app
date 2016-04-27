var Ext = require('extjs');
var EnrollmentFeatureForm = require('../../../../mixins/enrollment-feature/Form');
var PartsBaseInput = require('./parts/BaseInput');
var PartsCheckbox = require('./parts/Checkbox');
var PartsCheckboxGroup = require('./parts/CheckboxGroup');
var PartsDateInput = require('./parts/DateInput');
var PartsDescription = require('./parts/Description');
var PartsDescription = require('./parts/Description');
var PartsDetailsTable = require('./parts/DetailsTable');
var PartsDropDown = require('./parts/DropDown');
var PartsGroup = require('./parts/Group');
var PartsGroupedSet = require('./parts/GroupedSet');
var PartsLinks = require('./parts/Links');
var PartsPricing = require('./parts/Pricing');
var PartsRaioGroup = require('./parts/RadioGroup');
var PartsSet = require('./parts/Set');
var PartsSplitRadio = require('./parts/SplitRadio');
var PartsSubmitButton = require('./parts/SubmitButton');
var PartsTextarea = require('./parts/Textarea');
var PartsTextInput = require('./parts/TextInput');
var EnrollmentFeatureForm = require('../../../../mixins/enrollment-feature/Form');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.Admission', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-admission',

	mixins: {
		form: 'NextThought.mixins.enrollment-feature.Form'
	},

	defaultType: 'enrollment-group',

	defaultMessages: {
		Message: '',
		ContactInformation: getString('NextThought.view.courseware.enrollment.Admission.ContactHelpDesk')
	},

	buttonCfg: [
		{name: getString('NextThought.view.courseware.enrollment.Admission.SubmitApp'), disabled: true, action: 'submit-application'},
		{name: getString('NextThought.view.courseware.enrollment.Admission.CancelApp'), disabled: false, action: 'go-back', secondary: true}
	],

	groups: {
		'concurrent': {
			'preflight': null,
			'submit': 'submitConcurrentForm',
			'handler': 'handleConcurrentResponse'
		},
		'admission': {
			'preflight': 'shouldAllowSubmission',
			'submit': 'submitAdmission',
			'handler': 'handleResponse'
		}
	},

	//which group to use for validation when the enable events are fired
	eventToGroup: {
		'enable-submit-concurrent': 'concurrent',
		'enable-submit': 'admission'
	},

	STATE_NAME: 'admission-form',

	form: [
		{
			name: 'concurrent-contact',
			group: 'concurrent',
			label: getString('NextThought.view.courseware.enrollment.Admission.ConcurrentEnroll'),
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: getString('NextThought.view.courseware.enrollment.Admission.CEDescription')
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Contact Information',
					inputs: [
						{type: 'text', name: 'contact_name', placeholder: getString('NextThought.view.courseware.enrollment.Admission.FullName'), required: true, size: 'large one-line'},
						{type: 'text', name: 'contact_email', placeholder: getString('NextThought.view.courseware.enrollment.Admission.Email'), required: true, size: 'large one-line'},
						{type: 'text', name: 'contact_phone', placeholder: getString('NextThought.view.courseware.enrollment.Admission.ContactPhone'), valueValidation: /^.{1,128}$/, size: 'large one-line'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.AddressOpt'),
					inputs: [
						{type: 'text', name: 'contact_street_line1', placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'contact_street_line2', placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'contact_street_line3', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'contact_street_line4', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'contact_street_line5', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'link', name: 'add_address_line', text: getString('NextThought.view.courseware.enrollment.Admission.AddAddress'), eventName: 'add-address-line', args: ['contact_street_line']},
						{type: 'text', name: 'contact_city', placeholder: getString('NextThought.view.courseware.enrollment.Admission.CityTown'), size: 'large'},
						{type: 'text', name: 'contact_state', placeholder: getString('NextThought.view.courseware.enrollment.Admission.StateProvTerrReg'), size: 'full'},
						{type: 'text', name: 'contact_country', placeholder: getString('NextThought.view.courseware.enrollment.Admission.Country'), size: 'large left'},
						{type: 'text', name: 'contact_zip', placeholder: getString('NextThought.view.courseware.enrollment.Admission.ZIPPostal'), size: 'small left'}
					]
				},
				{
					xtype: 'enrollment-set',
					reveals: 'enable-submit-concurrent',
					inputs: [
						{
							type: 'checkbox',
							name: 'affirm-contact',
							doNotSend: true,
							doNotStore: true,
							correct: true,
							text: getString('NextThought.view.courseware.enrollment.Admission.OUContact')
						}
					]
				}
			]
		},
		{
			name: 'general',
			group: 'admission',
			label: getString('NextThought.view.courseware.enrollment.Admission.GeneralInfo'),
			items: [
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.AskName'),
					inputs: [
						{type: 'text', name: 'first_name', placeholder: getString('NextThought.view.courseware.enrollment.Admission.FirstName'), required: true, size: 'third left'},
						{type: 'text', name: 'middle_name', placeholder: getString('NextThought.view.courseware.enrollment.Admission.MiddleNameOpt'), size: 'third left'},
						{type: 'text', name: 'last_name', placeholder: getString('NextThought.view.courseware.enrollment.Admission.LastName'), required: true, size: 'third left last'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.FormerLastNameOpt'),
					inputs: [
						{type: 'text', name: 'former_name', placeholder: getString('NextThought.view.courseware.enrollment.Admission.FormerLastName'), size: 'third'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.Gender'),
					inputs: [
						{type: 'radio-group', name: 'gender', required: true, omitIfBlank: true, options: [
							{text: getString('NextThought.view.courseware.enrollment.Admission.Male'), value: 'M'},
							{text: getString('NextThought.view.courseware.enrollment.Admission.Female'), value: 'F'},
							{text: getString('NextThought.view.courseware.enrollment.Admission.NotDiscloseGender'), value: null}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.PermanentAddress'),
					name: 'permanent-address',
					inputs: [
						{type: 'text', name: 'street_line1', placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), required: true, size: 'full'},
						{type: 'text', name: 'street_line2', placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressOpt'), size: 'full'},
						{type: 'text', name: 'street_line3', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressOpt'), size: 'full'},
						{type: 'text', name: 'street_line4', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressOpt'), size: 'full'},
						{type: 'text', name: 'street_line5', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressOpt'), size: 'full'},
						{type: 'link', name: 'add_address_line', text: getString('NextThought.view.courseware.enrollment.Admission.AddAddress'), eventName: 'add-address-line', args: ['street_line']},
						{type: 'text', name: 'city', placeholder: getString('NextThought.view.courseware.enrollment.Admission.CityTown'), size: 'large', required: true},
						{type: 'dropdown', name: 'state', placeholder: getString('NextThought.view.courseware.enrollment.Admission.StateProvTerrReg'), size: 'full', options: [], editable: false},
						{type: 'dropdown', name: 'nation_code', placeholder: getString('NextThought.view.courseware.enrollment.Admission.Country'), required: true, size: 'large left', options: []},
						{type: 'text', name: 'postal_code', placeholder: getString('NextThought.view.courseware.enrollment.Admission.ZIPPostal'), size: 'small left', required: false}
					]
				},
				{
					xtype: 'enrollment-set',
					inputs: [
						{type: 'checkbox', text: getString('NextThought.view.courseware.enrollment.Admission.MailDifferent'), name: 'has_mailing_address', reveals: 'mailing-address', correct: true}
					]
				},
				{
					xtype: 'enrollment-set',
					name: 'mailing-address',
					label: getString('NextThought.view.courseware.enrollment.Admission.MailingAddress'),
					inputs: [
						{type: 'text', name: 'mailing_street_line1', placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'mailing_street_line2', placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'mailing_street_line3', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'mailing_street_line4', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'text', name: 'mailing_street_line5', hidden: true, placeholder: getString('NextThought.view.courseware.enrollment.Admission.AddressLine'), size: 'full'},
						{type: 'link', name: 'add_address_line', text: getString('NextThought.view.courseware.enrollment.Admission.AddAddress'), eventName: 'add-address-line', args: ['mailing_street_line']},
						{type: 'text', name: 'mailing_city', placeholder: getString('NextThought.view.courseware.enrollment.Admission.CityTown'), size: 'large'},
						{type: 'dropdown', name: 'mailing_state', placeholder: getString('NextThought.view.courseware.enrollment.Admission.StateProvTerrReg'), size: 'full', options: [], editable: false},
						{type: 'dropdown', name: 'mailing_nation_code', placeholder: getString('NextThought.view.courseware.enrollment.Admission.Country'), size: 'large left', options: []},
						{type: 'text', name: 'mailing_postal_code', placeholder: getString('NextThought.view.courseware.enrollment.Admission.ZIPPostal'), size: 'small left'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.PhoneNumber'),
					inputs: [
						{type: 'text', name: 'telephone_number',
							/*valueType: 'numeric',
							valuePattern: [
								{ '^\\d{0,10}$': '({{999}}) {{999}}-{{9999}}' },
								{ '*': '{{' + ((new Array(128)).join('*')) + '}}' }
							],*/
							valueValidation: /^.{1,128}$/,
							placeholder: getString('NextThought.view.courseware.enrollment.Admission.PrimPhone'), required: true, size: 'large'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.EmailAddress'),
					inputs: [
						{type: 'text', name: 'email', placeholder: getString('NextThought.view.courseware.enrollment.Admission.PrimEmail'), required: true, size: 'large'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.SSNOpt'),
					inputs: [
						{
							type: 'text',
							name: 'social_security_number',
							valueType: 'numeric',
							valuePattern: '{{999}}-{{99}}-{{9999}}',
							valueValidation: /\d{9}/,
							placeholder: getString('NextThought.view.courseware.enrollment.Admission.SSNPlace'),
							doNotStore: true,
							help: getString('NextThought.view.courseware.enrollment.Admission.SSNNotRequired')
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.AskCitizen'),
					inputs: [
						{type: 'radio-group', name: 'country_of_citizenship', required: true, options: [
							{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'United States'},
							{text: getFormattedString('NextThought.view.courseware.enrollment.Admission.NoCitizenOf', {dropdown: '{input}'}), value: 'dropdown', options: []}
						]}]},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.AskOklahoman'),
					inputs: [
						{type: 'radio-group', name: 'years_of_oklahoma_residency', /*valType: 'number',*/ required: true, omitIfBlank: true, allowEmptyInput: false, options: [
							{text: getFormattedString('NextThought.view.courseware.enrollment.Admission.OKYears', {input: '{input}'}), value: 'input', inputWidth: 48},
							{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 0}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.HSGrad'),
					inputs: [
						{type: 'radio-group', name: 'high_school_graduate', required: true, options: [
							{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'Y'},
							{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 'N'}
						]}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.AskOUAlum'),
					inputs: [
						{type: 'radio-group', name: 'sooner_id', required: true, omitIfBlank: true, allowEmptyInput: true, /*valType: 'number',*/ options: [
							{text: getFormattedString('NextThought.view.courseware.enrollment.Admission.YesSoonerID', {input: '{input}'}), value: 'input', help: getString('NextThought.view.courseware.enrollment.Admission.ForgotID')},
							{text: getString('NextThought.view.courseware.enrollment.Admission.No', {value: ''})}
						]}
					]
				}
			]
		},
		{
			name: 'signature',
			group: 'admission',
			label: getString('NextThought.view.courseware.enrollment.Admission.Signature'),
			reveals: 'enable-submit',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{type: 'checkbox', name: 'affirm', doNotSend: true, doNotStore: true, correct: true, text:
						getString('NextThought.view.courseware.enrollment.Admission.IntegrityPledge')
						}
					]
				}
			]
		},
		{
			name: 'enable-submit',
			group: 'admission',
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: getString('NextThought.view.courseware.enrollment.Admission.ProceedtoEnroll')
						}
					]
				}
			]
		}
	],

	prohibitedPopover: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'help-popover hidden', cn: [
			{cls: 'close'},
			{cls: 'title', html: getString('NextThought.view.courseware.enrollment.Admission.NonAcademicPolicy')},
			{
				cls: 'body',
				html: '{{{NextThought.view.courseware.enrollment.Admission.NonAcademicCriteria}}}'
			}
		]}
	])),

	initComponent: function () {
		this.callParent(arguments);

		var me = this,
			form = me.form.slice(),
			descriptionInputs = [],
			currentStudent = getString('OUStudentAdmissionMessage', null, true);

		if (!currentStudent) {
			currentStudent = Ext.DomHelper.markup([getString('NextThought.view.courseware.enrollment.Admission.SignUpOzone')]);
		}

		form.unshift({
			name: 'preliminary',
			label: getString('NextThought.view.courseware.enrollment.Admission.PrelimQuest'),
			items: [
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.DoB'),
					inputs: [
						{
							type: 'date',
							name: 'date_of_birth',
							size: 'third',
							required: true,
							reveals: {
								name: 'attending'
							},
							hides: 'too-young',
							isValueCorrect (value) {
								if (!value) { return false; }

								let valYear = value.getFullYear();
								let nowYear = (new Date()).getFullYear();

								return (nowYear - valYear) > 13;
							}
						}
					]
				},
				{
					xtype: 'enrollment-set',
					name: 'too-young',
					inputs: [
						{
							type: 'description',
							text: 'Students must be at least 13 years of age to participate in Janux courses.'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.OUStudent'),
					name: 'attending',
					reveals: 'attended_other_institution',
					inputs: [
						{
							type: 'radio-group',
							name: 'is_currently_attending_ou',
							correct: 'N',
							options: [
								{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'Y',	content: currentStudent},
								{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 'N'}
							]}
					]
				},
				{
					xtype: 'enrollment-grouped-set',
					label: getString('NextThought.view.courseware.enrollment.Admission.AskCollege'),
					name: 'attended_other_institution',
					required: true,
					reveals: 'attending-highschool',
					hides: 'good-standing',
					isValueCorrect (value) {
						let attending = value['attended_other_institution'];

						return attending === 'N' || (attending === 'Y' && value['good_academic_standing'] !== 'N');
					},
					options: [
						{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'Y', inputs: [
							{type: 'checkbox', text: getString('NextThought.view.courseware.enrollment.Admission.CurrentStudent'), name: 'still_attending', useChar: true, defaultAnswer: 'N'},
							{type: 'checkbox', text: getString('NextThought.view.courseware.enrollment.Admission.BachPlus'), name: 'bachelors_or_higher', useChar: true, defaultAnswer: 'N'},
							{
								type: 'radio-group',
								label: getString('NextThought.view.courseware.enrollment.Admission.GoodAcademic'),
								name: 'good_academic_standing',
								defaultAnswer: 'N',
								correct: 'Y',
								required: true,
								options: [
									{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'Y'},
									{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 'N'}
								]
							}
						]},
						{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 'N'}
					]
				},
				{
					xtype: 'enrollment-set',
					name: 'good-standing',
					inputs: [
						{
							type: 'description',
							text: 'The class you are attempting to enroll in is a For-Credit Janux course. Only students who are currently in good academic standing may enroll in for credit Janux courses.'
						}
					]
				},
				{
					xtype: 'enrollment-grouped-set',
					label: 'Are you currently attending high school?',
					name: 'attending-highschool',
					required: true,
					wrongIfEmpty: true,
					noIncorrect: true,
					reveals:  ['general', 'signature'],
					hides: 'concurrent-contact',
					isValueCorrect (value) {
						var attending = value['attending-highschool'];

						return attending === 'N' || (attending === 'Y' && value['ok-highschool-student'] !== 'Y');
					},
					options: [
						{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'Y', inputs: [
							{
								type: 'radio-group',
								label: 'Are you an Oklahoma resident?',
								name: 'ok-highschool-student',
								correct: 'N',
								noIncorrect: true,
								defaultAnswer: 'N',
								sets: {
									input: 'years_of_oklahoma_residency',
									//This input's answer to mapped to what to set on the other input
									N: '0'
								},
								options: [
									{text: getString('NextThought.view.courseware.enrollment.Admission.Yes'), value: 'Y'},
									{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 'N'}
								]
							}
						]},
						{text: getString('NextThought.view.courseware.enrollment.Admission.No'), value: 'N'}
					]
				}
			]
		});

		me.submitBtnCfg = me.buttonCfg[0];

		me.enableBubble(['show-msg', 'enable-submission', 'update-buttons', 'go-back']);

		me.addressLines = ['street_line', 'mailing_street_line', 'contact_street_line'];

		me.nationsLink = $AppConfig.userObject.getLink('fmaep.country.names');
		me.statesLink = $AppConfig.userObject.getLink('fmaep.state.names');

		me.addListeners();

		if (me.status === 'Pending') {
			me.showPending();
		}else if (me.status === 'Rejected') {
			me.showRejection();
		} else {
			descriptionInputs.push({
				type: 'description',
				text: getString('NextThought.view.courseware.enrollment.Admission.OUQuest')
			});

			if (me.hasOpenOption) {
				descriptionInputs.push({
					type: 'link',
					text: getString('NextThought.view.courseware.enrollment.Admission.FreeCourse'),
					eventName: 'go-back'
				});
			} else if (me.hasStoreOption) {
				descriptionInputs.push({
					type: 'link',
					text: getString('NextThought.view.courseware.enrollment.Admission.LifelongLearner'),
					eventName: 'go-back'
				});
			}

			form.unshift({
				name: 'intro',
				label: getString('NextThought.view.courseware.enrollment.Admission.OUJanux'),
				items: [
					{
						xtype: 'enrollment-set',
						inputs: descriptionInputs
					}
				]
			});

			me.add(form);
			me.updateFromStorage();
			me.fillInNations();
			me.fillInStates();
		}

		me.on('prohibited', function (anchor) {
			var popover, parent;

			anchor = Ext.get(anchor);

			parent = anchor.up('.body-container');

			popover = me.prohibitedPopover.append(parent, {}, true);

			popover.on('click', function (e) {
				if (e.getTarget('.close')) {
					e.stopEvent();
					popover.destroy();
				}
			});
		});
	},

	afterRender: function () {
		this.callParent(arguments);
	},

	getButtonCfg: function () {
		return this.buttonCfg;
	},

	buttonClick: function (action) {
		if (action === 'submit-application') {
			this.maybeSubmit();
		}
	},

	fillInDefaults: function (values) {
		var user = $AppConfig.userObject,
			realname = user.get('realname'),
			firstName = user.get('FirstName'),
			lastName = user.get('LastName'),
			email = user.get('email');

		if (!values.first_name && firstName) {
			values.first_name = firstName;
		}

		if (!values.last_name && lastName) {
			values.last_name = lastName;
		}

		if (!values.contact_name && realname) {
			values.contact_name = realname;
		}

		if (!values.email && email) {
			values.email = email;
		}

		if (!values.contact_email && email) {
			values.contact_email = email;
		}

		return values;
	},

	stopClose: function () {
		var me = this,
			r;

		if (me.completed) {
			r = Promise.resolve();
		}else if (me.hasMask()) {
			r = Promise.reject();
		} else {
			r = new Promise(function (fulfill, reject) {
				Ext.Msg.show({
					title: getString('NextThought.view.courseware.enrollment.Admission.AppNotSubmitted'),
					msg: getString('NextThought.view.courseware.enrollment.Admission.ProgressLost'),
					icon: 'warning-red',
					buttons: {
						primary: {
							text: getString('NextThought.view.courseware.enrollment.Admission.StayFinish'),
							handler: reject
						},
						secondary: {
							text: getString('NextThought.view.courseware.enrollment.Admission.LeavePage'),
							handler: function () {
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

	showRejection: function (json) {
		this.removeAll(true);

		var fields = this.getFormForGroup('admission'),
			defaults = {
				Message: getString('NextThought.view.courseware.enrollment.Admission.TryLater'),
				ContactInformation: getString('NextThought.view.courseware.enrollment.Admission.HelpOrResubmit')
			};

		if (json && json.Message) {
			fields.unshift({
				name: 'rejected',
				label: getString('NextThought.view.courseware.enrollment.Admission.Corrections'),
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
				label: getString('NextThought.view.courseware.enrollment.Admission.UnabletoConfirm'),
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

	showPending: function (json) {
		var defaults = {
			Message: getFormattedString('NextThought.view.courseware.enrollment.Admission.ComeBackEnroll', {title: this.course.get('Title')}),
			ContactInformation: this.defaultMessages.ContactInformation
		};

		json = json || {};
		this.removeAll(true);

		this.add({
			name: 'rejected',
			label: getString('NextThought.view.courseware.enrollment.Admission.UnabletoConfirm'),
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

	showAlreadyExisted: function (json) {
		var defaults = {
			Message: getString('NextThought.view.courseware.enrollment.Admission.CantProcessNow'),
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

	showErrorState: function (json) {
		var defaults = {
			Message: getString('NextThought.view.courseware.enrollment.Admission.TryLater'),
			ContactInformation: this.defaultMessages.ContactInformation
		};

		json = json || {};

		this.removeAll(true);

		this.hidePricingInfo();

		this.add({
			name: 'rejected',
			label: getString('NextThought.view.courseware.enrollment.Admission.UnabletoConfirm'),
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

	showConcurrentSubmitted: function () {
		this.removeAll(true);

		this.add({
			name: 'submitted',
			labelCls: 'success',
			label: getString('NextThought.view.courseware.enrollment.Admission.InterestCE'),
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: getString('NextThought.view.courseware.enrollment.Admission.CECounselorContact')
						}
					]
				}
			]
		});
	},

	shouldAllowSubmission: function (value) {
		var me = this,
			preflightlink = $AppConfig.userObject.getLink('fmaep.admission.preflight'),
			groupConfig;

		value = value || me.getValue();

		groupConfig = me.groups[value.group];

		return me.isValidForSubmission(value.group)
			.then(function () {
				return new Promise(function (fulfill, reject) {
					if (!groupConfig.preflight) {
						fulfill();
					} else if (!preflightlink) {
						console.error('No Preflight to validate the admission form, allowing submit anyway');
						fulfill();
					} else {
						Service.post(preflightlink, value.postData)
							.then(function (response) {
								fulfill();
							})
							.catch(function (response) {
								var json = Ext.JSON.decode(response && response.responseText, true);

								me.showError(json);
								reject();
							});
					}
				});
			});
	},

	isValidForSubmission: function (group) {
		var valid = this.isValid(group);

		if (!valid)	 {
			this.fireEvent('show-msg', getString('NextThought.view.courseware.enrollment.Admission.FillOutAllInfo'), true, 5000);
			return Promise.reject();
		}

		return Promise.resolve();
	},

	handleResponse: function (json) {
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
				Message: getString('NextThought.view.courseware.enrollment.Admission.UnabletoConfirm')
			});
			this.showPending(json);
			this.clearStorage();
		} else if (json.Status === 201) {
			this.course.setEnrollmentLinks(json.Links);
			this.fireEvent('show-msg', json.Message || 'Your application was successful.', false, 5000);
			this.clearStorage();
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

	handleConcurrentResponse: function (json, success) {
		if (success) {
			this.completed = true;
			this.clearStorage();
			this.fireEvent('show-msg', (json && json.Message) || getString('NextThought.view.courseware.enrollment.Admission.ContactInfoSent'), false, 5000);
			this.showConcurrentSubmitted();
		} else {
			this.showError(json);
		}
	},

	getValue: function () {
		var value = this.mixins.form.getValue.call(this),
			group = 'admission', data;


		if (value['ok-highschool-student'] === 'Y') {
			group = 'concurrent';
			data = {
				name: value.contact_name,
				email: value.contact_email,
				phone: value.contact_phone,
				street_line: value.contact_street_line1,
				street_line2: value.contact_street_line2,
				street_line3: value.contact_street_line3,
				street_line4: value.contact_street_line4,
				city: value.contact_city,
				state: value.contact_state,
				zip: value.contact_zip,
				country: value.contact_country,
				date_of_birth: value.date_of_birth
			};
		}

		return {
			group: group,
			postData: data || value
		};
	},

	submitConcurrentForm: function (value) {
		var url = $AppConfig.userObject.getLink('concurrent.enrollment.notify');


		this.submitBtnCfg.disabled = true;
		this.fireEvent('update-buttons');
		this.addMask(getString('NextThought.view.courseware.enrollment.Admission.SendingContactInfo'));

		return Service.post(url, value.postData);
	},

	submitAdmission: function (value) {
		this.submitBtnCfg.disabled = true;
		this.fireEvent('update-buttons');
		this.addMask(getString('NextThought.view.courseware.enrollment.Admission.ProcessApp'));

		return this.complete(this, value.postData);
	},

	maybeSubmit: function () {
		var me = this, isValid,
			value = me.getValue(),
			preflight,
			groupConfig = this.groups[value.group];

		if (groupConfig.preflight) {
			preflight = me[groupConfig.preflight].call(me, value);
		} else {
			preflight = me.isValidForSubmission(value.group);
		}

		preflight
			.then(function () {
				isValid = true;

				return me[groupConfig.submit].call(me, value);
			}, function () {
				isValid = false;

				return Promise.reject();
			})
			.then(function (response) {
				var json = Ext.JSON.decode(response, true);

				me.removeMask();

				me[groupConfig.handler].call(me, json, true);
			})
			.catch(function (response) {
				me.removeMask();

				if (!isValid) {
					return;
				}

				var json;

				if (!response) {
					json = {
						message: getString('NextThought.view.courseware.enrollment.Admission.TryLater')
					};
				} else {
					json = Ext.JSON.decode(response.responseText || response, true);
				}

				me[groupConfig.handler].call(me, json, false);
			});
	}
});
