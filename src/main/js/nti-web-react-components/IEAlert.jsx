import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Prompt, Text} from '@nti/web-commons';

import Styles from './IEAlert.css';

const cx = classnames.bind(Styles);
const t = scoped('nt-web-react-components.IEAlert', {
	title: 'Internet Explorer',
	header: 'We are dropping Internet Explorer support, April 2020.',
	message: 'Microsoft has been phasing out support for the Internet Explore browser, in favor or more modern technologies. As of Windows 10 Edge is the default browser.',
	upgrade: 'Please upgrade to one of our other supported browsers: <a href="http://www.google.com/chrome">Chrome</a>, <a href="http://www.getfirefox.com">Firefox</a>, <a href="http://www.microsoft.com/edge">Edge</a>, or <a href="http://www.apple.com/safari/download/">Safari.</a>'
});

IEAlert.show = () => {
	Prompt.modal(
		(<IEAlert />),
		{className: cx('ie-alert-dialog')}
	);
};
IEAlert.propTypes = {
	onDismiss: PropTypes.func
};
export default function IEAlert ({onDismiss}) {
	return (
		<Prompt.BaseWindow
			doClose={onDismiss}
			buttons={[]}
			title={t('title')}
		>
			<div className={cx('ie-alert')}>
				<Text.Base as="h1">{t('header')}</Text.Base>
				<Text.Base as="p">{t('message')}</Text.Base>
				<Text.Base as="p">{t('upgrade')}</Text.Base>
			</div>
		</Prompt.BaseWindow>
	);
}