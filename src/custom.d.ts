import { IEmployeeDoc } from './modules/employee/employee.interfaces';
import { IUserDoc } from './modules/user/user.interfaces';

declare module 'express-serve-static-core' {
  export interface Request {
    user: IUserDoc;
    employee: IEmployeeDoc;
    scope: string;
  }
}
