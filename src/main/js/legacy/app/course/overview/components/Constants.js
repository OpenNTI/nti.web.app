
const { encodeForURI } = require('@nti/lib-ntiids');

function getURLPart (obj) {
	return encodeForURI(obj.getId ? obj.getId() : obj.getID ? obj.getID() : obj.NTIID);
}

function getAssignmentRoute (course, lesson, obj) {
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/assignment/${encodeForURI(obj.getID())}/`;
}

function getDiscussionRoute (course, lesson, obj) {
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/object/${encodeForURI(obj.NTIID)}`;
}

function getAssessmentRoute (course, lesson, obj) {
	const target = obj.containerId || obj['Target-NTIID'];
	if (!target) {
		console.log('No target for object?', obj);
		return '';
	}
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/content/${encodeForURI(target)}/`;
}

function getOverviewPart (obj) {
	return encodeForURI(obj['Target-NTIID'] || obj['target-NTIID'] || obj.getID());
}

const MODAL_ROUTE_BUILDERS = {
	'dismiss': (course, lesson) => {
		return `/app/course/${getURLPart(course)}/lessons/${getURLPart(lesson)}/`;
	},

	'default': (course, lesson, obj, context) => {
		const {lesson:lessonOverride} = context || {};

		return `/app/course/${getURLPart(course)}/lessons/${getURLPart(lessonOverride || lesson)}/items/${getOverviewPart(obj)}`;
	}
};

const ROUTE_BUILDERS = {
	'application/vnd.nextthought.ntivideo': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/video/${getURLPart(obj)}/`;
	},

	'application/vnd.nextthought.relatedworkref': (course, lesson, obj, context, editMode) => {
		if (obj.isExternal && !obj.isEmbeddableDocument && context !== 'discussions') {
			return {
				href: obj.href,
				target: '_blank'
			};
		}

		const ntiid = (obj.isEmbeddableDocument || obj.isExternal) ? obj.NTIID : obj['target-NTIID'] || obj.NTIID;

		const editPath = editMode ? 'edit/' : '';

		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/content/${encodeForURI(ntiid)}/${editPath}`;
	},


	'application/vnd.nextthought.ltiexternaltoolasset': (course, lesson, obj, context, editMode) => {
		const editPath = editMode ? 'edit/' : '';
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/content/${encodeForURI(obj.NTIID)}/${editPath}`;
	},

	'application/vnd.nextthought.ntitimeline': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/object/${encodeForURI(obj.NTIID)}/`;
	},


	'application/vnd.nextthought.naquestionset': getAssessmentRoute,
	'application/vnd.nextthought.naquestionbank': getAssessmentRoute,
	'application/vnd.nextthought.narandomizedquestionset': getAssessmentRoute,

	'application/vnd.nextthought.assessment.discussionassignment': getAssignmentRoute,
	'application/vnd.nextthought.assessment.timedassignment': getAssignmentRoute,
	'application/vnd.nextthought.assessment.assignment': getAssignmentRoute,
	'application/vnd.nextthought.surveyref': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/content/${encodeForURI(obj['Target-NTIID'] || obj.NTIID)}`;
	},

	'application/vnd.nextthought.forums.topic': getDiscussionRoute,
	'application/vnd.nextthought.forums.communityheadlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.communitytopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.contentheadlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.dflheadlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.dfltopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.headlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.forum': getDiscussionRoute,
	'application/vnd.nextthought.forums.communityforum': getDiscussionRoute,
	'application/vnd.nextthought.forums.contentforum': getDiscussionRoute,
	'application/vnd.nextthought.forums.dflforum': getDiscussionRoute,

};

module.exports = exports = {
	ROUTE_BUILDERS,
	MODAL_ROUTE_BUILDERS
};
