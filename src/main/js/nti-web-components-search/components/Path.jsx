import React from 'react';

export default class Path extends React.Component {
	static propTypes = {
		pathObject: React.PropTypes.arrayOf(React.PropTypes.object)
	}

	render () {
		const {pathObject = []} = this.props;

		return (
			<div className="hit-path">
					{
						pathObject.map((path, index) => {
							if (index === 0) {
								return <span key={index}>{path.label}</span>;
							} else {
								return <span key={index}> &#8226; {path.label}</span>;
							}
						})
					}
			</div>
		);
	}

}
