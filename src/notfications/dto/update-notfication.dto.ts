import { PartialType } from '@nestjs/swagger';
import { CreateNotficationDto } from './create-notfication.dto';

export class UpdateNotficationDto extends PartialType(CreateNotficationDto) {}
