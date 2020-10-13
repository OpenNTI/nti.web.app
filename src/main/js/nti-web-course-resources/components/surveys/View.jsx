import React from 'react';
import PropTypes from 'prop-types';
import {Hooks, Loading, Errors} from '@nti/web-commons';

import Table from '../table';

const {useResolver} = Hooks;
const {isPending, isResolved, isErrored} = useResolver;

SurveyResources.propTypes = {
	course: PropTypes.shape({
		getAllSurveys: PropTypes.func
	})
};
export default function SurveyResources ({course, ...otherProps}) {
	const resolver = useResolver(async () => {
		const batch = await course?.getAllSurveys();

		return batch?.Items;
	}, [course]);

	const loading = isPending(resolver);
	const error = isErrored(resolver) ? resolver : null;
	const surveys = isResolved(resolver) ? resolver : null;

	return (
		<Loading.Placeholder loading={loading} fallback={(<Loading.Spinner.Large />)}>
			{error && (<Errors.Message error={error} />)}
			{surveys && (
				<Table items={surveys} {...otherProps} />
			)}
		</Loading.Placeholder>
	);
}
