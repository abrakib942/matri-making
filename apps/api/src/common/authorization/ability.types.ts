import { PrismaAbility } from '@casl/prisma';

export type AppSubjects =
  | 'all'
  | 'role'
  | 'permission'
  | 'user'
  | 'folder'
  | 'file'
  | 'profile'
  | 'verification'
  | 'payment'
  | 'plan'
  | 'report'
  | 'success-story'
  | 'cms'
  | 'ticket'
  | 'ad';
export type AppActions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type AppAbility = PrismaAbility<[AppActions, AppSubjects]>;
