import { type UserRole } from "../models/user.model";
import {
  type UserRecord,
  userRepository,
} from "../repositories/user.repository";

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  assigned_area?: string;
  franchise_id?: string;
};

export type AssignAreaPayload = {
  userId: string;
  assigned_area: string;
};

type UserServiceResponse = {
  message: string;
  data?: UserRecord | UserRecord[] | null;
};

class UserService {
  async getUserById(id: string): Promise<UserServiceResponse> {
    const user = await userRepository.findById(id);

    if (!user) {
      return { message: "User not found", data: null };
    }

    return { message: "User fetched successfully", data: user };
  }

  async getUsers(): Promise<UserServiceResponse> {
    const users = await userRepository.findAll();
    return { message: "Users fetched successfully", data: users };
  }

  async updateUser(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<UserServiceResponse> {
    const updatedUser = await userRepository.updateById(id, payload);

    if (!updatedUser) {
      return { message: "User not found", data: null };
    }

    return { message: "User updated successfully", data: updatedUser };
  }

  async deleteUser(id: string): Promise<UserServiceResponse> {
    const isDeleted = await userRepository.deleteById(id);

    if (!isDeleted) {
      return { message: "User not found", data: null };
    }

    return { message: "User deleted successfully", data: null };
  }

  async assignArea(payload: AssignAreaPayload): Promise<UserServiceResponse> {
    const updatedUser = await userRepository.assignArea(
      payload.userId,
      payload.assigned_area,
    );

    if (!updatedUser) {
      return { message: "User not found", data: null };
    }

    return { message: "Area assigned successfully", data: updatedUser };
  }
}

export const userService = new UserService();
