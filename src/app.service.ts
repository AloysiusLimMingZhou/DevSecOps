import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Test API Health Status
  health() {
    return {
      status: 'API healthy',
      time: new Date().toISOString(),
    }

  }

  // Test Database Health Status
  ready(){
    return{
      status: 'Database healthy',
      time: new Date().toISOString(),
    }
  }
}
