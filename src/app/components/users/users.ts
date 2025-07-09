import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

// Interfaces
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Group {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-management',
  templateUrl: './users.html',
  standalone:false,
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
deleteUser(arg0: any) {
throw new Error('Method not implemented.');
}
manageGroups(arg0: any) {
throw new Error('Method not implemented.');
}
assignGroup() {
throw new Error('Method not implemented.');
}
  @ViewChild('groupDialog') groupDialog!: TemplateRef<any>;
  @ViewChild(MatSort) sort!: MatSort;

  // Table properties
  displayedColumns: string[] = ['avatar', 'username', 'fullName', 'status', 'actions'];
  users: User[] = [];
  filteredUsers = new MatTableDataSource<User>([]);
  searchTerm = '';

  // Form properties
  userForm: FormGroup;
  isEditMode = false;
  editingUserId: number | null = null;
  hidePassword = true;

  // Dialog properties
  selectedGroup: number | null = null;
  currentUserId: number | null = null;
  groups: Group[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.createUserForm();
    this.initializeData();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadGroups();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.filteredUsers.sort = this.sort;
  }

  // Form initialization
  private createUserForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      isActive: [true]
    });
  }

  // Data initialization
  private initializeData(): void {
    // Mock data - replace with actual API calls
    this.users = [
      {
        id: 1,
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: false,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: 3,
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];

    this.groups = [
      {
        id: 1,
        name: 'Amministratori',
        description: 'Accesso completo al sistema',
        permissions: ['read', 'write', 'delete', 'admin']
      },
      {
        id: 2,
        name: 'Utenti Standard',
        description: 'Accesso limitato alle funzionalità base',
        permissions: ['read', 'write']
      },
      {
        id: 3,
        name: 'Visualizzatori',
        description: 'Solo visualizzazione dei dati',
        permissions: ['read']
      }
    ];
  }

  // Data loading methods
  private loadUsers(): void {
    // In a real application, this would be an API call
    this.filteredUsers.data = this.users;
  }

  private loadGroups(): void {
    // In a real application, this would be an API call
    console.log('Groups loaded:', this.groups);
  }

  // Search functionality
  private setupSearch(): void {
    this.filteredUsers.filterPredicate = (user: User, filter: string) => {
      const searchText = filter.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchText) ||
        user.firstName.toLowerCase().includes(searchText) ||
        user.lastName.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText)
      );
    };
  }

  onSearchChange(): void {
    this.filteredUsers.filter = this.searchTerm.trim().toLowerCase();
  }

  // Form methods
  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      
      if (this.isEditMode && this.editingUserId) {
        this.updateUser(this.editingUserId, formData);
      } else {
        this.createUser(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({ isActive: true });
    this.isEditMode = false;
    this.editingUserId = null;
    this.hidePassword = true;
  }

  // CRUD Operations
  createUser(userData: Partial<User>): void {
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id)) + 1,
      username: userData.username!,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    this.filteredUsers.data = [...this.users];
    this.resetForm();
    
    // this.snackBar('Utente creato con successo!', 'success');
  }

  editUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.isEditMode = true;
      this.editingUserId = userId;
      
      // Remove password validation for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      });
      
      // Scroll to form
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateUser(userId: number, userData: Partial<User>): void {
  }

}