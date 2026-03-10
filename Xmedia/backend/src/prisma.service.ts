import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('✅ Database connected successfully!');
        } catch (error) {
            console.error('❌ Database connection failed!');
            console.error(error);
        }
    }
}
