import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Input, Text, Theme} from '@nti/web-commons';

import Store from '../Store';

import Styles from './AssetInput.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.commons.AssetInput', {
	change: 'Change'
});

AssetInput.propTypes = {
	name: PropTypes.string,
	setAsset: PropTypes.func,
	setBrandProp: PropTypes.func,
	hideFlag: PropTypes.string,
	notSet: PropTypes.string
};
function AssetInput ({name, setAsset, setBrandProp, hideFlag, notSet}) {
	const asset = Theme.useThemeProperty(`assets.${name}`);

	const hide = hideFlag && Theme.useThemeProperty(hideFlag);
	const href = !hide && asset.href;

	const onChange = (e) => {
		const {target: {files = []} = {}} = e;

		if (files[0]) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = () => {
				const {result: source} = reader;
			
				setAsset(name, {
					filename: file.name,
					source

				});

				if (hideFlag) {
					setBrandProp(hideFlag, false);
				}
			};

			reader.readAsDataURL(file);
		}
	};

	return (
		<Input.FileInputWrapper  name={name} className={cx('asset-input')} onChange={onChange} >
			{href && (<Text.Base className={cx('file-name')}>{asset.filename}</Text.Base>)}
			<Text.Base className={cx('change')}>{href || !notSet ? t('change') : notSet}</Text.Base>
		</Input.FileInputWrapper>
	);
}

export default Store
	.monitor({
		[Store.SetAsset]: 'setAsset',
		[Store.SetBrandProp]: 'setBrandProp'
	})(AssetInput);