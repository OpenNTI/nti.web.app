import { scoped } from '@nti/lib-locale';

import { FilterSetRule, FilterSetRegistry } from './common';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.type.CourseMembership',
	{
		enrolled: 'Enrolled In',
		notEnrolled: 'Not Enrolled In',
	}
);

const Type =
	'application/vnd.nextthought.courseware.segments.coursemembershipfilterset';

const Operators = {
	enrolled: 'enrolled in',
	notEnrolled: 'not enrolled in',
};

export class CourseMembershipFilterSet extends FilterSetRule {
	static Rules = {
		isenrolled: {
			input: 'course',
			getValue: filterSet => filterSet.course,
			setValue: (filterSet, value) => filterSet.setCourse(value),

			label: t('enrolled'),
			FilterSet: CourseMembershipFilterSet,
		},
		isnotenrolled: {
			input: 'course',
			getValue: filterSet => filterSet.course,
			setValue: (filterSet, value) => filterSet.setCourse(value),

			label: t('notEnrolled'),
			FilterSet: CourseMembershipFilterSet,
		},
	};

	type = Type;

	get course() {
		return this.data.course_ntiid;
	}

	setCourse(course) {
		this.setData({
			course_ntiid: course,
		});
	}

	getActiveRule() {
		const { operator } = this.data;

		return operator === Operators.enrolled ? 'isenrolled' : 'isnotenrolled';
	}

	setActiveRule(rule) {
		this.setData({
			operator:
				rule === CourseMembershipFilterSet.Rules.isenrolled
					? Operators.enrolled
					: Operators.notEnrolled,
		});
	}

	toJSON() {
		const json = super.toJSON();
		const courseId =
			typeof json.course_ntiid === 'string'
				? json.course_ntiid
				: json.course_ntiid?.getLinkProperty?.(
						'CourseInstance',
						'ntiid'
				  );

		json.course_ntiid = courseId ?? null;

		return json;
	}
}

FilterSetRegistry.register(Type, CourseMembershipFilterSet);
