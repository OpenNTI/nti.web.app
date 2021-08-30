import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Input, Text, Theme } from '@nti/web-commons';

import Store from '../Store';

import Styles from './AssetInput.css';
import Filename from './Filename';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.commons.AssetInput', {
	change: 'Change',
});

AssetInput.propTypes = {
	name: PropTypes.string,
	setAsset: PropTypes.func,
	setThemeProp: PropTypes.func,
	hideFlag: PropTypes.string,
	notSet: PropTypes.string,
};
function AssetInput({ name, setAsset, setThemeProp, hideFlag, notSet }) {
	const asset = Theme.useThemeProperty(`assets.${name}`);

	const hide = hideFlag && Theme.useThemeProperty(hideFlag);
	const href = !hide && asset.href;

	const onChange = (files = [], e) => {
		if (files[0]) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = () => {
				const { result: source } = reader;

				setAsset(name, {
					file,
					filename: file.name,
					source,
				});

				if (hideFlag) {
					setThemeProp(hideFlag, false);
				}
			};

			reader.readAsDataURL(file);
		}
	};

	return (
		<Input.FileInputWrapper
			name={name}
			className={cx('asset-input')}
			onChange={onChange}
		>
			<>
				{href && (
					<Filename className={cx('file-name')} file={asset.filename} />
				)}
				<Text.Base className={cx('change')}>
					{href || !notSet ? t('change') : notSet}
				</Text.Base>
			</>
		</Input.FileInputWrapper>
	);
}

export default Store.monitor({
	[Store.SetAsset]: 'setAsset',
	[Store.SetThemeProp]: 'setThemeProp',
})(AssetInput);
