import PropTypes from 'prop-types';

export const libraryTheme = {
	theme: PropTypes.shape({
		navigation: PropTypes.shape({
			backgroundColor: PropTypes.oneOfType([
				PropTypes.string, // css color string
				PropTypes.shape({
					// @nti/lib-commons Color
					isColor: PropTypes.bool,
					hex: PropTypes.shape({
						toString: PropTypes.func.isRequired,
					}),
				}),
			]),
		}),
	}),
};
