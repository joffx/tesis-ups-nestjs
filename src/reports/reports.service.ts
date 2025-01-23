import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { envs } from 'src/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, MoreThan, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import axios from 'axios';
import { performance } from 'perf_hooks';

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
      const start = performance.now();
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
      const precisionFormatted = parseFloat(precision).toFixed(4);
      const report = await this.reportRepository.save({
        fileName: fileNameWithDate,
        precision: parseFloat(precisionFormatted),
        object,
        url: `${envs.awsEndpoint}/${envs.awsBucketName}/${folder}${fileNameWithDate}`,
      });

      await this.reportRepository.save(report);
      const chat_id_telegram = '-4635919852';
      const message = `Se ha detectado una arma de fuego. Precisión: ${precisionFormatted}. Imagen: ${report.url}`;
      const telegramApiUrl =
        'https://api.telegram.org/bot7648964628:AAH2VTZ-wR5NE27GKsTvwvQyHi7f4wVatII/sendMessage';
      const telegramMessage = {
        chat_id: chat_id_telegram,
        text: message,
      };

      await axios.post(telegramApiUrl, telegramMessage);

      const end = performance.now();

      return {
        ...report,
        uploadTime: (end - start)/1000,
      };
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

  async alertEsp32(): Promise<number> {
    try {
      const twoMinutesAgo = new Date();
      twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 1);

      // Buscar reportes creados en los últimos dos minutos
      const recentReport = await this.reportRepository.findOne({
        where: {
          createdAt: MoreThan(twoMinutesAgo),
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return recentReport ? 2 : 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al verificar reportes recientes',
      );
    }
  }
}
