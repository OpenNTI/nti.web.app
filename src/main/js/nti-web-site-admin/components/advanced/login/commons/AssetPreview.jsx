import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Styles from './AssetPreview.css';
import Text from './Text';

const cx = classnames.bind(Styles);

AssetPreview.propTypes = {
	className: PropTypes.string,
	property: PropTypes.object,
	recommendedSize: PropTypes.string,
	maxHeight: PropTypes.number,
	noBorder: PropTypes.bool
};
export default function AssetPreview ({className, property, noBorder, recommendedSize, maxHeight = 110, ...otherProps}) {
	const styles = {
		maxHeight: `${maxHeight}px`
	};

	const minHeight = noBorder ? 0 : maxHeight + 50;

	return (
		<div className={cx('asset-preview', className, {'no-border': noBorder})} style={{minHeight: `${minHeight}px`}}>
			{property && property.href && (<Theme.Asset {...otherProps} property={property} style={styles} />)}
			{recommendedSize && (<Text.Small className={cx('dimensions')}>{recommendedSize}</Text.Small>)}
		</div>
	);
}