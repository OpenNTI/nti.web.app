import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Input, Text} from '@nti/web-commons';

import Store from '../Store';

import Styles from './AssetInput.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.commons.AssetInput', {
	change: 'Change'
});

AssetInput.propTypes = {
	asset: PropTypes.shape({
		href: PropTypes.string,
		filename: PropTypes.string
	}).isRequired,
	name: PropTypes.string,
	setAsset: PropTypes.func,
	notSet: PropTypes.string
};
function AssetInput ({asset, name, setAsset, notSet}) {
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
			};

			reader.readAsDataURL(file);
		}
	};

	return (
		<Input.FileInputWrapper  name={name} className={cx('asset-input')} onChange={onChange} >
			{asset.href && (<Text.Base className={cx('file-name')}>{asset.filename}</Text.Base>)}
			<Text.Base className={cx('change')}>{asset.href || !notSet ? t('change') : notSet}</Text.Base>
		</Input.FileInputWrapper>
	);
}

export default Store
	.monitor({
		[Store.SetAsset]: 'setAsset'
	})(AssetInput);