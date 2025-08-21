import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.http.post<any>('http://localhost:8000/token', { email, password })
      .subscribe({
        next: (res) => {
          console.log('Connexion réussie', res);
          localStorage.setItem('token', res.token);
          localStorage.setItem('isAdmin', res.isAdmin);
          this.router.navigate(['/products']); // ou autre page après login
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur connexion', err);
          this.errorMessage = err.error?.error || 'Erreur de connexion';
        }
      });
  }
}