import Sequelize, {
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

export const sequelize = new Sequelize.Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
});

export class Profile extends Sequelize.Model<
  InferAttributes<Profile>,
  InferCreationAttributes<Profile>
> {
  declare readonly id: CreationOptional<number>;
  declare readonly firstName: string;
  declare readonly lastName: string;
  declare readonly fullName: string;
  declare readonly profession: string;
  declare readonly balance: number;
  declare readonly type: 'client' | 'contractor';
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public isClient(): this is Profile & { type: 'client' } {
    return this.type === 'client';
  }

  public isContractor(): this is Profile & { type: 'contractor' } {
    return this.type === 'contractor';
  }

  public hasEnoughBalance(price: number): boolean {
    return this.balance >= price;
  }

  public pay(price: number): void {
    if (!this.hasEnoughBalance(price)) {
      throw new Error('Insufficient funds');
    }
    this.set('balance', this.balance - price);
  }

  public deposit(amount: number): number {
    if (this.isContractor()) {
      throw new Error('Only clients can deposit funds');
    }
    return this.set('balance', this.balance + amount).balance;
  }
}
Profile.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor'),
    },
    fullName: {
      type: Sequelize.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {
    sequelize,
    modelName: 'Profile',
    version: true,
  },
);

export class Contract extends Sequelize.Model<
  InferAttributes<Contract>,
  InferCreationAttributes<Contract>
> {
  declare readonly id: CreationOptional<number>;
  declare readonly terms: string;
  declare readonly status: 'new' | 'in_progress' | 'terminated';
  declare readonly clientId: ForeignKey<Profile['id']>;
  declare readonly contractorId: ForeignKey<Profile['id']>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}
Contract.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {
    sequelize,
    modelName: 'Contract',
  },
);

export class Job extends Sequelize.Model<
  InferAttributes<Job>,
  InferCreationAttributes<Job>
> {
  declare readonly id: CreationOptional<number>;
  declare readonly description: string;
  declare readonly price: number;
  declare readonly paid: boolean;
  declare readonly paymentDate: Date;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly contractId: ForeignKey<Contract['id']>;

  public confirmPayment(at: Date): void {
    if (this.paid) {
      throw new Error('Job is already paid');
    }
    this.set('paid', true);
    this.set('paymentDate', at);
  }
}
Job.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {
    sequelize,
    modelName: 'Job',
    version: true,
  },
);

Profile.hasMany(Contract, { as: 'contractor', foreignKey: 'contractorId' });
Contract.belongsTo(Profile, { as: 'contractor' });
Profile.hasMany(Contract, { as: 'client', foreignKey: 'clientId' });
Contract.belongsTo(Profile, { as: 'client' });
Contract.hasMany(Job, { foreignKey: 'contractId' });
Job.belongsTo(Contract, { foreignKey: 'contractId' });
