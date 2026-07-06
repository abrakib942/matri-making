import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Allows unauthenticated access; JWT is still parsed when present. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
