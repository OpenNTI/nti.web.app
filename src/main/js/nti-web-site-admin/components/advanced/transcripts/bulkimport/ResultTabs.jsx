import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {Table as T} from '@nti/web-commons';

export default class ResultTabs extends React.Component {

	static propTypes = {
		tabs: PropTypes.arrayOf(
			PropTypes.shape({
				label: PropTypes.any,
				data: PropTypes.object,
				columns: PropTypes.array
			})
		)
	}

	state = {}

	render () {
		const {
			props: {tabs},
			state: {active = 0}
		} = this;

		const activeTab = (tabs || [])[active];

		return (tabs || []).length === 0 ? null : (
			<div className="result-tabs">
				<ul className="tabs">
					{tabs.map((t,i) => (
						<li key={i} className={cx({active: active === i})}></li>
					))}
				</ul>
				<div className="tab-content">
					<T.Table data={activeTab.data} columns={activeTab.columns} />
				</div>
			</div>
		);
	}
}
