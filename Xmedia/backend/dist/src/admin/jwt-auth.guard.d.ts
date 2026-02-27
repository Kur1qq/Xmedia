import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
}
export declare function RolesGuard(...allowedRoles: string[]): {
    new (...args: any[]): {
        canActivate(context: ExecutionContext): Promise<boolean>;
        logIn<TRequest extends {
            logIn: Function;
        } = any>(request: TRequest): Promise<void>;
        handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser;
        getAuthenticateOptions(context: ExecutionContext): import("@nestjs/passport").IAuthModuleOptions | undefined;
        getRequest(context: ExecutionContext): any;
    };
    apply(this: Function, thisArg: any, argArray?: any): any;
    call(this: Function, thisArg: any, ...argArray: any[]): any;
    bind(this: Function, thisArg: any, ...argArray: any[]): any;
    toString(): string;
    readonly length: number;
    arguments: any;
    caller: Function;
    readonly name: string;
    [Symbol.hasInstance](value: any): boolean;
};
export {};
