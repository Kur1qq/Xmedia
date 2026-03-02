import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PrismaModule } from '../prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [PrismaModule, JwtModule.register({})],
    controllers: [PortfolioController],
    providers: [PortfolioService],
})
export class PortfolioModule { }
