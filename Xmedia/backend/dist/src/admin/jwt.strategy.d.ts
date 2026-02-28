import { Strategy } from 'passport-jwt';
export declare const JWT_SECRET: string;
export declare const JWT_EXPIRES_IN: string;
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: {
        sub: number;
        username: string;
        role: string;
    }): Promise<{
        id: number;
        username: string;
        role: string;
    }>;
}
export {};
