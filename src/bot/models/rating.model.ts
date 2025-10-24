import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Qori } from './qori.model';
import { Ustoz } from './ustoz.model';

@Table({ tableName: 'ratings' })
export class Rating extends Model {
  @ForeignKey(() => Qori)
  @Column({ type: DataType.INTEGER })
  qoriId: number;

  @ForeignKey(() => Ustoz)
  @Column({ type: DataType.INTEGER })
  ustozId: number;

  @Column({ type: DataType.INTEGER })
  ball: number;
}
