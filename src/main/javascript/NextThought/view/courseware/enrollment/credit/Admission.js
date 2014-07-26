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
			items: [
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you currently attending the University of Oklahoma?',
					inputs: [
						{type: 'radio-group', name: 'attending', correct: false, options: [
							{text: 'Yes', value: true, name: 'attending'},
							{text: 'No', value: false, name: 'attending'}
						]}
					]
				},
				{
					xtype: 'enrollment-credit-set',
					label: 'Are you attending High School?',
					inputs: [
						{type: 'radio-group', name: 'highschool', correct: false, options: [
							{text: 'Yes', value: true, name: 'highschool'},
							{text: 'No', value: false, name: 'highschool'}
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
		}
	],


	revealItem: function(name) {
		var item = this.down('[name="' + name + '"]');

		if (item) {
			item.show();
		} else {
			console.error('No item to reveal: ', name);
		}
	}
});
