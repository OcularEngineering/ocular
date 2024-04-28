import { IQueueService } from '@ocular/types'
import QueueService from '../queue'
const { Kafka } = require('kafkajs')

jest.useFakeTimers()
jest.setTimeout(1000000);

const loggerMock = {
  info: jest.fn().mockReturnValue(console.log),
  warn: jest.fn().mockReturnValue(console.log),
  error: jest.fn().mockReturnValue(console.log),
  panic: jest.fn().mockReturnValue(console.log),
  shouldLog: jest.fn().mockReturnValue(console.log),
  setLogLevel: jest.fn().mockReturnValue(console.log),
  unsetLogLevel: jest.fn().mockReturnValue(console.log),
  activity: jest.fn().mockReturnValue(console.log),
  progress: jest.fn().mockReturnValue(console.log),
  failure: jest.fn().mockReturnValue(console.log),
  success: jest.fn().mockReturnValue(console.log),
  debug: jest.fn().mockReturnValue(console.log),
  log: jest.fn().mockReturnValue(console.log),
}
// This test assumes that a Kafka service is running in Docker localhost:9092.
// To run the service, check the instructions in the Developer.md file.
describe('queueService', () => {
  let queueService: IQueueService;
  beforeEach( async () => {
    try{
      // Connect To Real Kafka in Docker Container  
      const kafka = await new Kafka({
        clientId: 'ocular',
        brokers: ['localhost:9092'],
      })
    
    const moduleDeps = {
      logger: loggerMock,
      eventBusRedisConnection: {},
      kafkaClient: kafka,
    }
     queueService= new QueueService(moduleDeps);
    } catch (error) {
      console.log('Error connecting to Kafka in Docker', error)
    }

  });

  it('should send a message to a topic', (done) => {
    queueService.send("ocular", {message: "Hello World"});
    queueService.subscribe("ocular", async (message, topic) => {
      console.log("Message Received", message)
      expect(message).toEqual("expectedMessage");
      done()
    }, {groupId: "ocular-group"});
  });


  it('should send batch messages to a topic', (done) => {
    queueService.sendBatch("ocular", [{message: "Hello World 1"}, {message: "Hello World 2"}, {message: "Hello World 3"}, {message: "Hello World 4"}]);
    queueService.subscribe("ocular", async (message, topic) => {
      console.log("Message Received", message)
      expect(message).toEqual("expectedMessage");
      done()
    }, {groupId: "ocular-group"});
  });
}
)