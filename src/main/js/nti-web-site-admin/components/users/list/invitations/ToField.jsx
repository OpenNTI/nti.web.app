import { validate as isEmail } from 'email-validator';

import { TokenEditor, Input, useToggle } from '@nti/web-commons';
import { Button, Icons } from '@nti/web-core';

import { Label, Row } from './common-parts';
import { BulkInviteInstructions } from './BulkInviteInstructions';
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
		<Row
			className="invite-people-to-field"
			css={css`
				display: grid;
				grid-template: auto / auto 1fr auto;
				padding-right: 10px;
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
		</Row>
	);
}

function FileUpload({ onFileChange }) {
	const [show, toggle] = useToggle(false);
	return (
		<>
			<span
				css={css`
					display: flex;
				`}
			>
				<Input.File
					label={t('importFile')}
					accept=".csv"
					onFileChange={onFileChange}
					css={css`
						:global(span.button.file-picker) {
							line-height: 30px;
						}
					`}
				/>
				<Button
					plain
					onClick={toggle}
					css={css`
						color: var(--tertiary-grey);
						&:hover {
							color: var(--primary-blue);
						}
					`}
				>
					<Icons.Hint />
				</Button>
			</span>
			{show && (
				<BulkInviteInstructions
					css={css`
						grid-column: 1 / -1;
					`}
				/>
			)}
		</>
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
