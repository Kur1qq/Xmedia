import { Test, TestingModule } from '@nestjs/testing';
import { BundleServiceController } from './bundle-service.controller';

describe('BundleServiceController', () => {
  let controller: BundleServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundleServiceController],
    }).compile();

    controller = module.get<BundleServiceController>(BundleServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
