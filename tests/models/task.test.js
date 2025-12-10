/**
 * Task Model Tests
 */

import Task from '../../models/Task.js';
import User from '../../models/User.js';

describe('Task Model', () => {
  describe('Task Creation', () => {
    test('should create a new task', async () => {
      const taskData = {
        taskName: 'Test Task',
        rewardPoints: 50
      };

      const task = await Task.create(taskData);
      
      expect(task).toBeDefined();
      expect(task.taskName).toBe('Test Task');
      expect(task.rewardPoints).toBe(50);
      expect(Array.isArray(task.completedBy)).toBe(true);
      expect(task.completedBy.length).toBe(0);
    });

    test('should have default empty completedBy array', async () => {
      const task = await Task.create({
        taskName: 'Test Task 2',
        rewardPoints: 45
      });
      
      expect(task.completedBy).toBeDefined();
      expect(Array.isArray(task.completedBy)).toBe(true);
    });

    test('should track completed users', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'taskuser@example.com',
        password: 'password123',
        username: 'taskuser'
      });

      const task = await Task.create({
        taskName: 'Test Task 3',
        rewardPoints: 55
      });

      task.completedBy.push(user._id);
      await task.save();

      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.completedBy.length).toBe(1);
      expect(updatedTask.completedBy[0].toString()).toBe(user._id.toString());
    });
  });
});

