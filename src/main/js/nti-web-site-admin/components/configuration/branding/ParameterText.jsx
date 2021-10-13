import classnames from 'classnames/bind';

import styles from './ParameterText.css';

const cx = classnames.bind(styles);

export const Title = props => <div className={cx('title')} {...props} />;
export const Description = props => (
	<div className={cx('description')} {...props} />
);
