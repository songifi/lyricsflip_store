import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LiveStreamService } from "./livestream.service"
import { PaymentService } from "./payment.service"
import { StreamingService } from "./streaming.service"
import { LiveStreamController } from "./livestream.controller"
import { LiveStreamGateway } from "./websocket/livestream.gateway"
import { LiveStream } from "./entities/livestream.entity"
import { LiveStreamRecording } from "./entities/livestream-recording.entity"
import { LiveStreamAnalytics } from "./entities/livestream-analytics.entity"
import { LiveStreamPayment } from "./entities/livestream-payment.entity"
import { LiveStreamChat } from "./entities/livestream-chat.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveStream, LiveStreamRecording, LiveStreamAnalytics, LiveStreamPayment, LiveStreamChat]),
  ],
  controllers: [LiveStreamController],
  providers: [LiveStreamService, PaymentService, StreamingService, LiveStreamGateway],
  exports: [LiveStreamService, PaymentService, StreamingService],
})
export class LiveStreamModule {}
