import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Prompt } from '@nti/web-commons';
import { getAppUserScopedStorage } from '@nti/web-client';

import Styles from './IEAlert.css';

const cx = classnames.bind(Styles);

const IEAlertFlag = 'has-seen-ie-alert';
const userStorage = getAppUserScopedStorage();
const IEAlertExpirations = [
	'January 22, 2020',
	'Febuary 5, 2020',
	'Febuary 19, 2020',
	'March 4, 2020',
	'March 11, 2020',
	'March 18, 2020',
	'March 25, 2020',
	'March 26, 2020',
	'March 27, 2020',
	'March 28, 2020',
	'March 29, 2020',
	'March 30, 2020',
	'March 31, 2020',
];

const rel = 'noopener noreferrer';
const target = '_blank';
const Links = {
	IESupport: {
		href:
			'https://www.microsoft.com/en-us/microsoft-365/windows/end-of-ie-support',
		rel,
		target,
	},
	SupportedBrowsers: {
		href:
			'https://help.nextthought.com/faq/technicalfaq.html#supported-browsers',
		rel,
		target,
	},
	Chrome: { href: 'http://www.google.com/chrome', rel, target },
	Firefox: { href: 'http://www.getfirefox.com', rel, target },
	Safari: { href: 'http://www.apple.com/safari/download/', rel, target },
	Edge: { href: 'http://www.microsoft.com/edge', rel, target },
};

IEAlert.maybeShow = () => {
	const ua = global.navigator.userAgent;
	const isIE = ua.indexOf('MSIE') > 0 || ua.indexOf('Trident/') > 0;

	if (!isIE) {
		return;
	}

	const now = new Date();
	const lastAlert = new Date(
		IEAlertExpirations[IEAlertExpirations.length - 1]
	);

	const show = () => {
		Prompt.modal(<IEAlert />, { className: cx('ie-alert-dialog') });
	};

	//If we're past the last alert expiration always alert
	if (now > lastAlert) {
		show();
		return;
	}

	//If its not IE there's no need to alert
	const hasSeenAlert = userStorage.decodeExpiryValue(
		userStorage.getItem(IEAlertFlag)
	);

	if (hasSeenAlert) {
		return;
	}

	show();

	for (let expirations of IEAlertExpirations) {
		const date = new Date(expirations);

		if (date > now) {
			userStorage.setItem(
				IEAlertFlag,
				userStorage.encodeExpiryValue(true, date)
			);
			break;
		}
	}
};
IEAlert.propTypes = {
	onDismiss: PropTypes.func,
};
export default function IEAlert({ onDismiss }) {
	return (
		<Prompt.BaseWindow doClose={onDismiss} buttons={[]} title={' '}>
			<div className={cx('ie-alert')}>
				<h1>Internet Explorer - No Longer Supported</h1>
				<p>
					Effective March 31, 2020 the NextThought LMS will no longer
					support Internet Explorer (IE). The NextThought LMS will
					continue to support&nbsp;
					<a {...Links.SupportedBrowsers}>all modern browsers</a>,
					such as <a {...Links.Chrome}>Chrome</a>,{' '}
					<a {...Links.Firefox}>Firefox</a>,&nbsp;
					<a {...Links.Safari}>Safari</a> and{' '}
					<a {...Links.Edge}>Edge.</a> Users attempting to access the
					NextThought LMS from IE after March 31, 2020 will be
					prompted to switch browsers.
				</p>
				<p>
					The decision to drop IE support comes after{' '}
					<a {...Links.IESupport}>Microsoft</a> announced it would no
					longer support older versions of the browser. Other services
					are phasing out IE for many of the same reasons we are.
					Considering the security risks, development costs,
					compatibility issues, and the small number of people using
					IE, we are confident this is the right time to drop IE
					support.
				</p>
				<p>
					If you prefer to or you are required to continue using a
					Microsoft Browser, you can use <a {...Links.Edge}>Edge.</a>
				</p>
			</div>
		</Prompt.BaseWindow>
	);
}
