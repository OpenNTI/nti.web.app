import PropTypes from 'prop-types';
import cx from 'classnames';

const Option = ({ title, description, onClick, className, iconClassName }) => (
	<div
		className={cx('create-item', className, {
			'has-icon': Boolean(iconClassName),
		})}
		onClick={onClick}
	>
		{iconClassName && <i className={cx('option-icon', iconClassName)} />}
		<div className="option-info">
			<div className="option-title">{title}</div>
			<div className="option-description">{description}</div>
		</div>
	</div>
);

Option.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	onClick: PropTypes.func,
	className: PropTypes.string,
	iconClassName: PropTypes.string,
};

export default Option;
