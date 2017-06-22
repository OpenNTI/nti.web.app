import React from 'react';
import PropTypes from 'prop-types';

import {
	resolveNavigateToSearchHit
} from '../resolvers';

export default class Fragments extends React.Component {
	static propTypes = {
		fragments: PropTypes.arrayOf(PropTypes.object),
		hit: PropTypes.object.isRequired,
		navigateToSearchHit: PropTypes.func
	}

	render () {
		const {fragments = [], hit, navigateToSearchHit} = this.props;

		function createFragment (fragment) {
			return {__html: fragment};
		}

		function createAnotherFragment (fragment) {
			return {__html: ' ... ' + fragment};
		}

		function navigateToFragment (fragment) {
			resolveNavigateToSearchHit(hit, fragment)
				.then(({obj, fragIndex, containerId}) => {
					return navigateToSearchHit(obj, hit, fragIndex, containerId);
				});
		}

		return (
			<div className="hit-fragments">
				{
					fragments.map((fragment, index) => {
						function navigate () {
							navigateToFragment(fragment);
						}
						if(index === 0) {
							return <div className="hit-fragment" key={index} dangerouslySetInnerHTML={createFragment(fragment.text)} onClick={navigate} />;
						} else {
							return <div className="hit-fragment" key={index} dangerouslySetInnerHTML={createAnotherFragment(fragment.text)} onClick={navigate} />;
						}
					})
				}
			</div>
		);
	}

}
