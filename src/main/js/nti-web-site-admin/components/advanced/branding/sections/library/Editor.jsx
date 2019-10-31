import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Input} from '@nti/web-commons';
import {Color} from '@nti/lib-commons';

import ThemeToggle from './theme-toggle';
import styles from './Editor.css';

const cx = classnames.bind(styles);

const Presets = [
	{color: Color.fromHex('#000000'), title: 'Black'},
	{color: Color.fromHex('#ffffff'), title: 'White'},
	{color: Color.fromHex('#d54e21'), title: 'Red'},
	{color: Color.fromHex('#78a300'), title: 'Green'},
	{color: Color.fromHex('#0e76a8'), title: 'Blue'},
	{color: Color.fromHex('#9cc2cb'), title: 'Teal'}
];

export default function Editor ({theme, onChange}) {
	const {background, navigation: {backgroundColor: value} = {}} = theme || {};

	const change = v => onChange({
		navigation: {
			backgroundColor: v
		}
	});

	const onThemeChange = v => {
		onChange({
			background: v ? 'light' : 'dark'
		});
	};

	const lightMode = background === 'light';
	const color = value.isColor ? value : Color.fromCSS(value);

	return (
		<div className={cx('editor-root')}>
			<ThemeToggle onChange={onThemeChange} checked={lightMode}/>
			<div className={cx('color-picker')}>
				<Input.Color.SaturationBrightness value={color} onChange={change} />
				<Input.Color.Hue value={color} onChange={change} />
				<Input.Color.Text value={color} onChange={change} />
				<Input.Color.PresetSwatches swatches={Presets} selected={color} onSelect={change}/>
			</div>
		</div>
	);
}
