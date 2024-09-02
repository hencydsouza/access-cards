import { Strategy as JwtStrategy } from 'passport-jwt';
import config from '../../config/config';
import Employee from '../employee/employee.model';
import { IPayload } from '../employee_token/token.interfaces';
import { tokenTypes } from '../employee_token';
import { Request } from 'express';

const cookieExtractor = (req: Request) => {
  let jwt = null

  if (req && req.cookies) {
    jwt = req.cookies['access_cards'].accessToken
  }

  return jwt
}

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: config.jwt.secret,
    // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: cookieExtractor,
  },
  async (payload: IPayload, done) => {
    try {
      if (payload.type !== tokenTypes.ACCESS) {
        throw new Error('Invalid token type');
      }
      const employee = await Employee.findById(payload.sub);
      const resource = payload.scope
      if (!employee) {
        return done(null, false);
      }
      done(null, employee, resource);
    } catch (error) {
      done(error, false);
    }
  }
);

export default jwtStrategy;
