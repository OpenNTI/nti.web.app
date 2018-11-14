import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class StatusReport extends React.PureComponent {

	static propTypes = {
		className: PropTypes.string,
		heading: PropTypes.any,
		children: PropTypes.any
	}

	render () {
		const {className, heading, children} = this.props;

		return (
			<div className={cx('status-report', className)}>
				<div className="heading">{heading}</div>
				<div className="status-report-content">
					{children}
				</div>
			</div>
		);
	}
}
