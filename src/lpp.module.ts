import { Module } from '@nestjs/common';
import { LppService } from './lpp.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LppHelper } from './lpp.helper.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [LppService, LppHelper],
})
export class LppModule {}
