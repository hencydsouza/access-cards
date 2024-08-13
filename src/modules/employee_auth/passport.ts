import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '../../config/config';
import Employee from '../employee/employee.model';
import { IPayload } from '../employee_token/token.interfaces';
import { tokenTypes } from '../employee_token';

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (payload: IPayload, done) => {
    try {
      if (payload.type !== tokenTypes.ACCESS) {
        throw new Error('Invalid token type');
      }
      const employee = await Employee.findById(payload.sub);
      if (!employee) {
        return done(null, false);
      }
      done(null, employee);
    } catch (error) {
      done(error, false);
    }
  }
);

export default jwtStrategy;
