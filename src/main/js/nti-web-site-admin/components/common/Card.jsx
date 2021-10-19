import PropTypes from 'prop-types';
import cx from 'classnames';

SiteAdminCard.propTypes = {
	className: PropTypes.string,
};
export default function SiteAdminCard({ className, ...otherProps }) {
	return (
		<div
			{...otherProps}
			className={cx('site-admin-card', className)}
			css={css`
				background-color: white;
				box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.15);
				overflow: hidden;
			`}
		/>
	);
}
