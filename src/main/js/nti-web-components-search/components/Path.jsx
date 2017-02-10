import React from 'react';

export default class Path extends React.Component {
	static propTypes = {
		pathObject: React.PropTypes.arrayOf(React.PropTypes.object)
	}

	render () {
		const {pathObject = []} = this.props;

		return (
			<div className="path">
					{
						pathObject.map((path, index) => {
							return <span className="list-item" key={index}>{path.label}</span>;
						})
					}
			</div>
		);
	}

}
