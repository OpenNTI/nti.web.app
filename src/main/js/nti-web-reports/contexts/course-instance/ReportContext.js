import {scoped} from 'nti-lib-locale';

import ReportContext from '../abstract/ReportContext';
import ContentRegistry from '../ContextRegistry';

const DEFAULT_TEXT = {
	courseSummary: {
		name: 'Course Summary',
		description: 'Course summary of student engagement and assessment'
	},
	selfAssessmentSummary: {
		name: 'Self Assessment Summary Report',
		description: 'Summary of assessments'
	}
};
const t = scoped('nti-web-reports.context.course-instance', DEFAULT_TEXT);

@ContentRegistry.register('application/vnd.nextthought.courses.courseinstance')
export default class CourseInstanceContext extends ReportContext {
	groups = [
		{
			name: '',
			rels: [
				'report-CourseSummaryReport.pdf',
				'report-SelfAssessmentSummaryReport.pdf'
			]
		}
	]

	reports = [
		{
			rel: 'report-CourseSummaryReport.pdf',
			name: t('courseSummary.name'),
			description: t('courseSummary.description'),
			'supported_types': ['pdf']
		},
		{
			rel: 'report-SelfAssessmentSummaryReport.pdf',
			name: t('selfAssessmentSummary.name'),
			description: t('selfAssessmentSummary.description'),
			'supported_types': ['pdf']
		}
	]
}
