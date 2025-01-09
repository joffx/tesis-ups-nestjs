import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { envs } from 'src/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  private readonly s3Client = new S3Client({
    region: envs.awsRegion,
    endpoint: envs.awsEndpoint,
    credentials: {
      accessKeyId: envs.awsAccessKeyId,
      secretAccessKey: envs.awsSecretAccessKey,
    },
  });

  async upload(fileName: string, file: Buffer, precision: any, object: any) {
    try {
      const fileExt = fileName.split('.').pop();

      // Obtener fecha actual
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes en formato 01, 02...
      const day = String(now.getDate()).padStart(2, '0'); // Día en formato 01, 02...

      const folder = `${envs.awsFolder}/${year}/${month}/`; // Carpeta por año y mes
      const uuid = uuidv4();
      const fileNameWithDate = `${day}-${uuid}.${fileExt}`; // Nombre del archivo con el día

      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: envs.awsBucketName,
          Key: `${folder}${fileNameWithDate}`,
          Body: file,
          ACL: 'public-read',
        }),
      );
      const precisionFormatted = (parseFloat(precision) || 0).toFixed(4);
      const report = await this.reportRepository.save({
        fileName: fileNameWithDate,
        precision: precisionFormatted,
        object,
        url: `${envs.awsEndpoint}/${envs.awsBucketName}/${folder}${fileNameWithDate}`,
      });

      await this.reportRepository.save(report);

      return report;
    } catch (error) {
      throw new InternalServerErrorException('Error al subir el archivo');
    }
  }

  async getReports() {
    try {
      const reports = await this.reportRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
      return reports;
    } catch (error) {}
  }
}
