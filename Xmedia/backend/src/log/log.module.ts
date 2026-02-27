import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { AdminLogService } from '../admin/admin-log.service';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [AdminLogService],
    exports: [AdminLogService],
})
export class LogModule { }
