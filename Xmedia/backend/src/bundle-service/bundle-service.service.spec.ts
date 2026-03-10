import { Test, TestingModule } from '@nestjs/testing';
import { BundleServiceService } from './bundle-service.service';

describe('BundleServiceService', () => {
  let service: BundleServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BundleServiceService],
    }).compile();

    service = module.get<BundleServiceService>(BundleServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
