import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  health() {
    return {
      status: 'API healthy',
      time: new Date().toISOString(),
    }

  }

  ready(){
    return{
      status: 'Database healthy',
      time: new Date().toISOString(),
    }
  }
}
