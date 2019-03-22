import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {DateTime, Button, Timer} from '@nti/web-commons';

import Styles from './Timed.css';
import CountDownTimer from './CountDownTimer';

const cx = classnames.bind(Styles);

const t = scoped('NTIWebAppLessonItems.overrides.assignment.sidebar-parts.Timed', {
	notStarted: {
		message: 'You have %(duration)s to complete this assignment.',
		warning: 'Once you\'ve started, the timer will not stop.',
		start: 'Start assignment'
	},
	started: {

	}
});

export default class TimedAssignmentSidebar extends React.Component {
	static propTypes = {
		assignmentModel: PropTypes.object.isRequired,
		doStart: PropTypes.func,
		remainingTime: PropTypes.number,
		maxTime: PropTypes.number,
		getSubmitFn: PropTypes.number
	}

	state = {}


	doStart = async () => {
		const {doStart} = this.props;

		if (doStart) {
			this.setState({starting: true});
			await doStart();
			this.setState({starting: false});
		}

	}


	render () {
		const {assignmentModel} = this.props;
		const started = assignmentModel.isStarted();

		return (
			<div>
				{!started && this.renderNotStarted()}
				{started && this.renderStarted()}
			</div>
		);
	}


	renderNotStarted () {
		const {assignmentModel} = this.props;
		const {starting} = this.state;
		const duration = DateTime.getShortNaturalDuration(assignmentModel.getMaxTime());

		return (
			<div className={cx('not-started', {starting})}>
				<div className={cx('container')}>
					<div className={cx('message')}>{t('notStarted.message', {duration})}</div>
					<div className={cx('warning')}>{t('notStarted.warning')}</div>
				</div>
				<Button onClick={this.doStart}>
					<span className="text">{t('notStarted.start')}</span>
				</Button>
			</div>
		);
	}


	renderStarted () {
		const {remainingTime, maxTime} = this.props;

		if (remainingTime == null) { return null; }

		return (
			<div className={cx('running')}>
				<Timer>
					<CountDownTimer remainingTime={remainingTime} maxTime={maxTime} />
				</Timer>
			</div>
		);
	}
}
