import { Module } from '@nestjs/common';
import { StudioService } from './studio.service';
import { StudioController } from './studio.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [StudioService, PrismaService],
  controllers: [StudioController]
})
export class StudioModule { }
