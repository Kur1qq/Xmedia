import { Module } from '@nestjs/common';
import { BundleServiceController } from './bundle-service.controller';
import { BundleServiceService } from './bundle-service.service';

@Module({
  controllers: [BundleServiceController],
  providers: [BundleServiceService]
})
export class BundleServiceModule {}
