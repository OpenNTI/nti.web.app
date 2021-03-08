import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { DateTime } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import Styles from './CountDownTimer.css';
import TimerIcon from './assets/TimerIcon';

const WARN_PERCENT = 0.2;
const DANGER_PERCENT = 0.1;
const DANGER_CUTOFF = 30000; //30 seconds

const cx = classnames.bind(Styles);

const t = scoped(
	'NTIWebAppLessonItems.overrides.assignment.sidebar-parts.CountDownTimer',
	{
		overtime: 'Over Time',
		timeExpired: 'Time Expired',
	}
);

export default class AssignmentCountDownTimer extends React.Component {
	static propTypes = {
		remainingTime: PropTypes.number,
		maxTime: PropTypes.number,
		ticks: PropTypes.number,
		clock: PropTypes.shape({
			duration: PropTypes.number,
		}),
	};

	state = {};

	componentDidMount() {
		this.maybeShowOverdue();
	}

	componentDidUpdate() {
		this.maybeShowOverdue();
	}

	get remainingTime() {
		const { remainingTime, clock } = this.props;
		const { duration } = clock || {};

		return remainingTime - (duration || 0);
	}

	get overdueTime() {
		const { remainingTime, clock } = this.props;
		const { duration } = clock || {};

		return -1 * remainingTime + (duration || 0);
	}

	maybeShowOverdue() {
		const { overdue } = this.state;

		if (overdue || this.remainingTime > 0) {
			return;
		}

		const { ticks } = this.props;
		const { expired, expiredOnTick } = this.state;

		if (!expired) {
			this.setState({
				expired: true,
				expiredOnTick: ticks,
			});
		} else if (ticks - expiredOnTick > 3) {
			this.setState({
				overdue: true,
			});
		}
	}

	render() {
		const { overdue, expired } = this.state;

		return (
			<div>
				{overdue && this.renderOverdue()}
				{!overdue && expired && this.renderExpired()}
				{!overdue && !expired && this.renderRemaining()}
			</div>
		);
	}

	renderExpired() {
		return (
			<div className={cx('expired')}>
				<TimerIcon className={cx('timer-icon')} />
				<span className={cx('expired-label')}>{t('timeExpired')}</span>
			</div>
		);
	}

	renderOverdue() {
		const { overdueTime } = this;

		return this.renderTimer(overdueTime, 100, cx('overdue'), t('overtime'));
	}

	renderRemaining() {
		const { remainingTime } = this;
		const { maxTime } = this.props;
		//since we are counting down the remaining will be the max starting out
		//so 100 - % remaining of max will give the % of time left
		const percentDone = Math.floor(100 - (remainingTime / maxTime) * 100);

		const warn = remainingTime < maxTime * WARN_PERCENT;
		const danger =
			remainingTime < DANGER_CUTOFF ||
			remainingTime < maxTime * DANGER_PERCENT;
		const cls = danger ? cx('danger') : warn && cx('warn');

		return this.renderTimer(remainingTime, percentDone, cls);
	}

	renderTimer(duration, percentDone, cls, label) {
		return (
			<div className={cx('timer', cls)}>
				<TimerIcon className={cx('timer-icon')} />
				<div className={cx('duration-container')}>
					{this.renderDuration(duration)}
					{label && <span className={cx('label')}>{label}</span>}
				</div>
				<div
					className={cx('progress-bar')}
					style={{ width: `${percentDone}%` }}
				/>
			</div>
		);
	}

	renderDuration(duration) {
		return (
			<span className={cx('duration')}>
				{DateTime.getNaturalDuration(duration, 2)}
			</span>
		);
	}
}
