enum MailServiceProviders {
	brevo,
}

interface MailService {
	sendMail: ({
		email,
		subject,
		htmlContent,
	}: {
		email: string;
		subject: string;
		htmlContent: string;
	}) => Promise<void>;

	sendTemplate: ({
		email,
		templateId,
		templateData,
	}: {
		email: string;
		templateId: string;
		templateData: unknown;
	}) => Promise<void>;
}

export { MailServiceProviders, type MailService };
