import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {DateTime} from '@nti/web-commons';

import Styles from './CountDownTimer.css';

const WARN_PERCENT = 0.2;
const DANGER_PERCENT = 0.1;
const DANGER_CUTOFF = 30000;//30 seconds

const cx = classnames.bind(Styles);

export default class AssignmentCountDownTimer extends React.Component {
	static propTypes = {
		remainingTime: PropTypes.number,
		maxTime: PropTypes.number,
		ticks: PropTypes.number,
		clock: PropTypes.shape({
			duration: PropTypes.number
		})
	}

	state = {}


	componentDidMount () {
		this.maybeShowOverdue();
	}


	componentDidUpdate () {
		this.maybeShowOverdue();
	}

	get remainingTime () {
		const {remainingTime, clock} = this.props;
		const {duration} = clock || {};

		return remainingTime - (duration || 0);
	}


	maybeShowOverdue () {
		const {overdue} = this.state;

		if (overdue || this.remainingTime > 0) { return; }

		const {ticks} = this.props;
		const {expired, expiredOnTick} = this.state;

		if (!expired) {
			this.setState({
				expired: true,
				expiredOnTick: ticks
			});
		} else if ((ticks - expiredOnTick) > 3) {
			this.setState({
				overdue: true
			});
		}
	}


	render () {
		const {overdue, expired} = this.state;

		return (
			<div>
				{overdue && this.renderOverdue()}
				{!overdue && expired && this.renderExpired()}
				{!overdue && !expired && this.renderRemaining()}
			</div>
		);
	}


	renderOverdue () {
		debugger;
	}


	renderExpired () {
		debugger;
	}


	renderRemaining () {
		const {remainingTime} = this;
		const {maxTime} = this.props;
		//since we are counting down the remaining will be the max starting out
		//so 100 - % remaining of max will give the % of time left
		const percentDone = Math.floor(100 - ((remainingTime / maxTime) * 100));

		const warn = remainingTime < (maxTime * WARN_PERCENT);
		const danger = remainingTime < DANGER_CUTOFF || remainingTime < (maxTime * DANGER_PERCENT);

		return (
			<div className={cx('time-remaining', {warn, danger})}>
				<i className="icon-clock" />
				{this.renderDuration(remainingTime)}
				<div className={cx('progress-bar')} style={{width: `${percentDone}%`}} />
			</div>
		);
	}


	renderDuration (duration) {
		return (
			<span className={cx('duration')}>{DateTime.getNaturalDuration(duration, 2)}</span>
		);
	}
}
