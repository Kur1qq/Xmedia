import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) throw new Error('DATABASE_URL environment variable is not set!');

        const url = connectionString.includes('allowPublicKeyRetrieval')
            ? connectionString
            : connectionString + (connectionString.includes('?') ? '&allowPublicKeyRetrieval=true' : '?allowPublicKeyRetrieval=true');

        const adapter = new PrismaMariaDb(url);
        super({ adapter });
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
