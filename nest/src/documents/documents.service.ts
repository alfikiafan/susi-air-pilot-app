import { Injectable } from '@nestjs/common';
import { diffDays } from '../common/utils/date.util.js';
import { ClockService } from '../core/clock.service.js';
import { DataService } from '../core/data/data.service.js';
import type {
  DocumentDto,
  DocumentStatus,
  DocumentsResponseDto,
} from './dto/document.dto.js';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  findAll(): DocumentsResponseDto {
    // The file carries its own "today"; the configured clock wins so all endpoints agree.
    const today = this.clock.today();
    const { warningDays } = this.data.documents.thresholds;

    const documents: DocumentDto[] = this.data.documents.documents
      .map(({ id, label, expiryDate }) => {
        const daysRemaining = diffDays(today, expiryDate);
        return {
          id,
          label,
          expiryDate,
          daysRemaining,
          status: documentStatus(daysRemaining, warningDays),
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { today, warningDays, documents };
  }
}

export function documentStatus(
  daysRemaining: number,
  warningDays: number,
): DocumentStatus {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= warningDays) return 'soon';
  return 'safe';
}
