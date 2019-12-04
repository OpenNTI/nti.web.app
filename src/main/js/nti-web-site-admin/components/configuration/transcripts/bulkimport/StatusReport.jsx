import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class StatusReport extends React.PureComponent {

	static propTypes = {
		className: PropTypes.string,
		heading: PropTypes.any,
		children: PropTypes.any,
		footer: PropTypes.any
	}

	render () {
		const {className, heading, children, footer} = this.props;

		return (
			<div className={cx('status-report', className)}>
				<div className="heading">{heading}</div>
				{(children || footer) && (
					<div className="status-report-content">
						{children}
						{footer && <div className="footer">{footer}</div>}
					</div>
				)}
			</div>
		);
	}
}
