import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Input, Theme, Flyout} from '@nti/web-commons';
import {Color} from '@nti/lib-commons';

import {Property, Text} from '../commons';
import Store from '../Store';

import Styles from './LoginButton.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.sections.LoginButton', {
	title: 'Login Button'
});

const Presets = [
	{color: Color.fromHex('#000000'), title: 'Black'},
	{color: Color.fromHex('#ffffff'), title: 'White'},
	{color: Color.fromHex('#d54e21'), title: 'Red'},
	{color: Color.fromHex('#78a300'), title: 'Green'},
	{color: Color.fromHex('#0e76a8'), title: 'Blue'},
	{color: Color.fromHex('#9cc2cb'), title: 'Teal'}
];

LoginButton.propTypes = {
	setBrandProp: PropTypes.func
};
function LoginButton ({setBrandProp}) {
	const buttonText = Theme.useThemeProperty('login.buttonText');
	const buttonBackground = Theme.useThemeProperty('login.buttonBackground');
	const buttonTheme = Theme.useThemeProperty('login.buttonTheme');


	const backgroundColor = (buttonBackground == null || buttonBackground.isColor) ? buttonBackground : Color.fromCSS(buttonBackground);

	const styles = {};

	if (backgroundColor) {
		styles.backgroundColor = backgroundColor.hex.toString();
	}

	const onColorChange = (color) => {
		setBrandProp('theme.login.buttonBackground', color.hex.toString());
	};


	const trigger = (
		<span className={cx('color-trigger')} style={styles} />
	);


	return (
		<Property>
			<Property.Description>
				<Text.Title>{t('title')}</Text.Title>
			</Property.Description>
			<Property.Preview>
				<div className={cx('login-button')}>
					<div className={cx('login-button-text', buttonTheme)} style={styles}>
						{buttonText}
					</div>
					<Flyout.Triggered
						trigger={trigger}
						arrow
						verticalAlign={Flyout.ALIGNMENTS.BOTTOM}
						horizontalAlign={Flyout.ALIGNMENTS.RIGHT}
					>
						<div className={cx('color-picker')}>
							<Input.Color.SaturationBrightness value={backgroundColor} onChange={onColorChange} />
							<Input.Color.Hue value={backgroundColor} onChange={onColorChange} />
							<Input.Color.Text value={backgroundColor} onChange={onColorChange} />
							<Input.Color.PresetSwatches swatches={Presets} selected={backgroundColor} onSelect={onColorChange}/>
						</div>
					</Flyout.Triggered>
				</div>
			</Property.Preview>
		</Property>
	);
}

export default Store
	.monitor({
		[Store.SetBrandProp]: 'setBrandProp'
	})(LoginButton);