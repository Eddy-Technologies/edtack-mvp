export function useTask() {
  const updateTaskGeneratedContent = async (taskId: string, generatedMessage: any) => {
    if (!taskId) {
      console.warn('Cannot update task content: No task ID available');
      return;
    }

    try {
      console.log('Updating task generated content for task:', props.task.id);

      const response = await $fetch(`/api/tasks/update-generation/${props.task.id}`, {
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

  return {
    updateTaskGeneratedContent
  };
}
