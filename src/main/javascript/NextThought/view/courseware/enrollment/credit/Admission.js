Ext.define('NextThought.view.courseware.enrollment.credit.Admission', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-credit-admission',

	requires: ['NextThought.view.courseware.enrollment.credit.parts.*'],

	defaultType: 'enrollment-credit-group',

	items: [
		{
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
						{text: 'View the FAQ\'s', type: 'link', href: '#'}
					]
				}
			]
		},
		{
			name: 'preliminary',
			label: 'Preliminary Questions',
			reveals: 'general',
			hides: 'not-eligible',
			items: [
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you currently attending the University of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'attending', correct: 'false', options: [
							{text: 'Yes', value: true},
							{text: 'No', value: false}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you attending High School?',
					inputs: [
						{type: 'radio-group', name: 'highschool', correct: 'false', options: [
							{text: 'Yes', value: true},
							{text: 'No', value: false}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you prohibited from enrolling in any University of Oklahoma progam?',
					inputs: [
						{type: 'checkbox', text: 'I am not prohibited.', name: 'prohibited', correct: true}
					],
					help: [
						{text: 'Why would I be prohibited?', type: 'link', href: '#'}
					]
				}
			]
		},
		//{
		//	name: 'not-eligible',
		//	label: 'You are not eligible for admission',
		//	items: [
		//		{
		//			xtype: 'enrollment-credit-set',
		//			inputs: [
		//				{type: 'description', text: ['Based on your answers above you are unable to be admitted']}
		//			],
		//			help: [
		//				{text: 'Why am I unelgible?', type: 'link', href: '#'},
		//				{text: 'Take the free course instead.', type: 'event', event: 'goto-free'}
		//			]
		//		}
		//	]
		//},
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
					label: 'What is your full name?',
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
						{type: 'text', name: 'date_of_birth', placeholder: 'MM / DD / YYYY', size: 'third'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'What is your gender?',
					inputs: [
						{type: 'radio-group', name: 'gender', options: [
							{text: 'Male', value: 'male'},
							{text: 'Female', value: 'female'},
							{text: 'I\'d rather not say...', value: null}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Permanent Address',
					inputs: [
						{type: 'text', name: 'street_line_1', placeholder: 'Address', required: true, size: 'full'},
						{type: 'text', name: 'street_line_2', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'city', placeholder: 'City / Town', size: 'large'},
						{type: 'text', name: 'state', placeholder: 'State / Province / Territory / Region', size: 'full'},
						{type: 'dropdown', name: 'nation_code', placeholder: 'Country', required: true, size: 'large left', options: [
							{value: 'AF', text: 'Afghanistan'},
							{value: 'AX', text: 'Aland Islands'},
							{value: 'AL', text: 'Albania'},
							{value: 'BS', text: 'Bahamas'},
							{value: 'KH', text: 'Cambodia'},
							{value: 'CA', text: 'Canada'},
							{value: 'CC', text: 'Cocos (Keeling) Islands'},
							{value: 'FR', text: 'France'},
							{value: 'GR', text: 'Greece'},
							{value: 'IS', text: 'Iceland'},
							{value: 'KW', text: 'Kuwait'},
							{value: 'MC', text: 'Monaco'},
							{value: 'PR', text: 'Puerto Rico'},
							{value: 'GS', text: 'South Georgia and the South Sandwich Islands'},
							{value: 'US', text: 'United States'}
						]},
						{type: 'text', name: 'postal_code', placeholder: 'ZIP / Postal Code', size: 'small left'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					inputs: [
						{type: 'checkbox', text: 'My mailing address is different', reveals: 'mailing-address', correct: true}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					name: 'mailing-address',
					label: 'Mailing Address',
					inputs: [
						{type: 'text', name: 'mailing_street_line_1', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_street_line_2', placeholder: 'Address', size: 'full'},
						{type: 'text', name: 'mailing_city', placeholder: 'City / Town', size: 'large'},
						{type: 'text', name: 'mailing_state', placeholder: 'State / Province / Territory / Region', size: 'full'},
						{type: 'dropdown', name: 'mailing_nation_code', placeholder: 'Country', size: 'large left', options: [
							{value: 'AF', text: 'Afghanistan'},
							{value: 'AX', text: 'Aland Islands'},
							{value: 'AL', text: 'Albania'},
							{value: 'BS', text: 'Bahamas'},
							{value: 'KH', text: 'Cambodia'},
							{value: 'CA', text: 'Canada'},
							{value: 'CC', text: 'Cocos (Keeling) Islands'},
							{value: 'FR', text: 'France'},
							{value: 'GR', text: 'Greece'},
							{value: 'IS', text: 'Iceland'},
							{value: 'KW', text: 'Kuwait'},
							{value: 'MC', text: 'Monaco'},
							{value: 'PR', text: 'Puerto Rico'},
							{value: 'GS', text: 'South Georgia and the South Sandwich Islands'},
							{value: 'US', text: 'United States'}
						]},
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
						{type: 'text', name: 'social_security_number', placeholder: 'XXX - XX - XXXX', help: 'What should we say here?'}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you a U.S. Citizen?',
					inputs: [
						{type: 'radio-group', name: 'country_of_citizenship', options: [
							{text: 'Yes', value: 'united states'},
							{text: 'No. I am a citizen of {input}.', value: 'input'}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you a resident of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'resident', options: [
							{text: 'Yes. I\'ve been a resident for {input} years', value: 'input', inputWidth: 48},
							{text: 'No.', value: 0}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you a highschool graduate?',
					inputs: [
						{type: 'radio-group', name: 'completed-highschool', options: [
							{text: 'Yes.'},
							{text: 'No.'}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Have you ever attended the University of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'sooner_id', options: [
							{text: 'Yes, and my Sooner ID was {input}.', value: 'input'},
							{text: 'No.', value: ''}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Have you ever attended another college or university?',
					inputs: [
						{type: 'checkbox-group', name: 'attended_other_institution', options: [
							{type: 'checkbox', text: 'I am still attending.', name: 'still_attending'},
							{type: 'checkbox', text: 'I am in good academic standing.', name: 'good_academic_standing'},
							{type: 'checkbox', text: 'I have obtained a Bachelor\'s degree or highter.', name: 'bachelors_or_higher'}
						]}
					]
				}
			]
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.on({
			'reveal-item': 'revealItem',
			'hide-item': 'hideItem'
		});
	},


	hideItem: function(name) {
		var item = this.down('[name=' + name + ']');

		if (item) {
			item.hide();
		} else {
			console.error('No item to hide: ', name);
		}
	},


	revealItem: function(name) {
		var item = this.down('[name="' + name + '"]');

		if (item) {
			item.show();
		} else {
			console.error('No item to reveal: ', name);
		}
	}
});
