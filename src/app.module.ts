import { Module } from '@nestjs/common';
import { Execute } from './controllers/Execute';
import { OpaService } from './services/OpaService';

@Module({
    imports: [],
    controllers: [Execute],
    providers: [OpaService],
    exports: []
})
export class AppModule {}
