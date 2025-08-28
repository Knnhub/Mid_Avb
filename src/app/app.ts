import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define interfaces for data structures
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
  template: `
    <!-- Main container for the application with a darker background for contrast -->
    <div class="bg-[#181a1e] text-white min-h-screen">
      <!-- Header Section -->
      <header class="relative z-10 w-full shadow-lg bg-black">
        <div class="container mx-auto flex items-center justify-between p-4 px-6 md:px-12">
          <!-- Garena Logo as an image from assets -->
          <a href="#" class="flex-shrink-0">
            <img 
              class="h-10" 
              src="/assets/logo-garena.png" 
              alt="โลโก้ Garena">
          </a>

          <!-- Navigation Links -->
          <nav>
            <!-- Show these links when the user is NOT logged in -->
            @if (!isLoggedIn()) {
              <div class="flex items-center space-x-4">
                <a href="#" (click)="showLogin()" class="px-4 py-2 border border-[#ff6600] text-[#ff6600] rounded-md transition-all duration-300 hover:bg-[#ff6600] hover:text-white hover:shadow-lg">
                  เข้าสู่ระบบ
                </a>
                <a href="#" class="px-4 py-2 bg-[#ff6600] text-white rounded-md transition-all duration-300 hover:bg-[#e65c00] hover:shadow-lg">
                  สมัครสมาชิก
                </a>
              </div>
            }

            <!-- Show these links when the user IS logged in -->
            @if (isLoggedIn()) {
              <div class="flex items-center space-x-6">
                <a href="#" class="text-white hover:text-[#ff6600] transition-colors duration-300">
                  โปรไฟล์
                </a>
                <a href="#" (click)="showGameList()" class="text-white hover:text-[#ff6600] transition-colors duration-300">
                  รายการเกม
                </a>
                <button (click)="logout()" class="px-4 py-2 bg-transparent border border-[#ff6600] text-[#ff6600] rounded-md transition-all duration-300 hover:bg-[#ff6600] hover:text-white hover:shadow-lg">
                  ออกจากระบบ
                </button>
              </div>
            }
          </nav>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="container mx-auto p-6 md:p-12">
        <!-- Login Section -->
        @if (!isLoggedIn() && showLoginScreen()) {
          <div class="flex items-center justify-center min-h-[calc(100vh-80px)] -mt-20">
            <div class="bg-[#242424] p-8 rounded-lg shadow-xl w-full max-w-sm">
              <h1 class="text-2xl font-bold mb-6 text-center text-white">เข้าสู่ระบบ</h1>
              <form (ngSubmit)="login()">
                <div class="mb-4">
                  <label for="email" class="block text-sm font-medium text-gray-400">อีเมล</label>
                  <input 
                    type="email" 
                    id="email" 
                    [(ngModel)]="loginEmail" 
                    name="email"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-transparent text-white focus:border-[#ff6600] focus:ring focus:ring-[#ff6600] focus:ring-opacity-50" 
                    required>
                </div>
                <div class="mb-6">
                  <label for="password" class="block text-sm font-medium text-gray-400">รหัสผ่าน</label>
                  <input 
                    type="password" 
                    id="password" 
                    [(ngModel)]="loginPassword" 
                    name="password"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-transparent text-white focus:border-[#ff6600] focus:ring focus:ring-[#ff6600] focus:ring-opacity-50" 
                    required>
                </div>
                @if (loginError) {
                  <p class="text-red-500 text-sm mb-4">{{ loginError }}</p>
                }
                <button 
                  type="submit" 
                  class="w-full px-4 py-2 bg-[#ff6600] text-white rounded-md font-semibold transition-all duration-300 hover:bg-[#e65c00] hover:shadow-lg">
                  เข้าสู่ระบบ
                </button>
              </form>
              <div class="flex justify-between mt-4 text-sm text-gray-400">
                <a href="#" class="hover:text-[#ff6600]">สมัครสมาชิก</a>
                <a href="#" (click)="clearSelection()" class="hover:text-[#ff6600]">กลับสู่หน้าหลัก</a>
              </div>
            </div>
          </div>
        }

        <!-- Game List Section -->
        @if (isLoggedIn() && !selectedGame()) {
          <h1 class="text-3xl md:text-4xl font-bold mb-8 text-center">แนะนำ, คุณสบายใจดี</h1>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            @for (game of games(); track game.id) {
              <div 
                class="bg-[#242424] rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                (click)="selectGame(game)">
                <img [src]="game.image" [alt]="game.name" class="w-full h-auto">
                <div class="p-4 text-center">
                  <h2 class="text-lg font-semibold">{{ game.name }}</h2>
                  <p class="text-sm text-gray-400">{{ game.description }}</p>
                </div>
              </div>
            }
          </div>
        }

        <!-- Game Details Section -->
        @if (isLoggedIn() && selectedGame()) {
          <div class="max-w-4xl mx-auto bg-[#242424] p-8 rounded-lg shadow-lg">
            <button (click)="clearSelection()" class="mb-6 px-4 py-2 border border-[#ff6600] text-[#ff6600] rounded-md transition-all duration-300 hover:bg-[#ff6600] hover:text-white">
              กลับไปหน้ารายการ
            </button>
            <div class="md:flex md:space-x-8">
              <div class="md:w-1/2 flex justify-center">
                <img [src]="selectedGame()!.image" [alt]="selectedGame()!.name" class="rounded-lg shadow-xl w-full h-auto">
              </div>
              <div class="md:w-1/2 mt-6 md:mt-0">
                <h1 class="text-3xl font-bold mb-4">{{ selectedGame()!.name }}</h1>
                <p class="text-gray-400 mb-6">{{ selectedGame()!.description }}</p>
                <div class="space-y-4">
                  <div>
                    <h2 class="text-lg font-semibold text-[#ff6600]">ข้อมูลเบื้องต้น</h2>
                    <p class="text-sm text-gray-300">
                      ชื่อ: {{ selectedGame()!.name }}
                      <br>
                      รายละเอียด: {{ selectedGame()!.description }}
                    </p>
                  </div>
                  <a [href]="selectedGame()!.link" target="_blank" class="block w-full text-center px-6 py-3 bg-[#00a6ff] text-white rounded-lg font-semibold transition-all duration-300 hover:bg-[#0086d9] hover:shadow-xl">
                    ดาวน์โหลด
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
        font-family: 'Inter', sans-serif;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  // Use a signal to manage the login state
  isLoggedIn = signal(false);
  showLoginScreen = signal(true);
  
  // Use a signal to track the selected game, initially null
  selectedGame = signal<Game | null>(null);

  // Signals for login form data and errors
  loginEmail = signal('');
  loginPassword = signal('');
  loginError = signal('');

  // Signals for data from JSON files
  games = signal<Game[]>([]);
  members = signal<Member[]>([]);

  ngOnInit(): void {
    // Load games data from games.json
    this.loadGames();
    // Load members data from members.json
    this.loadMembers();
  }

  // Method to load games from the JSON file
  async loadGames() {
    try {
      const response = await fetch('/assets/games.json');
      const data = await response.json();
      this.games.set(data);
    } catch (error) {
      console.error('Failed to load games data:', error);
    }
  }

  // Method to load members from the JSON file
  async loadMembers() {
    try {
      const response = await fetch('/assets/members.json');
      const data = await response.json();
      this.members.set(data);
    } catch (error) {
      console.error('Failed to load members data:', error);
    }
  }

  // Method to handle user login
  login() {
    const user = this.members().find(
      member => member.email === this.loginEmail() && member.password === this.loginPassword()
    );

    if (user) {
      this.isLoggedIn.set(true);
      this.showLoginScreen.set(false);
      this.loginError.set('');
      console.log('Login successful for user:', user.fullname);
    } else {
      this.loginError.set('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      console.log('Login failed: Invalid email or password.');
    }
  }

  // Method to log out the user
  logout() {
    this.isLoggedIn.set(false);
    this.showLoginScreen.set(true); // Show login screen after logout
    this.selectedGame.set(null); // Clear selected game
    this.loginEmail.set(''); // Clear form data
    this.loginPassword.set('');
    console.log('User logged out.');
  }

  // Method to show the login screen
  showLogin() {
    this.showLoginScreen.set(true);
  }

  // Method to show the game list screen
  showGameList() {
    this.showLoginScreen.set(false);
  }

  // Method to set the selected game for viewing details
  selectGame(game: Game) {
    this.selectedGame.set(game);
  }

  // Method to clear the selected game and go back to the list
  clearSelection() {
    this.selectedGame.set(null);
    this.showLoginScreen.set(false);
  }
}
