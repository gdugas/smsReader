import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, EventEmitter, Output } from '@angular/core';
import * as uuidv4 from 'uuid/v4';
import { EventManager } from '@angular/platform-browser';

@Component({
  selector: 'app-filepicker',
  templateUrl: './filepicker.component.html',
  styleUrls: ['./filepicker.component.scss']
})
export class FilepickerComponent implements AfterViewInit, OnInit {

  @Output()
  load: EventEmitter<string> = new EventEmitter();

  @ViewChild('picker')
  pickerEl: ElementRef;

  filepickerId;

  constructor() {
    this.filepickerId = uuidv4();
  }

  ngAfterViewInit(): void {
    this.pickerEl.nativeElement.addEventListener('change', () => {

      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        this.load.emit(e.target.result);
      };

      reader.readAsText(this.pickerEl.nativeElement.files[0]);
    });
  }

  ngOnInit() {
  }

}
