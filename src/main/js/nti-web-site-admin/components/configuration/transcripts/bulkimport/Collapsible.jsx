import './Collapsible.scss';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class Collapsible extends React.Component {
	static propTypes = {
		label: PropTypes.string,
		labelOpened: PropTypes.string,
		children: PropTypes.any,
	};

	state = {};

	toggle = () => this.setState({ open: !this.state.open });

	render() {
		const {
			props: { label, labelOpened = label, children },
			state: { open },
		} = this;

		return (
			<div className={cx('collapsible', { open })}>
				<div className="collapsible-label" onClick={this.toggle}>
					{open ? labelOpened : label}{' '}
					<i className="icon-chevron-down" />
				</div>
				<div className="collapsible-content">{children}</div>
			</div>
		);
	}
}
