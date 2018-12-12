import { Contact } from './contact.class';
import { Attachment } from './attachment.class';


export class Message {
    direction: string;
    from: string;
    to: string;
    content: string;
    date: Date;
    date_sent?: Date;
    date_received?: Date;
    subject?: string;
    attachments?: Attachment[];
}
