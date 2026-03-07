import { Module } from '@nestjs/common';
import { HeroService } from './hero.service';
import { HeroController } from './hero.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HeroController],
  providers: [HeroService, PrismaService],
})
export class HeroModule { }
