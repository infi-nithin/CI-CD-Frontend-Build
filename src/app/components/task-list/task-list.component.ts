import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    DatePipe,
    SlicePipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'title',
    'description',
    'status',
    'createdAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<Task>([]);
  tasks: Task[] = [];
  loading = false;
  error = '';
  statusFilter: TaskStatus | '' = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  taskStatuses = Object.values(TaskStatus);

  constructor(
    private taskService: TaskService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTasks(): void {
    this.loading = true;

    if (this.statusFilter) {
      this.taskService.getTasksByStatus(this.statusFilter).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.dataSource.data = tasks;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
        },
      });
    } else {
      this.taskService.getAllTasks().subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.dataSource.data = tasks;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading tasks';
          this.snackBar.open(this.error, 'Close', { duration: 3000 });
          this.loading = false;
        },
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  viewTaskDetails(task: Task): void {
    this.router.navigate(['/tasks/details', task.id]);
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.deleteTask(task.id!).subscribe({
          next: () => {
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000,
            });
            this.loadTasks();
          },
          error: (error) => {
            this.error = 'Error deleting task';
            this.snackBar.open(this.error, 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  addNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case TaskStatus.TO_DO:
        return 'status-todo';
      case TaskStatus.IN_PROGRESS:
        return 'status-progress';
      case TaskStatus.DONE:
        return 'status-done';
      default:
        return '';
    }
  }
}
