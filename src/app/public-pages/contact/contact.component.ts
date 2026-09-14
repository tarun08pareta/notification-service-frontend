import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  readonly fullName = signal('');
  readonly email = signal('');
  readonly subject = signal('');
  readonly message = signal('');
  readonly subjectOpen = signal(false);
  readonly submitted = signal(false);

  readonly subjects = [
    'Technical Support',
    'Sales & Pricing',
    'Partnership Inquiry',
    'General Question',
    'Bug Report',
    'Feature Request',
  ];

  get messageLength() { return this.message().length; }

  selectSubject(s: string) {
    this.subject.set(s);
    this.subjectOpen.set(false);
  }

  sendMessage() {
    if (!this.fullName() || !this.email() || !this.subject() || !this.message()) return;
    this.submitted.set(true);
  }

  reset() {
    this.fullName.set('');
    this.email.set('');
    this.subject.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}
