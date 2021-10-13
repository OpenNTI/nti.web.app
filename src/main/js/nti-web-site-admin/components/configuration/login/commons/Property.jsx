import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './Property.css';

const cx = classnames.bind(Styles);

Description.propTypes = {
	className: PropTypes.string,
};
function Description({ className, ...otherProps }) {
	return <div className={cx('description', className)} {...otherProps} />;
}

Preview.propTypes = {
	className: PropTypes.string,
};
function Preview({ className, ...otherProps }) {
	return <div className={cx('preview', className)} {...otherProps} />;
}

Property.Description = Description;
Property.Preview = Preview;
Property.propTypes = {
	className: PropTypes.string,
};
export default function Property({ className, ...otherProps }) {
	return <div className={cx('property', className)} {...otherProps} />;
}
