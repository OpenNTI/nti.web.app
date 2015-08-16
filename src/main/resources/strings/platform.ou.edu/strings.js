window.NTIStrings = window.NTIStrings || {};

NTIStrings['months'] = {
	1: 'Spring',
	2: 'Spring',
	3: 'Spring',
	4: 'Spring',
	5: 'Summer',
	6: 'Summer',
	7: 'Summer',
	8: 'Fall',
	9: 'Fall',
	10: 'Fall',
	11: 'Fall',
	12: 'Fall'
};

NTIStrings['application.title-bar-prefix'] = 'Janux';
NTIStrings['NextThougth.view.account.activity.joined.community'] = 'Janux';

NTIStrings['UnresolvedUsernamePattern'] = 'Anonymous ####';
NTIStrings['course.catalog'] = 'Available Courses';
NTIStrings['course.catalog.archive'] = 'Archived Courses';
NTIStrings['Coming Soon'] = 'Upcoming Courses';
NTIStrings['library:branding navigation-label'] = 'The University of Oklahoma';
NTIStrings['library:branding logo-alt-text'] = 'The University of Oklahoma';
NTIStrings['library:branding message-title'] = 'Online Learning Initiative';
NTIStrings['library:branding message'] = 'The University of Oklahoma is proud to announce an exciting new partnership with NextThought!';

NTIStrings['reset-password-not-allowed-subtext'] = 'You are not allowed to change your password at this time.  Please contact OU Information Technology at 325-Help for assistance.';

NTIStrings['course-info.description-widget.enrolled'] = 'You are enrolled for credit.';

NTIStrings['course-info.course-supoprt.phone'] = '(405) 325-HELP';
NTIStrings['course-info.course-supoprt.link1.Label'] = 'janux@ou.edu';
NTIStrings['course-info.course-supoprt.link1.URL'] = 'mailto:janux@ou.edu';
NTIStrings['course-info.course-supoprt.link2.Label'] = 'Service Centers';
NTIStrings['course-info.course-supoprt.link2.URL'] = 'http://www.ou.edu/content/ouit/help/personal.html';
NTIStrings['course-info.course-supoprt.link3.Label'] = '';
NTIStrings['course-info.course-supoprt.link3.URL'] = '';

NTIStrings['gift-support.link'] = 'mailto:historychannel@ou.edu';
NTIStrings['gift-support.label'] = 'HistoryChannel@ou.edu';

NTIStrings['enroll.detail'] = '';
NTIStrings['drop.detail'] = 'Dropping the course will remove it from your library, and you will no longer have access to the course materials.';

NTIStrings['enrollment.enroll.active.description'] = '{Title} has been added to your library. This open course is already in progress so you can start participating right away. Visit the Courses tab to access your materials and get started now.';
NTIStrings['enrollment.enroll.preview.description'] = 'This course has been added to your library and will begin on {StartDate:date("F j, Y")}. This course is open, so you will have complete access to all of the course content, discussions, and social features.<br/><br/><b>OU Students:</b> If you are a current OU student, you can enroll in JANUX courses on <a class="enrollLink" href="http://ozone.ou.edu/" target="_blank">oZone</a> to earn credit. The corresponding OU course number is {Name}.<br/><br/>If you are not an OU student but want to enroll for credit, see about becoming a <a class="enrollLink" href="http://www.ou.edu/admissions/nondegree/" target="_blank">Special Student</a>.';

NTIStrings['SubscribeToVendor'] = 'Yes, I\'d like to sign up for HISTORY email updates.';

NTIStrings['SubscribeToVendorLegal'] = 'By opting in for email updates you agree to receive emails from HISTORY Channel and A+E Networks. ' +
									'You can withdraw your consent at any time. More Details: <a href="http://www.aenetworks.com/privacy" target="_blank">Privacy Policy</a> | ' +
									'<a href="http://www.aenetworks.com/terms" target="_blank">Terms of Use</a> | ' +
									'<a href="http://www.aenetworks.com/contact" target="_blank">Contact Us</a>';

NTIStrings['OUStudentAdmissionMessage'] = 'Please sign up for the course using your <a href="http://ozone.ou.edu" target="_blank">Ozone</a> account. Note: not all Janux courses are available for credit to OU students.'; 

NTIStrings.CourseSpecific = {
	'tag:nextthought.com,2011-10:NTI-CourseInfo-Spring2015_LSTD_1153': {
		AlreadyEnrolled: 'LSTD 1153.500 fulfills US History Gen Ed requirement. ' +
							'To enroll, visit <a href="http://ozone.ou.edu" target="_blank">ozone.ou.edu</a> and enroll in LSTD 1153, Section 500.'
	}
};

NTIStrings.EnrollmentText = {
	OpenEnrollment: {
		notEnrolled: {
			title: 'Enroll for Free',
			price: 0,
			information: 'Gain complete access to interact with all course content, including lectures, ' +
							'course materials, quizzes, and discussions once the class is in session.'
		},
		enrolled: {
			title: 'You are in the Open Course',
			cls: 'enrolled',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: 'Get Acquainted with Janux'},
				{href: 'profile', text: 'Complete Your Profile'}
			]
		},
		archivedEnrolled: {
			title: 'You Took the Open Course!',
			cls: 'enrolled',
			information: 'Thanks for your participation in OU Janux! ' +
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
			information: 'Earn transcripted college credit from the University of Oklahoma',
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
				{href: 'welcome', text: 'Get Acquainted with Janux'},
				{href: 'profile', text: 'Complete Your Profile'}
			],
			cls: 'enrolled'
		},
		archivedEnrolled: {
			title: 'You took the Lifelong Learner',
			information: 'Thanks for your participation in OU Janux!' +
							'The content of this course will remain available for you to review at any time.'
		},
		archivedNotEnrolled: {
			title: 'This Course is Archived',
			information: 'Archived courses are out of session but all course content will remain available ' +
							'including the lectures, course materials, quizzes, and discussions.'
		}
	}
};
