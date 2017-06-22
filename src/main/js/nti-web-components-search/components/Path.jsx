import React from 'react';
import PropTypes from 'prop-types';

export default class Path extends React.PureComponent {
	static propTypes = {
		pathObject: PropTypes.arrayOf(PropTypes.object)
	}

	render () {
		const {pathObject = []} = this.props;

		return pathObject ? (
			<div className="hit-path">
				{
					pathObject.map((path, index) => {
						if (index === 0) {
							return <span key={index}>{path.label}</span>;
						} else if(index !== pathObject.length - 1) {
							return <span key={index}> &#8226; {path.label}</span>;
						}
					})
				}
			</div>
		)
			: null;
	}

}
