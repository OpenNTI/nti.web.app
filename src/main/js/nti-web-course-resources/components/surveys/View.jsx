import React from 'react';
import PropTypes from 'prop-types';
import { scoped } from '@nti/lib-locale';
import { Hooks, Loading, Errors } from '@nti/web-commons';
import { searchable, contextual } from '@nti/web-search';

import Table from '../table';

const t = scoped('nti-course-resources.surveys.View', {
	surveys: 'Surveys',
});

const { useResolver } = Hooks;
const { isPending, isResolved, isErrored } = useResolver;

SurveyResources.propTypes = {
	course: PropTypes.shape({
		getAllSurveys: PropTypes.func,
	}),
};
function SurveyResources({ course, ...otherProps }) {
	const resolver = useResolver(async () => {
		const batch = await course?.getAllSurveys();

		return batch?.Items;
	}, [course]);

	const loading = isPending(resolver);
	const error = isErrored(resolver) ? resolver : null;
	const surveys = isResolved(resolver) ? resolver : null;

	return (
		<Loading.Placeholder
			loading={loading}
			fallback={<Loading.Spinner.Large />}
		>
			{error && <Errors.Message error={error} />}
			{surveys && (
				<Table
					items={surveys}
					course={course}
					{...otherProps}
					surveys
				/>
			)}
		</Loading.Placeholder>
	);
}

export default searchable()(contextual(t('surveys'))(SurveyResources));
