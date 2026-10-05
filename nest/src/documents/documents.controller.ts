import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service.js';
import { DocumentsResponseDto } from './dto/document.dto.js';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: "Pilot's documents with expiry status computed against today",
  })
  @ApiOkResponse({ type: DocumentsResponseDto })
  findAll(): DocumentsResponseDto {
    return this.documents.findAll();
  }
}
