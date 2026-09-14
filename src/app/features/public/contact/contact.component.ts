import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  scrollToApi(): void {
    // If the user is navigating to / (landing page), scroll to the #developers section
    setTimeout(() => {
      document.getElementById('developers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}

