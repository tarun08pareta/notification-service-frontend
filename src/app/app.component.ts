import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'notification-engine';

  ngOnInit(): void {
    this.hideSplashScreen();
  }

  private hideSplashScreen(): void {
    const splashScreen = document.getElementById('app-splash-screen');
    if (splashScreen) {
      splashScreen.classList.add('hidden');
      
      // Animation (0.4s) complete hone ke baad element ko DOM se remove kar dein
      setTimeout(() => {
        splashScreen.remove();
      }, 400);
    }
  }
}