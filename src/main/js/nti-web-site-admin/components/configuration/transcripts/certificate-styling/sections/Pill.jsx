import React from 'react';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Input, Theme, Flyout, HOC, Text, Prompt } from '@nti/web-commons';
import { Color } from '@nti/lib-commons';
import { AssetEditor } from '@nti/web-whiteboard';

import Store from '../Store';
import Filename from '../../../login/commons/Filename';
import { readFile } from '../../../login/utils';

import Styles from './Pill.css';

const cx = classnames.bind(Styles);
const t = scoped(
	'web-site-admin.components.advanced.transcripts.certificate-styling.sections.Pill',
	{
		backgroundColor: 'Background Color',
		logoAsset: {
			label: 'Brand Image',
			defaultFile: 'logo.png',
			empty: 'Change',
			change: 'Change',
		},
		customImage: {
			label: 'Background Image',
			empty: 'Add your own',
			change: 'Change',
		},
	}
);

const Part = HOC.Variant('div', { className: cx('part') });
const Label = HOC.Variant(Text.Base, { className: cx('label') });

const AssetWrapper = HOC.Variant('div', { className: cx('asset-wrapper') });
const File = HOC.Variant('div', { className: cx('file') });
const FileDisplay = HOC.Variant(Filename, { className: cx('file-name') });
const ChangeFile = HOC.Variant(Text.Base, { className: cx('change-file') });
const FileInput = HOC.Variant(Input.FileInputWrapper, {
	className: cx('file-input'),
});
const ClearFile = HOC.Variant('i', {
	className: cx('clear-file', 'icon-bold-x'),
});

const Presets = [
	{ color: Color.fromHex('#000000'), title: 'Black' },
	{ color: Color.fromHex('#ffffff'), title: 'White' },
	{ color: Color.fromHex('#d54e21'), title: 'Red' },
	{ color: Color.fromHex('#78a300'), title: 'Green' },
	{ color: Color.fromHex('#0e76a8'), title: 'Blue' },
	{ color: Color.fromHex('#9cc2cb'), title: 'Teal' },
];

const HideLogo = 'suppress_certificate_logo';
const LogoName = 'certificate_logo';
const CustomName = 'certificate_sidebar_image';

const CustomAspectRatio = 26 / 85;

const stop = e => (e.stopPropagation(), e.preventDefault());

export default function CertificateStylingPill() {
	const { setBrandProp, setAsset, clearAsset } = Store.useMonitor([
		'setBrandProp',
		'setAsset',
		'clearAsset',
	]);

	const [editCustom, setEditCustom] = React.useState(false);

	const hideLogo = Theme.useTheme()?.getRoot()?.suppressCertificateLogo;
	const background = Theme.useThemeProperty(
		'certificates.sidebar.backgroundColor'
	);
	const color =
		background == null || background.isColor
			? background
			: Color.fromCSS(background);
	const onColorChange = newColor =>
		setBrandProp('certificate_brand_color', newColor);

	const logoAsset = Theme.useThemeProperty(`assets.${LogoName}`);
	const customAsset = Theme.useThemeProperty(`assets.${CustomName}`);

	const styles = {};

	if (color) {
		styles.backgroundColor = color.hex.toString();
	}

	const trigger = <span className={cx('color-trigger')} style={styles} />;

	const removeAsset = (name, hideFlag) => {
		clearAsset(name);

		if (hideFlag) {
			setBrandProp(hideFlag, true);
		}
	};

	const saveAsset = async (name, file, hideFlag) => {
		if (file) {
			const source = await readFile(file);

			setAsset(name, {
				file,
				filename: file.name,
				source,
			});

			if (hideFlag) {
				setBrandProp(hideFlag, false);
			}
		}
	};

	return (
		<div className={cx('certificate-styling-pill')}>
			<div className={cx('pill')}>
				<Part>
					<Label localized>{t('backgroundColor')}</Label>
					<Flyout.Triggered
						trigger={trigger}
						arrow
						verticalAlign={Flyout.ALIGNMENTS.BOTTOM}
					>
						<div className={cx('color-picker')}>
							<Input.Color.SaturationBrightness
								value={color}
								onChange={onColorChange}
							/>
							<Input.Color.Hue
								value={color}
								onChange={onColorChange}
							/>
							<Input.Color.Text
								value={color}
								onChange={onColorChange}
							/>
							<Input.Color.PresetSwatches
								swatches={Presets}
								selected={color}
								onSelect={onColorChange}
							/>
						</div>
					</Flyout.Triggered>
				</Part>
				<Part>
					<Label localized>{t('customImage.label')}</Label>
					{Boolean(customAsset) && (
						<AssetWrapper onClick={() => setEditCustom(true)}>
							<File>
								{customAsset?.href && (
									<FileDisplay
										file={customAsset?.filename || ''}
									/>
								)}
								{customAsset?.href && (
									<ClearFile
										onClick={e => (
											stop(e), removeAsset(CustomName)
										)}
									/>
								)}
							</File>
							<ChangeFile>
								{customAsset?.href
									? t('customImage.change')
									: t('customImage.empty')}
							</ChangeFile>
						</AssetWrapper>
					)}
					{editCustom && (
						<Prompt.Dialog
							onBeforeDismiss={() => setEditCustom(false)}
							closeOnMaskClick={false}
						>
							<AssetEditor
								asset={customAsset?.href}
								onSave={blob => (
									saveAsset(CustomName, blob),
									setEditCustom(false)
								)}
								onCancel={() => setEditCustom(false)}
							>
								<AssetEditor.Image
									format={{
										crop: {
											aspectRatio: CustomAspectRatio,
										},
										blur: {
											radius: 0,
											minBlur: 0,
											maxBlur: 50,
										},
										darken: { color: '#000', opacity: 0 },
									}}
								/>
								<AssetEditor.SolidColor
									format={{ aspectRatio: CustomAspectRatio }}
								/>
								<AssetEditor.LinearGradient
									format={{ aspectRatio: CustomAspectRatio }}
								/>
							</AssetEditor>
						</Prompt.Dialog>
					)}
				</Part>
				<Part>
					<Label localized>{t('logoAsset.label')}</Label>
					{Boolean(logoAsset) && (
						<FileInput
							onChange={(files = []) =>
								saveAsset(LogoName, files[0], HideLogo)
							}
							accept="image/*"
						>
							<AssetWrapper>
								<File>
									{!hideLogo && (
										<FileDisplay
											file={
												logoAsset?.filename ||
												t('logoAsset.defaultFile')
											}
										/>
									)}
									{!hideLogo && (
										<ClearFile
											onClick={e => (
												stop(e),
												removeAsset(LogoName, HideLogo)
											)}
										/>
									)}
								</File>
								<ChangeFile>
									{logoAsset?.filename
										? t('logoAsset.change')
										: t('logoAsset.empty')}
								</ChangeFile>
							</AssetWrapper>
						</FileInput>
					)}
				</Part>
			</div>
		</div>
	);
}
