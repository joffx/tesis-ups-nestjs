import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/jpg|application\/pdf)$/,
          }), 
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log(file);
    console.log(body);
    return this.reportsService.upload(
      file.originalname,
      file.buffer,
      body.precision,
      body.object,
    );
  }

  @Get('getReports')
  getReports() {
    return this.reportsService.getReports();
  }

  @Get('alertEsp32')
  alertEsp32() {
    return this.reportsService.alertEsp32();
  }
}
