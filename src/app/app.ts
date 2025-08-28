import { ChangeDetectionStrategy, Component, signal, afterNextRender } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces for type safety
interface Game {
  id: number;
  name: string;
  image: string;
  description: string;
  link: string;
}

interface Member {
  id: number;
  email: string;
  password: string;
  fullname: string;
  image: string;
  role: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Signals to manage application state
  isLoggedIn = signal(false);
  showLoginScreen = signal(false); // Initially show the main page
  
  // Signals for login form data and error messages
  loginEmail = signal('');
  loginPassword = signal('');
  loginError = signal('');

  // Signals to hold data from JSON files
  games = signal<Game[]>([]);
  members = signal<Member[]>([]);

  // Signal to track the currently selected game, if any
  selectedGame = signal<Game | null>(null);

  constructor() {
    // This hook ensures that data fetching occurs after the initial render.
    // This is crucial for fixing the hydration error (NG0502)
    // by ensuring the DOM structure is consistent on both the server and client.
    afterNextRender(() => {
      this.loadGames();
      this.loadMembers();
    });
  }

  /**
   * Asynchronously loads game data from the games.json file.
   * Updates the `games` signal upon successful fetch.
   * Logs an error to the console if the fetch fails.
   */
  async loadGames() {
    try {
      // Use the correct path starting from the root of the assets folder
      const response = await fetch('/assets/games.json');
      const data = await response.json();
      this.games.set(data);
    } catch (error) {
      console.error('Failed to load games data:', error);
    }
  }

  /**
   * Asynchronously loads member data from the members.json file.
   * Updates the `members` signal upon successful fetch.
   * Logs an error to the console if the fetch fails.
   */
  async loadMembers() {
    try {
      // Use the correct path starting from the root of the assets folder
      const response = await fetch('/assets/members.json');
      const data = await response.json();
      this.members.set(data);
    } catch (error) {
      console.error('Failed to load members data:', error);
    }
  }

  /**
   * Handles the login logic.
   * Compares the entered email and password with the members data.
   * Updates login state and error message accordingly.
   */
  login() {
    this.loginError.set(''); // Clear previous errors
    const email = this.loginEmail();
    const password = this.loginPassword();

    // Find the member with matching email and password
    const member = this.members().find(m => m.email === email && m.password === password);

    if (member) {
      // If a member is found, set login state to true and hide login screen
      this.isLoggedIn.set(true);
      this.showLoginScreen.set(false);
      console.log('Login successful for:', member.fullname);
    } else {
      // If no member is found, set an error message
      this.loginError.set('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  /**
   * Handles the logout logic.
   * Resets the login state and shows the login screen.
   */
  logout() {
    this.isLoggedIn.set(false);
    this.showLoginScreen.set(true);
    // Optionally clear form fields
    this.loginEmail.set('');
    this.loginPassword.set('');
  }

  /**
   * Displays the details of a selected game.
   * @param game The Game object to be displayed.
   */
  selectGame(game: Game) {
    this.selectedGame.set(game);
  }

  /**
   * Clears the selected game to return to the list view.
   */
  clearSelection() {
    this.selectedGame.set(null);
  }
}
