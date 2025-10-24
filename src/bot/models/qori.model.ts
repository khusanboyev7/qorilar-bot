import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Ustoz } from './ustoz.model';

@Table({ tableName: 'qorilar' })
export class Qori extends Model {
  @Column({ type: DataType.STRING })
  full_name: string;

  @Column({ type: DataType.STRING })
  username: string;

  @Column({ type: DataType.STRING })
  phone: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  ball: number;

  @ForeignKey(() => Ustoz)
  @Column({ type: DataType.INTEGER, allowNull: true })
  ustozId: number;

  @BelongsTo(() => Ustoz)
  ustoz: Ustoz;
}
