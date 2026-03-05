import User, { type UserRole } from "../models/user.model";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assigned_area: string;
  franchise_id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateUserRecordPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  assigned_area?: string;
  franchise_id?: string;
};

const mapUserRecord = (user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assigned_area: string;
  franchise_id: string;
  createdAt: Date;
  updatedAt: Date;
}): UserRecord => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    assigned_area: user.assigned_area,
    franchise_id: user.franchise_id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

class UserRepository {
  async findById(id: string): Promise<UserRecord | null> {
    const user = await User.findOne({ id })
      .select({
        id: 1,
        name: 1,
        email: 1,
        phone: 1,
        role: 1,
        assigned_area: 1,
        franchise_id: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    if (!user) {
      return null;
    }

    return mapUserRecord(user);
  }

  async findAll(): Promise<UserRecord[]> {
    const users = await User.find()
      .select({
        id: 1,
        name: 1,
        email: 1,
        phone: 1,
        role: 1,
        assigned_area: 1,
        franchise_id: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ createdAt: -1 })
      .lean();

    return users.map((user) => mapUserRecord(user));
  }

  async updateById(
    id: string,
    payload: UpdateUserRecordPayload,
  ): Promise<UserRecord | null> {
    const user = await User.findOneAndUpdate({ id }, payload, {
      new: true,
      runValidators: true,
    })
      .select({
        id: 1,
        name: 1,
        email: 1,
        phone: 1,
        role: 1,
        assigned_area: 1,
        franchise_id: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    if (!user) {
      return null;
    }

    return mapUserRecord(user);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await User.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async assignArea(
    userId: string,
    assignedArea: string,
  ): Promise<UserRecord | null> {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $set: { assigned_area: assignedArea } },
      {
        new: true,
        runValidators: true,
      },
    )
      .select({
        id: 1,
        name: 1,
        email: 1,
        phone: 1,
        role: 1,
        assigned_area: 1,
        franchise_id: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    if (!user) {
      return null;
    }

    return mapUserRecord(user);
  }
}

export const userRepository = new UserRepository();
