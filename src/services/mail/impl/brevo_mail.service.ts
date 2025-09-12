import type { MailService } from "../mail.service";

const brevoTransactionalEmailUrl = "https://api.brevo.com/v3/smtp/email";

class BrevoMailService implements MailService {
	_sendRequest(body: object): Promise<void> {
		return fetch(brevoTransactionalEmailUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.BREVO_API_KEY as string,
				Accept: "application/json",
			},
			body: JSON.stringify({
				sender: {
					name: process.env.EMAIL_SENDER_NAME as string,
					email: process.env.EMAIL_SENDER_EMAIL as string,
				},
				...body,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to send email`);
				}
				console.log(`Email sent successfully`);
			})
			.catch((error) => {
				console.error(`Failed to send email`, error);
			});
	}

	sendMail = async ({
		email,
		subject,
		htmlContent,
	}: {
		email: string;
		subject: string;
		htmlContent: string;
	}): Promise<void> => {
		const brevoTransactonalEmailPayload = {
			sender: {
				name: process.env.EMAIL_SENDER_NAME as string,
				email: process.env.EMAIL_SENDER_EMAIL as string,
			},
			to: [
				{
					email: email,
				},
			],
			subject: subject,
			htmlContent: htmlContent,
		};
		return this._sendRequest(brevoTransactonalEmailPayload);
	};

	sendTemplate = ({
		email,
		templateId,
		templateData,
	}: {
		email: string;
		templateId: string;
		templateData: unknown;
	}): Promise<void> => {
		const brevoTemplateEmailPayload = {
			to: [
				{
					email: email,
				},
			],
			templateId: templateId,
			params: templateData,
		};
		return this._sendRequest(brevoTemplateEmailPayload);
	};
}

export { BrevoMailService };
