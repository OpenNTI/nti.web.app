window.NTIStrings = window.NTIStrings || {};

NTIStrings['reset-password-not-allowed-subtext'] = 'You are not allowed to change your password at this time.  Please contact the OSU IT HelpDesk at (405)744-HELP (4357) or <a href="mailto:helpdesk@okstate.edu">helpdesk@okstate.edu</a>';

NTIStrings['library:branding navigation-label'] = 'Oklahoma State University';
NTIStrings['library:branding logo-alt-text'] = 'Oklahoma State University';

NTIStrings['course-info.description-widget.enrolled'] = 'You are enrolled for credit.';


NTIStrings['course-info.open-course-widget.message'] = 'See all of the course content with limited access to discussions and assessments. ' +
															'Participation in the open course will not be certified on an official transcript.';


NTIStrings.EnrollmentText = {
	OpenEnrollment: {
		notEnrolled: {
			title: 'Take the Course for Free',
			price: 0,
			information: 'See all of the course content with limited access to discussions and assessments. ' +
							'Participation in the open course will not be certified on an official transcript.'
		},
		enrolled: {
			title: 'You are in the Open Course',
			cls: 'enrolled',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: ''},
				{href: 'profile', text: 'Complete Your Profile'}
			]
		},
		archivedEnrolled: {
			title: 'You Took the Open Course!',
			cls: 'enrolled',
			information: 'Thanks for your participation!' +
							'The content of this course will remain available for you to review at any time.'
		},
		archivedNotEnrolled: {
			title: 'This Course is Archived.',
			price: 0,
			information: 'Archived courses are out of session but all course content will remain available ' +
							'including the lectures, course materials, quizzes, and discussions.'
		}
	},
	FiveminuteEnrollment: {
		notEnrolled: {
			title: 'Earn College Credit',
			information: 'Earn transcripted college credit from Oklahoma State University',
			warning: 'Not available after {date}.',
			cls: 'checkbox'
		},
		enrolled: {
			title: 'Enrolled for College Credit!',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: ''},
				{href: 'profile', text: 'Complete Your Profile'}
			],
			cls: 'enrolled',
			drop: 'If you are currently enrolled as an OSU student, visit ' +
				'<a class=\'link\' target=\'_blank\' href=\'http://prodosu.okstate.edu/\'>student self services</a>. ' +
				'If not, please contact the ' +
				'<a class=\'link\' target=\'_blank\' href=\'https://admissions.okstate.edu\'>Admission Office</a>' +
				'{drop}.'
		},
		archivedEnrolled: {
			title: 'Enrolled for College Credit!',
			information: 'Thanks for your participation!' +
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
			information: 'Transcripted credit is available from Oklahoma State University but unfortunately ' +
							'we cannot process an application at this time. Please contact the ' +
							'<a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>',
			cls: 'down'
		}
	},
	StoreEnrollment: {
		notEnrolled: {
			title: 'Lifelong Learner',
			information: 'Gain complete access to interact with all course content, including lectures, ' +
							'course materials, quizzes, and discussions once the class is in session.',
			refund: 'Enrollment is not refundable.'
		},
		enrolled: {
			title: 'You\'re Enrolled as a Lifelong Learner',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: ''},
				{href: 'profile', text: 'Complete Your Profile'}
			],
			cls: 'enrolled'
		},
		archivedEnrolled: {
			title: 'You took the Lifelong Learner',
			information: 'Thanks for your participation!' +
							'The content of this course will remain available for you to review at any time.'
		},
		archivedNotEnrolled: {
			title: 'This Course is Archived',
			information: 'Archived courses are out of session but all course content will remain available ' +
							'including the lectures, course materials, quizzes, and discussions.'
		}
	}
};
