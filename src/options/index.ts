import type { CurrentUser } from './current-user.ts';
import type { Icons } from './icons.ts';
import type { Labels } from './labels.ts';
import type { Misc } from './misc.ts';
import type { Functionalities } from './functionalities.ts';
import type { Formatters } from './formatters.ts';
import type { Callbacks } from './callbacks.ts';

export interface CommentsOptions extends CurrentUser, Icons, Labels, Misc, Functionalities, Formatters, Callbacks {}
