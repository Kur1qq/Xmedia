import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        let connectionString = process.env.DATABASE_URL || 'mysql://root:endisgiihiijbaina@localhost:3306/xmedia';
        if (!connectionString.includes('allowPublicKeyRetrieval')) {
            connectionString += connectionString.includes('?') ? '&allowPublicKeyRetrieval=true' : '?allowPublicKeyRetrieval=true';
        }

        const adapter = new PrismaMariaDb(connectionString);

        super({
            adapter,
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
