import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Styles from './AssetPreview.css';
import Text from './Text';

const cx = classnames.bind(Styles);

AssetPreview.propTypes = {
	className: PropTypes.string,
	recommendedSize: PropTypes.string,
	maxHeight: PropTypes.number
};
export default function AssetPreview ({className, recommendedSize, maxHeight = 110, ...otherProps}) {
	const styles = {
		maxHeight: `${maxHeight}px`
	};

	return (
		<div className={cx('asset-preview', className)} style={{minHeight: `${maxHeight + 50}px`}}>
			<Theme.Asset {...otherProps} style={styles} />
			{recommendedSize && (<Text.Small className={cx('dimensions')}>{recommendedSize}</Text.Small>)}
		</div>
	);
}