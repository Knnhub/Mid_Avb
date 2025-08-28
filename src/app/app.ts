import { ChangeDetectionStrategy, Component, signal, afterNextRender, PLATFORM_ID, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

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
  isLoggedIn = signal(false);
  showLoginScreen = signal(false);
  showProfileScreen = signal(false);
  showGameDetailScreen = signal(false);
  
  currentUser = signal<Member | null>(null);
  loginEmail = signal('');
  loginPassword = signal('');
  loginError = signal('');

  games = signal<Game[]>([]);
  members = signal<Member[]>([]);

  selectedGame = signal<Game | null>(null);
  topUpUserId = signal('');
  topUpAmount = signal(0);
  
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGames();
      this.loadMembers();
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.currentUser.set(JSON.parse(user));
        this.isLoggedIn.set(true);
      }
    }
  }

  async loadGames() {
    try {
      const response = await fetch('/assets/games/games.json');
      const data = await response.json();
      this.games.set(data);
    } catch (error) {
      console.error('Failed to load games data:', error);
    }
  }

  async loadMembers() {
    try {
      const response = await fetch('/assets/members.json');
      const data = await response.json();
      this.members.set(data);
    } catch (error) {
      console.error('Failed to load members data:', error);
    }
  }

  login() {
    this.loginError.set('');
    const email = this.loginEmail();
    const password = this.loginPassword();

    const member = this.members().find(m => m.email === email && m.password === password);

    if (member) {
      this.isLoggedIn.set(true);
      this.currentUser.set(member);
      localStorage.setItem('currentUser', JSON.stringify(member));
      this.showLoginScreen.set(false);
      this.showProfileScreen.set(true);
      this.showGameDetailScreen.set(false);
      console.log('Login successful for:', member.fullname);
    } else {
      this.loginError.set('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  logout() {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.showLoginScreen.set(false);
    this.showProfileScreen.set(false);
    this.showGameDetailScreen.set(false);
    this.loginEmail.set('');
    this.loginPassword.set('');
  }

  showLogin() {
    if (this.isLoggedIn()) {
      return;
    }
    this.showLoginScreen.set(true);
    this.showProfileScreen.set(false);
    this.showGameDetailScreen.set(false);
  }

  showProfile() {
    if (!this.isLoggedIn()) {
      return;
    }
    this.showProfileScreen.set(true);
    this.showLoginScreen.set(false);
    this.showGameDetailScreen.set(false);
  }

  showHome() {
    this.showProfileScreen.set(false);
    this.showLoginScreen.set(false);
    this.showGameDetailScreen.set(false);
    this.selectedGame.set(null);
  }

  selectGame(game: Game) {
    if (this.isLoggedIn()) {
      this.selectedGame.set(game);
      this.showGameDetailScreen.set(true);
      this.showProfileScreen.set(false);
    }
  }

  topUp() {
    if (this.selectedGame() && this.topUpUserId() && this.topUpAmount() > 0) {
      const message = `ทำรายการเติมเกม ${this.selectedGame()!.name} สำหรับผู้ใช้ ID ${this.topUpUserId()} จำนวน ${this.topUpAmount()} บาทสำเร็จ!`;
      alert(message);
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }
}