import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Prompt, Text, Theme} from '@nti/web-commons';
import {AssetEditor} from '@nti/web-whiteboard';

import Store from '../Store';
import {readFile} from '../utils';

import Styles from './AssetInput.css';
import Filename from './Filename';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.commons.AssetInput', {
	change: 'Change'
});

AssetEditorLauncher.propTypes = {
	name: PropTypes.string,
	setAsset: PropTypes.func,
	setThemeProp: PropTypes.func,
	hideFlag: PropTypes.string,
	notSet: PropTypes.string
};
function AssetEditorLauncher ({name, setAsset, setThemeProp, hideFlag, notSet, ...otherProps}) {
	const [show, setShow] = React.useState(false);

	const asset = Theme.useThemeProperty(`assets.${name}`);

	const hide = hideFlag && Theme.useThemeProperty(hideFlag);
	const href = !hide && asset.href;

	const closeAssetEditor = (e) => {
		if (e && e.stopPropagation) { e.stopPropagation(); }
		setShow(false);
	};
	const openAssetEditor = () => setShow(true);

	const onSave = async (blob) => {
		const source = await readFile(blob);

		setAsset(name, {
			file: blob,
			filename: blob.name,
			source
		});

		if (hideFlag) {
			setThemeProp(hideFlag, false);
		}

		closeAssetEditor();
	};

	return (
		<div name={name} className={cx('asset-input')} onClick={openAssetEditor} >
			{href && (<Filename className={cx('file-name')} file={asset.filename} />)}
			<Text.Base className={cx('change')}>{href || !notSet ? t('change') : notSet}</Text.Base>
			{show && (
				<Prompt.Dialog onBeforeDismiss={closeAssetEditor} closeOnMaskClick={false}>
					<AssetEditor asset={href} {...otherProps} onSave={onSave} onCancel={closeAssetEditor} />
				</Prompt.Dialog>
			)}
		</div>
	);
}

export default Store
	.monitor({
		[Store.SetAsset]: 'setAsset',
		[Store.SetThemeProp]: 'setThemeProp'
	})(AssetEditorLauncher);