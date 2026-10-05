import { ApiProperty } from '@nestjs/swagger';

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export class DocumentDto {
  @ApiProperty({ example: 'doc_medical' })
  id: string;

  @ApiProperty({ example: 'Indonesian Medical Exp. Date' })
  label: string;

  @ApiProperty({ example: '2026-06-11' })
  expiryDate: string;

  @ApiProperty({
    example: 27,
    description: 'expiryDate - today, in days. Zero or negative means expired.',
  })
  daysRemaining: number;

  @ApiProperty({
    enum: ['expired', 'soon', 'safe'],
    description:
      'expired: daysRemaining <= 0 · soon: within warningDays · safe: otherwise',
  })
  status: DocumentStatus;
}

export class DocumentsResponseDto {
  @ApiProperty({ example: '2026-05-15' })
  today: string;

  @ApiProperty({ example: 30 })
  warningDays: number;

  @ApiProperty({ type: [DocumentDto], description: 'Most urgent first' })
  documents: DocumentDto[];
}
