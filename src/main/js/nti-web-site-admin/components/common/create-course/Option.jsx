import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Option = ({ title, description, onClick, className }) => (
	<div className={cx('create-item', className)} onClick={onClick}>
		<div className="option-title">{title}</div>
		<div className="option-description">{description}</div>
	</div>
);

Option.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default Option;
