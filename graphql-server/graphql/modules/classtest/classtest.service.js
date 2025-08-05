import ClassTest from './classtest.model.js';

// Get all class tests
export const getAllClassTests = async () => {
  try {
    return await ClassTest.find();
  } catch (error) {
    throw new Error('Failed to fetch class tests');
  }
};

// Get a single class test by ID
export const getClassTestById = async (id) => {
  try {
    const classTest = await ClassTest.findById(id);
    if (!classTest) {
      throw new Error('Class test not found');
    }
    return classTest;
  } catch (error) {
    throw new Error('Failed to fetch class test');
  }
};

// Get class tests by course ID
export const getClassTestsByCourse = async (courseId) => {
  try {
    return await ClassTest.find({ course_id: courseId });
  } catch (error) {
    throw new Error('Failed to fetch class tests for course');
  }
};

// Create a new class test
export const createClassTest = async (classTestData) => {
  try {
    const newClassTest = new ClassTest(classTestData);
    return await newClassTest.save();
  } catch (error) {
    throw new Error('Failed to create class test');
  }
};

// Update a class test
export const updateClassTest = async (id, updates) => {
  try {
    const classTest = await ClassTest.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!classTest) {
      throw new Error('Class test not found');
    }
    return classTest;
  } catch (error) {
    throw new Error('Failed to update class test');
  }
};

// Delete a class test
export const deleteClassTest = async (id) => {
  try {
    const result = await ClassTest.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Class test not found');
    }
    return true;
  } catch (error) {
    throw new Error('Failed to delete class test');
  }
};