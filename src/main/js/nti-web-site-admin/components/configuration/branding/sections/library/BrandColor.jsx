import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Input, Theme, Flyout } from '@nti/web-commons';
import { Color } from '@nti/lib-commons';

import styles from './BrandColor.css';

const cx = classnames.bind(styles);

const Presets = [
	{ color: Color.fromHex('#000000'), title: 'Black' },
	{ color: Color.fromHex('#ffffff'), title: 'White' },
	{ color: Color.fromHex('#d54e21'), title: 'Red' },
	{ color: Color.fromHex('#78a300'), title: 'Green' },
	{ color: Color.fromHex('#0e76a8'), title: 'Blue' },
	{ color: Color.fromHex('#9cc2cb'), title: 'Teal' },
];

export default function BrandColor({ onChange }) {
	const brandColor = Theme.useThemeProperty('brandColor'); // 'brand_color' in SiteBrand (server), 'brandColor' in theme.
	const color =
		brandColor == null || brandColor.isColor
			? brandColor
			: Color.fromCSS(brandColor);
	const trigger = (
		<span
			role="button"
			className={cx('brand-color-preview')}
			style={{ background: color?.hex.toString() }}
		/>
	);

	return (
		<Flyout.Triggered trigger={trigger} arrow>
			<div className={cx('color-picker')}>
				<Input.Color.SaturationBrightness
					value={color}
					onChange={onChange}
				/>
				<Input.Color.Hue value={color} onChange={onChange} />
				<Input.Color.Text value={color} onChange={onChange} />
				<Input.Color.PresetSwatches
					swatches={Presets}
					selected={color}
					onSelect={onChange}
				/>
			</div>
		</Flyout.Triggered>
	);
}

BrandColor.propTypes = {
	value: PropTypes.oneOfType([PropTypes.instanceOf(Color), PropTypes.string]),
	onChange: PropTypes.func,
};
