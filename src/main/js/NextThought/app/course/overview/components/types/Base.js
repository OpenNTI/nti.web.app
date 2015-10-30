Ext.define('NextThought.app.course.overview.components.types.Base', {
	statics: {
		SECTION_TITLE_MAP: {
			'video': getString('NextThought.view.courseware.overview.View.video'),
			'discussions': getString('NextThought.view.courseware.overview.View.discussion'),
			'additional': getString('NextThought.view.courseware.overview.View.additional'),
			'required': getString('NextThought.view.courseware.overview.View.required'),
			'assessments': getString('NextThought.view.courseware.overview.View.assessment'),
			'session-overview': getString('NextThought.view.courseware.overview.View.session'),
			'assignments': getString('NextThought.view.courseware.overview.View.assignments')
		},


		SECTION_TYPE_MAP: {
			'course-overview-ntivideo': 'video',
			'course-overview-content': 'additional',
			'course-overview-discussion': 'discussions',
			'course-overview-externallink': 'additional',
			'course-overview-naquestionset': 'assessments',
			'course-overview-assignment': 'assignments'
		},


		SECTION_CONTAINER_MAP: {
			'video': 'course-overview-section',
			'discussions': 'course-overview-section',
			'additional': 'course-overview-section',
			'required': 'course-overview-section',
			'assessments': 'course-overview-section',
			'session-overview': 'course-overview-section',
			'assigments': 'course-overview-section'
		}
	}
});
