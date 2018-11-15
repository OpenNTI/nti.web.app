import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {Table as T} from '@nti/web-commons';

export default class ResultTabs extends React.Component {

	static propTypes = {
		tabs: PropTypes.arrayOf(
			PropTypes.shape({
				label: PropTypes.any,
				data: PropTypes.array,
				columns: PropTypes.array
			})
		)
	}

	state = {}

	onTabClick = active => this.setState({active})

	render () {
		const {
			props: {tabs},
			state: {active = 0}
		} = this;

		const activeTab = (tabs || [])[active];

		return (tabs || []).length === 0 ? null : (
			<div className="result-tabs">
				<ul className="tabs">
					{tabs.map(({label},i) => (
						<Tab key={i} index={i} onClick={this.onTabClick} className={cx({active: active === i})}>{label}</Tab>
					))}
				</ul>
				<div className="tab-content">
					<T.Table items={activeTab.data} columns={activeTab.columns} />
				</div>
			</div>
		);
	}
}

class Tab extends React.PureComponent {

	static propTypes = {
		children: PropTypes.any,
		index: PropTypes.number,
		className: PropTypes.string,
		onClick: PropTypes.func
	}

	onClick = () => this.props.onClick(this.props.index)

	render () {
		const {className, children} = this.props;

		return (
			<li className={className} onClick={this.onClick}>{children}</li>
		);
	}
}
