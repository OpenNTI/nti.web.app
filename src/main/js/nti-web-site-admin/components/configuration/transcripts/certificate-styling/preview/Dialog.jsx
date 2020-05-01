import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Prompt, Button} from '@nti/web-commons';

import Styles from './Styles.css';
import Inline from './Inline';

const cx = classnames.bind(Styles);
const t = scoped('web-site-admin.components.advanced.transcripts.certificate-styling.preview.Dialog', {
	save: 'Apply Change'
});

CertificatePreviewModal.propTypes = {
	onSave: PropTypes.func,
	onCancel: PropTypes.func
};
export default function CertificatePreviewModal ({onSave, onCancel}) {
	return (
		<Prompt.Dialog>
			<div className={cx('certificate-preview-modal')}>
				<div className={cx('header')}>
					<i className={cx('close', 'icon-light-x')} onClick={onCancel} />
				</div>
				<div className={cx('preview-container')}>
					<Inline />
				</div>
				{onSave && (
					<div className={cx('controls')}>
						<Button onClick={onSave}>{t('save')}</Button>
					</div>
				)}
			</div>
		</Prompt.Dialog>
	);
}
