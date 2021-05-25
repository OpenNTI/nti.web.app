const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');

function getURLPart(obj) {
	try {
		return encodeForURI(
			obj.getId ? obj.getId() : obj.getID ? obj.getID() : obj.NTIID
		);
	} catch (e) {
		console.error(e, obj);
		throw e;
	}
}

function getAssignmentRoute(course, lesson, obj) {
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
		lesson.NTIID
	)}/assignment/${encodeForURI(obj.getID())}/`;
}

function getAssessmentRoute(course, lesson, obj) {
	const target = obj.containerId || obj['Target-NTIID'];
	if (!target) {
		console.log('No target for object?', obj);
		return '';
	}
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
		lesson.NTIID
	)}/content/${encodeForURI(target)}/`;
}

function getDiscussionRefRoute(course, lesson, obj) {
	if (!obj.target || !isNTIID(obj.target) || !lesson.NTIID) {
		return '#';
	}

	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
		lesson.NTIID
	)}/object/${encodeForURI(obj.target)}`;
}

function getAssignmentRefRoute(course, lesson, obj) {
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
		lesson.NTIID
	)}/assignment/${encodeForURI(obj.target)}/`;
}

function getAssessmentRefRoute(course, lesson, obj) {
	const target = obj.containerId || obj.target;
	if (!target) {
		console.log('No target for object?', obj);
		return '';
	}
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
		lesson.NTIID
	)}/content/${encodeForURI(target)}/`;
}

function getOverviewPart(obj, context) {
	if (obj.isTableOfContentsNode) {
		const { relatedWorkRef } = context;

		return relatedWorkRef
			? `${getOverviewPart(relatedWorkRef)}/${getURLPart(obj)}`
			: `${getURLPart(obj)}`;
	}

	if (obj.isVideo) {
		const ref = obj.getLinkProperty('ref', 'RefNTIID');
		return ref ? encodeForURI(ref) : getURLPart(obj);
	}

	return getURLPart(obj);
}

function modalDefault(course, lesson, obj, context) {
	const { lesson: lessonOverride } = context || {};

	return `/app/course/${getURLPart(course)}/lessons/${getURLPart(
		lessonOverride || lesson
	)}/items/${getOverviewPart(obj, context)}`;
}

function mediaViewer(course, lesson, obj, context, itemRoute) {
	const itemId = getURLPart(obj);
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
		lesson.NTIID
	)}${itemRoute}/viewer/${itemId}/`;
}

const MODAL_ROUTE_BUILDERS = {
	dismiss: (course, lesson) => {
		const lessonId =
			typeof lesson === 'string'
				? encodeForURI(lesson)
				: getURLPart(lesson);

		return `/app/course/${getURLPart(course)}/lessons/${lessonId}/`;
	},

	'application/vnd.nextthought.ntivideo': (
		course,
		lesson,
		obj,
		context,
		...others
	) =>
		((context || {}).mediaViewer ? mediaViewer : modalDefault)(
			course,
			lesson,
			obj,
			context,
			...others
		),

	'application/vnd.nextthought.note': (course, lesson, obj, context) => {
		return () => {
			console.log(obj, context);
		};
	},

	default: modalDefault,
};

const ROUTE_BUILDERS = {
	'application/vnd.nextthought.ntivideo': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
			lesson.NTIID
		)}/video/${getURLPart(obj)}/`;
	},

	'application/vnd.nextthought.relatedworkref': (
		course,
		lesson,
		obj,
		context,
		editMode
	) => {
		if (
			obj.isExternal &&
			!obj.isEmbedableDocument &&
			context !== 'discussions'
		) {
			return {
				href: obj.href,
				target: '_blank',
			};
		}

		const ntiid =
			obj.isEmbedableDocument || obj.isExternal
				? obj.NTIID
				: obj['target-NTIID'] || obj.NTIID;

		const editPath = editMode ? 'edit/' : '';

		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
			lesson.NTIID
		)}/content/${encodeForURI(ntiid)}/${editPath}`;
	},

	'application/vnd.nextthought.ltiexternaltoolasset': (
		course,
		lesson,
		obj,
		context,
		editMode
	) => {
		const editPath = editMode ? 'edit/' : '';
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
			lesson.NTIID
		)}/content/${encodeForURI(obj.NTIID)}/${editPath}`;
	},

	'application/vnd.nextthought.ntitimeline': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
			lesson.NTIID
		)}/object/${encodeForURI(obj.NTIID)}/`;
	},

	'application/vnd.nextthought.discussion': getDiscussionRefRoute,
	'application/vnd.nextthought.discussionref': getDiscussionRefRoute,

	'application/vnd.nextthought.questionsetref': getAssessmentRefRoute,
	'application/vnd.nextthought.naquestionset': getAssessmentRoute,
	'application/vnd.nextthought.naquestionbank': getAssessmentRoute,
	'application/vnd.nextthought.narandomizedquestionset': getAssessmentRoute,

	'application/vnd.nextthought.assignmentref': getAssignmentRefRoute,
	'application/vnd.nextthought.assessment.discussionassignment':
		getAssignmentRoute,
	'application/vnd.nextthought.assessment.timedassignment':
		getAssignmentRoute,
	'application/vnd.nextthought.assessment.assignment': getAssignmentRoute,

	'application/vnd.nextthought.surveyref': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(
			lesson.NTIID
		)}/content/${encodeForURI(obj['Target-NTIID'] || obj.NTIID)}`;
	},

	'application/vnd.nextthought.scormcontentref': (course, lesson, obj) => {
		return {
			href:
				obj.ScormContentInfo &&
				obj.ScormContentInfo.getLink('LaunchSCORM'),
			target: '_blank',
		};
	},
};

module.exports = exports = {
	ROUTE_BUILDERS,
	MODAL_ROUTE_BUILDERS,
};
