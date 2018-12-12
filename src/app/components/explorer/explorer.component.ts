import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Message } from 'src/app/classes/message.class';
import { Contact } from 'src/app/classes/contact.class';
import { BehaviorSubject } from 'rxjs';
import { parsePhoneNumber } from 'libphonenumber-js'
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnChanges, OnInit {

  get TYPE_SENDER() {
    return '2';
  }

  get TYPE_RECEIVER() {
    return '1';
  }

  @Input()
  xml: Document;

  @Input()
  currentContact: Contact;

  messages$: BehaviorSubject<Message[]> = new BehaviorSubject([]);

  messages: Message[] = [];

  contacts$: BehaviorSubject<Contact[]> = new BehaviorSubject([]);

  contacts: Contact[] = [];

  filterText = '';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.xml) {
      this.loadXml();
    }

    this.refresh();
  }

  loadXml() {
    if (!this.xml) {
      return;
    }

    this.currentContact = null;

    const messages: Message[] = [];
    const contacts: Contact[] = [];

    const allSms = this.xml.getElementsByTagName('sms')
    for (let i = 0; i < allSms.length; i++) {
      try {
        const sms = allSms[i];
        const type = sms.getAttribute('type');
        const address = parsePhoneNumber(sms.getAttribute('address'), 'FR');

        messages.push({
          direction: type === this.TYPE_RECEIVER ? 'received' : 'sent',
          from: type === this.TYPE_RECEIVER ? address.nationalNumber.toString() : null,
          to: type === this.TYPE_SENDER ? address.nationalNumber.toString() : null,
          content: sms.getAttribute('body'),
          date: new Date(parseInt(sms.getAttribute('date'), 10))
        });

        contacts.push({
          id: address.nationalNumber.toString(),
          name: sms.getAttribute('contact_name'),
          phone_number: sms.getAttribute('address')
        });
      } catch (e) {
        console.log('sms ex', e);
      }
    }

    const allMms = this.xml.getElementsByTagName('mms');
    for (let i = 0; i < allMms.length; i++) {
      try {
        const mms = allMms[i];

        let type = this.TYPE_RECEIVER;
        const addrs: any = mms.getElementsByTagName('addr');
        for (let j = 0; j < addrs.length; j++) {
          const addr = addrs[j];
          if (addr.getAttribute('address') === 'insert-address-token') {
            type = this.TYPE_SENDER;
          }
        }


        const address = parsePhoneNumber(mms.getAttribute('address'), 'FR');
        const message: Message = {
          direction: type === this.TYPE_RECEIVER ? 'received' : 'sent',
          from: type === this.TYPE_RECEIVER ? address.nationalNumber.toString() : null,
          to: type === this.TYPE_SENDER ? address.nationalNumber.toString() : null,
          date: new Date(parseInt(mms.getAttribute('date'), 10)),
          content: '',
          attachments: []
        };
        messages.push(message);

        const parts: any = mms.getElementsByTagName('part');
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j];
          const content_type = part.getAttribute('ct');

          if (content_type === 'text/plain') {
            message.content += part.getAttribute('text');
          } else if (content_type.indexOf('image/') >= 0) {
            message.attachments.push({
              content_type: content_type,
              text: part.getAttribute('data')
            });
          }
        }


        contacts.push({
          id: address.nationalNumber.toString(),
          name: mms.getAttribute('contact_name'),
          phone_number: mms.getAttribute('address')
        });
      } catch (e) {
        console.log('mms ex', e);
      }
    }

    messages.sort((a: Message, b: Message) => a.date.getTime() - b.date.getTime());
    this.messages = messages;

    contacts.sort((a: Contact, b: Contact) => a.name.localeCompare(b.name));

    const contactIndex = [];
    this.contacts$.next(contacts.filter(contact => {
      if (contactIndex.indexOf(contact.id) >= 0) {
        return false;
      }
      contactIndex.push(contact.id);
      return true;
    }));
  }


  selectContact(event, contact: Contact) {
    event.preventDefault();
    this.currentContact = contact;
    this.refresh();
  }

  doFilter(event) {
    this.filterText = event.target.value.toLowerCase();
    this.refresh();
  }

  refresh() {
    if (!this.currentContact) {
      this.messages$.next([]);
    } else {
      this.messages$.next(
        this.messages
          .filter((message) => this.currentContact.id === message.from || this.currentContact.id === message.to)
          .filter((message) => this.filterText === '' || message.content.toLowerCase().indexOf(this.filterText) >= 0)
      );
    }
  }

  trustUrl(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


}
