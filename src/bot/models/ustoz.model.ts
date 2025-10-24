import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Qori } from './qori.model';

@Table({ tableName: 'ustozlar' })
export class Ustoz extends Model {
  @Column({ type: DataType.STRING })
  full_name: string;

  @Column({ type: DataType.STRING })
  username: string;

  @Column({ type: DataType.STRING })
  phone: string;

  @HasMany(() => Qori)
  qorilar: Qori[];
}
