import { validate as isEmail } from 'email-validator';

import { TokenEditor, Input } from '@nti/web-commons';

import { Label } from './common-parts';
import t from './strings';

export const emailValidator = value => {
	let errors = [];

	if (!value || !isEmail(value)) {
		errors.push('Invalid email address');
	}

	return errors;
};

export function ToField({ to, file, onToChange, onFileChange }) {
	return (
		<div
			className="invite-people-to-field"
			css={css`
				display: flex;
				align-items: baseline;
				border-bottom: solid 1px #ddd;
				border-top: solid 1px #ddd;
			`}
		>
			<Label>To</Label>
			{!file ? (
				<>
					<TokenEditor
						value={to}
						onChange={onToChange}
						placeholder={
							to?.length > 0
								? 'Add more email addresses'
								: 'Enter an email address'
						}
						validator={emailValidator}
						maxTokenLength={64}
						css={css`
							flex-grow: 1;
							border: none;
							min-height: 1.5rem;

							input.token {
								width: 12rem;
							}
						`}
					/>
					{!to?.length && <FileUpload onFileChange={onFileChange} />}
				</>
			) : (
				<SelectedFile
					file={file}
					clear={() => void onFileChange(null)}
				/>
			)}
		</div>
	);
}

function FileUpload({ onFileChange }) {
	return (
		<Input.File
			label={t('importFile')}
			accept=".csv"
			onFileChange={onFileChange}
			css={css`
				span:global(.button.file-picker) {
					line-height: 30px;
				}
			`}
		/>
	);
}

function SelectedFile({ file, clear }) {
	return (
		<div
			className="file-pill-wrap"
			css={css`
				font-size: 0.875rem;
				padding: 0.375rem;
				background: white;
				min-height: 1.5rem;
				line-height: 1.28571;
			`}
		>
			<div
				className="file-pill"
				css={css`
					display: inline-block;
					background: var(--panel-background);
					border: 1px solid #e2e2e2;
					padding: 0.1875rem 0.5rem 0.3125rem 0.75rem;
					color: var(--secondary-grey);
					font-size: 0.875rem;
					line-height: 1.28571;
					margin: 0.1875rem;
				`}
			>
				{file.name}
				<i
					className="icon-bold-x small"
					onClick={clear}
					css={css`
						color: var(--tertiary-grey);
						cursor: pointer;
						margin-left: 0.375rem;
					`}
				/>
			</div>
		</div>
	);
}
