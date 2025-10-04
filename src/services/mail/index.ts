import { BrevoMailService } from "./impl/brevo_mail.service";
import { type MailService, MailServiceProviders } from "./mail.service";

function mailServiceFactory({
  provider = MailServiceProviders.brevo,
}: {
  provider?: MailServiceProviders;
}): MailService {
  switch (provider) {
    case MailServiceProviders.brevo:
      return new BrevoMailService();
    default:
      throw new Error("Mail service not found");
  }
}

export { mailServiceFactory, MailServiceProviders };
