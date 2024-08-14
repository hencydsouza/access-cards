import { Document, Model } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';


export interface IToken {
    token: string;
    employee: string;
    type: string;
    expires: Date;
    scope: string;
    blacklisted: boolean;
}

export type NewToken = Omit<IToken, 'blacklisted'>;

export interface ITokenDoc extends IToken, Document { }

export interface ITokenModel extends Model<ITokenDoc> { }

export interface IPayload extends JwtPayload {
    sub: string;
    iat: number;
    exp: number;
    scope: string;
    type: string;
}

export interface TokenPayload {
    token: string;
    expires: Date;
}

export interface AccessAndRefreshTokens {
    access: TokenPayload;
    refresh: TokenPayload;
}
