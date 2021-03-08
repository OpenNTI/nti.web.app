import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { DateTime, Button, Timer } from '@nti/web-commons';

import Styles from './Timed.css';
import CountDownTimer from './CountDownTimer';
import TimerIcon from './assets/TimerIcon';

const cx = classnames.bind(Styles);

const t = scoped(
	'NTIWebAppLessonItems.overrides.assignment.sidebar-parts.Timed',
	{
		notStarted: {
			timeLimit: 'Time Limit',
			warning: "Once you've started, the timer will not stop.",
			start: 'Start Assignment',
		},
		started: {},
	}
);

export default class TimedAssignmentSidebar extends React.Component {
	static propTypes = {
		assignmentModel: PropTypes.object.isRequired,
		doStart: PropTypes.func,
		remainingTime: PropTypes.number,
		maxTime: PropTypes.number,
		getSubmitFn: PropTypes.func,
	};

	state = {};

	doStart = async () => {
		const { doStart } = this.props;

		if (doStart) {
			this.setState({ starting: true });
			await doStart();
			this.setState({ starting: false });
		}
	};

	render() {
		const { assignmentModel } = this.props;
		const started = assignmentModel.isStarted();

		return (
			<div className={cx('timed-assignment')}>
				{!started && this.renderNotStarted()}
				{started && this.renderStarted()}
			</div>
		);
	}

	renderNotStarted() {
		const { assignmentModel } = this.props;
		const { starting } = this.state;
		const duration = DateTime.getShortNaturalDuration(
			assignmentModel.getMaxTime()
		);

		return (
			<div className={cx('not-started', { starting })}>
				<Button onClick={this.doStart}>
					<TimerIcon className={cx('not-started-icon')} />
					<span className="text">{t('notStarted.start')}</span>
				</Button>
				<div className={cx('container')}>
					<div className={cx('time-limit')}>
						<span className={cx('limit')}>{duration}</span>
						<span className={cx('label')}>
							{t('notStarted.timeLimit')}
						</span>
					</div>
					<div className={cx('warning')}>
						{t('notStarted.warning')}
					</div>
				</div>
			</div>
		);
	}

	renderStarted() {
		const { remainingTime, maxTime } = this.props;

		if (remainingTime == null) {
			return null;
		}

		return (
			<div className={cx('running')}>
				<Timer>
					<CountDownTimer
						remainingTime={remainingTime}
						maxTime={maxTime}
					/>
				</Timer>
			</div>
		);
	}
}
