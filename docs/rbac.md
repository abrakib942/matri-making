# RBAC Reference

This document captures how the new role & permission system works across the API and admin UI. Use it when onboarding new engineers or extending the authorization layer.

## 1. Concepts & Data Model

| Model            | Purpose                                                                        | Important Fields                    |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| `Role`           | Human-friendly grouping of permissions.                                        | `name` (unique), `description`.     |
| `Permission`     | Atomic `{subject, action}` pair, e.g. `{ subject: "user", action: "update" }`. | `subject`, `action`, `description`. |
| `RolePermission` | Join table connecting roles to permissions.                                    | `(roleId, permissionId)` unique.    |
| `UserRole`       | Allows each user to carry multiple roles.                                      | Composite PK `(userId, roleId)`.    |
| `UserPermission` | Direct overrides (grant/revoke outside of roles).                              | `(userId, permissionId)` unique.    |

All relations cascade on delete, so removing a role or permission automatically cleans up dependent joins.

## 2. Ability Evaluation

- `apps/api/src/common/authorization/ability.factory.ts` loads a user with their roles, role permissions, and direct permissions, then builds a CASL `AppAbility`.
- `PermissionGuard` (`apps/api/src/common/guards/permission.guard.ts`) injects the ability and enforces metadata captured by `@CheckAbility`.
- Controllers specify requirements per endpoint:

```ts
@CheckAbility({ subject: 'folder', action: 'delete' })
@UseGuards(PermissionGuard)
@Delete('api/v1/folders/:id')
deleteById(...) { ... }
```

Super Admin receives an implicit `can('manage', 'all')` grant and bypasses subsequent checks.

## 3. API Surface

| Endpoint                                              | Purpose                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/v1/permissions/catalog`                     | Subject → action grouping used by the admin UI.                          |
| `GET /api/v1/permission-modules` / `permission-types` | Distinct subjects/actions (for dropdowns).                               |
| `PUT /api/v1/roles/:id/permissions`                   | Sync the full permission set for a role (`{ permissionIds: number[] }`). |
| `PUT /api/v1/users/:id/roles`                         | Attach/detach role assignments.                                          |
| `PUT /api/v1/users/:id/permissions`                   | Manage direct overrides for a user.                                      |
| `GET /api/v1/roles/:id`                               | Returns a role plus its permissions and assigned users.                  |

All write endpoints return the updated entity so clients can refresh local state without issuing another GET.

## 4. Seeding & Bootstrapping

- `apps/api/prisma/seed.ts` creates the default permission catalog (role, permission, user, folder, file subjects × CRUD actions) and roles (Super Admin, Admin, Viewer).
- Run the migration and seeds after pulling these changes:

```bash
cd apps/api
pnpm db:migrate:dev --name rbac_overhaul
pnpm db:seed
```

- Seeding also provisions a Super Admin user (`super.admin@example.com` / `password`) and assigns every permission.

## 5. Admin Permission Matrix

- The UI at `/roles/[id]/permissions` now renders a matrix (see `apps/admin/src/app/(authenticated)/roles/[id]/permissions/page.tsx`).
- Features:
  - Search across labels/descriptions.
  - Filter by action type (create/read/update/delete).
  - Subject-level toggle plus “Select all / Clear all / Reset”.
  - Optimistic state with dirty tracking before calling `PUT /roles/:id/permissions`.
- The view consumes `GET /api/v1/permissions/catalog` for structure and `GET /api/v1/roles/:id` for the active selection.

## 6. Migration Notes (Legacy → New)

1. Apply the Prisma migration (`20241119120000_rbac_overhaul`) to introduce the join tables and drop legacy columns (`roleId`, `moduleName`, `permissionType`).
2. Run the seed script to backfill canonical permissions and roles.
3. If you had existing modules/actions, map them to `{subject, action}` pairs before removing old records. A quick script can read legacy data and insert into `Permission` followed by `RolePermission`.
4. Update any hard-coded permission lists in the admin to rely on `permission-modules`, `permission-types`, or `permissions/catalog`.
5. Ensure every protected endpoint has an explicit `@CheckAbility` guard (search for `ModulePermission` should return zero hits).

## 7. Extending the System

- **New subject**: insert a row in `Permission` for each action you need; include a descriptive label so the admin UI renders friendly names.
- **New action**: no code changes required—actions are stored as strings, so seeding `{ action: 'publish' }` is enough. Update the UI filter if you want a dedicated option.
- **Custom rules**: add logic in `AbilityFactory` (e.g., conditional `cannot` rules) before returning the built ability.

Keep this document updated whenever the authorization surface changes so everyone understands the moving parts.\*\*\*
