import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { User } from './users.js';

interface UserRow extends User {
  passwordHash: string | null;
}

@Injectable()
export class UserRepository {
  private readonly rows = new Map<string, UserRow>();
}
