import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId?: number;
  loading = false;
  submitted = false;
  
  taskStatuses = Object.values(TaskStatus);

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      status: [TaskStatus.TO_DO, Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = Number(params['id']);
        this.loadTaskData();
      }
    });
  }

  loadTaskData(): void {
    this.loading = true;
    this.taskService.getTaskById(this.taskId!)
      .subscribe({
        next: (task) => {
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status
          });
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Error loading task', 'Close', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/tasks']);
        }
      });
  }

  get f() { return this.taskForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.taskForm.invalid) {
      return;
    }

    this.loading = true;
    const taskData: Task = {
      title: this.f['title'].value,
      description: this.f['description'].value,
      status: this.f['status'].value
    };

    if (this.isEditMode) {
      
      this.taskService.updateTask(this.taskId!, taskData)
        .subscribe({          
          next: () => {
            this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    } else {
      this.taskService.createTask(taskData)      
        .subscribe({
          next: () => {
            this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            this.snackBar.open('Error creating task', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}