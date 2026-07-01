import { Module } from '@nestjs/common';
import { DiningSessionController } from 'src/modules/dining-sessions/dining-session.controller';
import { DiningSessionService } from 'src/modules/dining-sessions/dining-session.service';

@Module({
  providers: [DiningSessionService],
  controllers: [DiningSessionController],
})
export class DiningSessionModule {}
