import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set!');
}
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = '24h';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: { sub: number; username: string; role: string }) {
        return { id: payload.sub, username: payload.username, role: payload.role };
    }
}
