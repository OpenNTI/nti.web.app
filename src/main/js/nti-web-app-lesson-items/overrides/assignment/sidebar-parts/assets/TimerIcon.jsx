import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './TimerIcon.css';

const cx = classnames.bind(Styles);

TimerIcon.propTypes = {
	className: PropTypes.string,
};
export default function TimerIcon({ className, ...otherProps }) {
	return <span className={cx('timer-icon', className)} {...otherProps} />;
}
