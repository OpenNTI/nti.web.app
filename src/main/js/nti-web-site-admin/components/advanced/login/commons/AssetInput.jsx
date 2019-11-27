import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Input, Text, Theme, Prompt} from '@nti/web-commons';
import {AssetEditor} from '@nti/web-whiteboard';//eslint-disable-line

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
	notSet: PropTypes.string,
	useAssetEditor: PropTypes.bool
};
function AssetInput ({name, setAsset, setBrandProp, hideFlag, notSet, useAssetEditor, ...otherProps}) {
	const [assetEditor, setAssetEditor] = React.useState(false);

	const asset = Theme.useThemeProperty(`assets.${name}`);

	const hide = hideFlag && Theme.useThemeProperty(hideFlag);
	const href = !hide && asset.href;

	const Cmp = useAssetEditor ? 'div' : Input.FileInputWrapper;
	const props = {};

	if (useAssetEditor) {
		props['data-asset-editor'] = name;
		props.onClick = (e) => {
			setAssetEditor(true);
		};
	} else {
		props.name = name;
		props.onChange = (e) => {
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
	}

	const closeAssetEditor = () => setAssetEditor(false);
	const onAssetSave = (source) => {
		setAsset(name, {
			source
		});

		if (hideFlag) {
			setBrandProp(hideFlag, false);
		}

		closeAssetEditor();
	};


	return (
		<Cmp className={cx('asset-input')} {...props}>
			{href && (<Text.Base className={cx('file-name')}>{asset.filename}</Text.Base>)}
			<Text.Base className={cx('change')}>{href || !notSet ? t('change') : notSet}</Text.Base>
			{assetEditor && (
				<Prompt.Dialog onBeforeDismiss={closeAssetEditor}>
					<AssetEditor assetURL={asset.href} onSave={onAssetSave} onCancel={closeAssetEditor} {...otherProps}/>
				</Prompt.Dialog>
			)}
		</Cmp>
	);
}

export default Store
	.monitor({
		[Store.SetAsset]: 'setAsset',
		[Store.SetBrandProp]: 'setBrandProp'
	})(AssetInput);