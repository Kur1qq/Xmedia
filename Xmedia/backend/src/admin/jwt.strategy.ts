import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export const JWT_SECRET = process.env.JWT_SECRET || 'xmedia_admin_jwt_secret_2024';

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
