import * as TasksRepository from '../repository/tasks-repository';

export const getAllTasks = async (userId: number) => {

    if (!userId) return { status: 401, body: { error: 'Unauthorized' } };

    try {
        const tasks = await TasksRepository.getAllUserTasks(userId);

        return { status: 200, body: { tasks, total: tasks.length } }

    } catch (error) {
        return { status: 500, body: { error: 'Server error' } }
    }
};

export const createTask = async (userId: number, title: string, description: string, rawDueDate: string) => {
    if (!userId) return { status: 400, body: { error: 'User id not specified.' } };

    if (!title || !description || !rawDueDate) {
        return { status: 400, body: { error: 'POST requires: title, description and dueDate' } }
    }

    const dueDate = new Date(rawDueDate);
    dueDate.setSeconds(0);
    dueDate.setMilliseconds(0);

    if (isNaN(dueDate.getTime())) {
        return { status: 400, body: { error: 'Invalid date format.' } };
    }

    try {

        const now = new Date();
        const createdTask = await TasksRepository.createTask(title, description, dueDate, userId, now);

        return { status: 201, body: { createdTask } };

    } catch (error) {
        return { status: 500, body: { error: 'Server error.' } };
    };
};

export const updateFullTask = async (taskId: number, userId: number, title: string, description: string, dueDate: Date, done: boolean) => {

    if (isNaN(taskId)) return { status: 200, body: { error: 'Invalid task id.' } };

    if (!title || !description || dueDate === undefined || done === undefined) {
        return { status: 400, body: { error: 'PUT requires a full task payload.' } }
    };

    try {

        const existingTask = await TasksRepository.verifyTaskExists(taskId, userId);

        if (!existingTask) return { status: 404, body: { error: 'Task not found.' } };

        const taskUpdated = await TasksRepository.updateTask(taskId, {title, description, done, dueDate});

        return { status: 200, body: { taskUpdated } };


    } catch (error) {
        return { status: 500, body: { error: 'Server error.' } };
    };
};

export const updateTaskPiece = async (taskId: number, userId: number, dataToUpdate: Record<string, any>) => {
    
    try {
        
        if (Object.keys(dataToUpdate).length === 0) return { status: 400, body: { error: 'No valid fields to update.' }} ;

        const existingTask = await TasksRepository.verifyTaskExists(taskId, userId);

        if (!existingTask) return { status: 404, body: { error: 'Task not found.' } } ;

        const updatedTask = await TasksRepository.updateTask(taskId, {...dataToUpdate});

        return { status: 200, body: { updatedTask } };

    } catch (error) {
        return { status: 500, body: { error: 'Server error.' } };
    };
}