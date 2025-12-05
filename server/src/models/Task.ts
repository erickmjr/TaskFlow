export interface TaskModel {
    id: number;
    createdAt: Date;
    title: string;
    description: string | null;
    dueDate: Date | null;
    updatedAt: Date;
    done: boolean;
    userId: number;
}