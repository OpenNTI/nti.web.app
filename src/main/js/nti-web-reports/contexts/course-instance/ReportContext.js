import ReportContext from '../abstract/ReportContext';
import ContentRegistry from '../ContextRegistry';

@ContentRegistry.register('application/vnd.nextthought.courses.courseinstance')
export default class CourseInstanceContext extends ReportContext {
	groups = [
		{
			reports: [
				{rel: 'report-CourseSummaryReport.pdf'},
				{rel: 'report-SelfAssessmentSummaryReport.pdf'}
			]
		}
	]

}
