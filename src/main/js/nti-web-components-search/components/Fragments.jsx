import React from 'react';

export default class Fragments extends React.Component {
	static propTypes = {
		fragments: React.PropTypes.arrayOf(React.PropTypes.object)
	}

	render () {
		const {fragments = []} = this.props;

		function createFragment (fragment) {
			return {__html: fragment};
		}

		return (
			<div className="fragments">
					{
						fragments.map((fragment, index) => {
							return <div className="fragment" key={index} dangerouslySetInnerHTML={createFragment(fragment.text)} />;
						})
					}
			</div>
		);
	}

}
