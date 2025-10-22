import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'qorilar', timestamps: true })
export class Qori extends Model<Qori> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  username: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "a'zo emas",
  })
  status: string;
}
