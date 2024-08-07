import { FeatureService } from './modules/feature/feature.service';
async function bootstrap() {
  const feature = new FeatureService();
  await feature.overralFlow();
}

bootstrap();
