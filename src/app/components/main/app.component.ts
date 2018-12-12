import { Component } from '@angular/core';
import { Message } from 'src/app/classes/message.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  xml: Document;

  onload(text) {
    const parser = new DOMParser();
    this.xml = parser.parseFromString(text, 'text/xml');
  }
}
