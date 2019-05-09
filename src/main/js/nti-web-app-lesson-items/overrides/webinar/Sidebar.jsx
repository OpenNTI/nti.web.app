import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Overview} from '@nti/web-course';
import {scoped} from '@nti/lib-locale';

import styles from './Sidebar.css';

const cx = classnames.bind(styles);
const Button = Overview.Items.Webinar.RegistrationButton;

const t = scoped('lessonitems.events.webinar.sidebar', {
	instructions: {
		unregistered: 'Click below to register for this webinar.',
		registered: 'Click below to join this webinar.',
		expired: 'No longer available.',
		unknown: ''
	}
});

const keyForStatus = state => ((/^(registered|unregistered|expired)/i).exec(state) || ['unknown'])[0];
const textForStatus = state => t(['instructions', keyForStatus(state)]);

export default class WebinarSidebar extends React.Component {

	static propTypes = {
		item: PropTypes.object.isRequired
	}

	state = {}

	onStatusChange = status => {
		this.setState({status});
	}

	render () {
		const {
			props: {
				item: {
					webinar
				}
			},
			state: {status}
		} = this;

		return (
			<div className={cx('webinar-sidebar')}>
				<div className={cx('details')}>
					<div className={cx('instructions')}>{textForStatus(status)}</div>
				</div>
				<Button className={cx('registration-button')} webinar={webinar} onStatusChange={this.onStatusChange} />
			</div>
		);
	}
}
