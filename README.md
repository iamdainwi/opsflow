# opsflow

A multi-role internal service/request management platform (e.g., IT/Operations ticket &amp; approval workflow system with Admin, Manager, and Employee roles).

## Docker databse

```bash
docker exec -it opsflow_db mysql -u root -p
```

### Things Completed

- User Signup API (`POST /auth/register`)
- Password hashing using NestJS `PasswordHasher`
- User account creation through UsersService and Drizzle ORM
- Duplicate email checking
- Default user role assignment (`employee`)

### Things Working On

- User Login API (`POST /auth/login`)
- User lookup by email
- Password verification using `PasswordHasher`
- Returning authenticated user details

### Things ToDo

- JWT access token generation and validation
- Authentication guards for protected routes
- Role-Based Access Control (Employee, Manager, Admin)
- Ticket Generation API
- Ticket CRUD operations
- Ticket assignment and status management
- Authorization for ticket operations
