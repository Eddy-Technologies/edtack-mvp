export interface CreateTaskReq {
  assigneeUserInfoId: string;
  subject: string;
  lessonGenerationType: string;
  creditsPerQuiz: number;
  requiredScore: number;
  chapters: string[];
}

export function useTask() {
  const updateTaskGeneratedContent = async (taskId: string, generatedMessage: any) => {
    if (!taskId) {
      console.warn('Cannot update task content: No task ID available');
      return;
    }

    try {
      console.log('Updating task generated content for task:', taskId);

      const response = await $fetch(`/api/tasks/update-generation/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generated_content: generatedMessage,
        }),
      });

      if (response.success) {
        console.log('Successfully updated task generated content');
      }
    } catch (error) {
      console.error('Failed to update task generated content:', error);
    }
  };

  const createTask = async (taskData: CreateTaskReq) => {
    try {
      const response = await $fetch('/api/tasks/create', {
        method: 'POST',
        body: taskData
      });

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
      throw new Error(error.data?.message || 'Failed to create task. Please try again.');
    }
  };

  return {
    updateTaskGeneratedContent,
    createTask,
  };
}
