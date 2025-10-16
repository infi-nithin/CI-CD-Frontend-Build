import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, DatePipe, NgClass } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    NgClass,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent implements OnInit {
  task?: Task;
  loading = false;
  error = '';

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadTaskDetails(Number(params['id']));
      }
    });
  }

  loadTaskDetails(id: number): void {
    this.loading = true;
    
    this.taskService.getTaskById(id)
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading task details';
          this.snackBar.open(this.error, 'Close', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/tasks']);
        }
      });
  }

  editTask(): void {
    this.router.navigate(['/tasks/edit', this.task?.id]);
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'TO_DO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'DONE':
        return 'status-done';
      default:
        return '';
    }
  }
}