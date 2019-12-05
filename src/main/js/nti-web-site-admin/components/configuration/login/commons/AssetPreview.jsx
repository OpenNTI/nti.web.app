import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme, Input} from '@nti/web-commons';

import {readFile} from '../utils';
import Store from '../Store';

import Styles from './AssetPreview.css';
import Text from './Text';

const cx = classnames.bind(Styles);

AssetPreview.propTypes = {
	className: PropTypes.string,
	name: PropTypes.string,
	recommendedSize: PropTypes.string,
	maxHeight: PropTypes.number,
	noBorder: PropTypes.bool,

	hideFlag: PropTypes.string,
	notSetHeader: PropTypes.string,
	notSetLabel: PropTypes.string,
	setAsset: PropTypes.func,
	setThemeProp: PropTypes.func
};
function AssetPreview ({className, name, hideFlag, noBorder, recommendedSize, notSetHeader, notSetLabel, setAsset, setThemeProp, maxHeight = 110, ...otherProps}) {
	const property = Theme.useThemeProperty(`assets.${name}`);

	const hide = hideFlag && Theme.useThemeProperty(hideFlag);
	const href = !hide && property && property.href;

	const styles = {
		maxHeight: `${maxHeight}px`
	};

	const minHeight = noBorder ? 0 : maxHeight + 50;
	const inputMode = !href && hide;

	const Container = inputMode ? Input.FileInputWrapper : 'div';
	const containerProps = {
		className: cx('asset-preview', className, {'no-border': noBorder}),
		style: {minHeight: `${minHeight}px`}
	};

	if (inputMode) {
		containerProps.onChange = async (e) => {
			const {target: {files = []} = {}} = e;
			const file = files[0];

			if (!file) { return; }

			try {
				const source = await readFile(file);

				setAsset(name, {
					filename: file.name,
					source
				});

				if (hideFlag) {
					setThemeProp(hideFlag, false);
				}
			} catch (err) {
				//swallow
			}
		};
	}

	const clearAsset = () => {
		if (hideFlag) {
			setThemeProp(hideFlag, true);
		}
	};

	return (
		<Container {...containerProps} >
			{href && (<Theme.Asset {...otherProps} property={property} style={styles} />)}
			{!href && (notSetHeader || notSetLabel) && (
				<div className={cx('not-set')}>
					{notSetHeader && (
						<Text.Base className={cx('not-set-header')} center>
							{notSetHeader}
						</Text.Base>
					)}
					{notSetLabel && (
						<Text.Base className={cx('not-set-label')} center>
							{notSetLabel}
						</Text.Base>
					)}
				</div>
			)}
			{/*!inputMode && hideFlag && (
				<div className={cx('clear')} role="button" onClick={clearAsset}>
					<i className={cx('icon-bold-x', 'icon')} />
				</div>
			)*/}
			{recommendedSize && (<Text.Small className={cx('dimensions')}>{recommendedSize}</Text.Small>)}
		</Container>
	);
}

export default Store
	.monitor({
		[Store.SetAsset]: 'setAsset',
		[Store.SetThemeProp]: 'setThemeProp'
	})(AssetPreview);
