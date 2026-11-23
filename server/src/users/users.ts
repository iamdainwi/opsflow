export type Role = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: Role[];
}
