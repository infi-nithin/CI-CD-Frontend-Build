import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { first, finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '/tasks';
  error: string = '';
  hidePassword = true;
  private authSubscription?: Subscription;
  loginAttempts = 0;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tasks']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.highlightFormErrors();
      return;
    }

    this.loading = true;
    this.loginAttempts++;

    this.authSubscription = this.authService
      .login({
        username: this.f['username'].value,
        password: this.f['password'].value,
      })
      .pipe(
        first(),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Login successful! Redirecting...', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });

          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 500);
        },
        error: (err) => {
          this.error = 'Invalid username or password';

          let errorMessage = this.error;
          if (this.loginAttempts >= 3) {
            errorMessage =
              'Multiple failed login attempts. Need help? Contact support.';
          } else if (err.status === 401) {
            errorMessage = 'Invalid username or password';
          } else if (err.status === 403) {
            errorMessage = 'Your account is locked. Please contact support.';
          } else if (!navigator.onLine) {
            errorMessage = 'No internet connection. Please check your network.';
          } else if (err.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  private highlightFormErrors(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });

    const invalidControl = document.querySelector('.ng-invalid');
    if (invalidControl) {
      (invalidControl as HTMLElement).focus();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loginWithDemo(): void {
    this.loginForm.patchValue({
      username: 'demo',
      password: 'demo123',
    });
    this.onSubmit();
  }
}
