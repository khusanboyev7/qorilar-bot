import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @Column({ type: DataType.STRING, allowNull: false })
  full_name: string;

  @Column({ type: DataType.STRING })
  phone: string;

  @Column({ type: DataType.BIGINT, unique: true })
  telegram_id: number;

  @Column({ type: DataType.ENUM('qori', 'ustoz'), defaultValue: 'qori' })
  role: 'qori' | 'ustoz';

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  score: number; // reyting uchun ball
}
