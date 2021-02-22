import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { resolveNavigateToSearchHit } from '../resolvers';

const createFragment = fragment => ({ __html: fragment });
const createAnotherFragment = fragment => ({ __html: ' ... ' + fragment });

Fragments.propTypes = {
	fragments: PropTypes.arrayOf(PropTypes.object),
	hit: PropTypes.object.isRequired,
	navigateToSearchHit: PropTypes.func,
};
export default function Fragments({
	fragments = [],
	hit,
	navigateToSearchHit,
}) {
	const navigateToFragment = useCallback(
		async fragment => {
			const {
				obj,
				fragIndex,
				containerId,
			} = await resolveNavigateToSearchHit(hit, fragment);
			return navigateToSearchHit(obj, hit, fragIndex, containerId);
		},
		[hit]
	);

	return (
		<div className="hit-fragments">
			{fragments.map((fragment, index) => {
				return (
					<div
						className="hit-fragment"
						role="mark"
						key={index}
						onClick={() => navigateToFragment(fragment)}
						dangerouslySetInnerHTML={
							index === 0
								? createFragment(fragment.text)
								: createAnotherFragment(fragment.text)
						}
					/>
				);
			})}
		</div>
	);
}
