FiveminuteEnrollment: {
		notEnrolled: {
			title: 'Earn College Credit',
			information: 'Earn transcripted college credit',
			warning: 'Not available after {date}.',
			cls: 'checkbox'
		},
		enrolled: {
			title: 'Enrolled for College Credit!',
			information: 'Class begins {date}.',
			links: [
				{href: 'welcome', text: 'Get Acquainted with Janux'},
				{href: 'profile', text: 'Complete Your Profile'}
			],
			cls: 'enrolled',
			drop: 'If you are currently enrolled as an OU student, visit ' +
				'<a class=\'link\' target=\'_blank\' href=\'http://ozone.ou.edu\'>oZone</a>. ' +
				'If not, please contact the ' +
				'<a class=\'link\' target=\'_blank\' href=\'http://www.ou.edu/admissions.html\'>Admission office</a>' +
				'{drop}.'
		},
		archivedEnrolled: {
			title: 'Enrolled for College Credit!',
			information: 'Thanks for your participation in OU Janux!' +
							'The content of this course will remain available for you to review at any time.'
		},
		admissionPending: {
			title: 'Admission Pending...',
			information: 'We\'re processing your request to earn college credit. ' +
							'This process should take no more than two business days. ' +
							'If you believe there has been an error, please contact the ' +
							'<a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>',
			cls: 'pending'
		},
		admissionRejected: {
			title: 'We are unable to confirm your eligibility to enroll through this process.',
			information: 'Please contact the <a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>' +
							'or <a class=\'link\' href=\'resubmit\'>resubmit your application.</a>',
			cls: 'rejected'
		},
		apiDown: {
			title: 'Earn College Credit',
			information: 'Transcripted credit is available from the University of Oklahoma but unfortunately ' +
							'we cannot process an application at this time. Please contact the ' +
							'<a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>',
			cls: 'down'
		},
		unsupported: {
			title: 'Earn College Credit',
			information: 'Your browser (FireFox) does not support the enrollment process. Please try Chrome, Safari, or Internet Explorer.'
		}
	},