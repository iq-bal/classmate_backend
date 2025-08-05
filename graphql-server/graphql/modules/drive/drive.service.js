import DriveFile from "./drive.model.js";

// Get all files in a course drive
export const getDriveFilesByCourse = async (course_id) => {
  try {
    const files = await DriveFile.find({ course_id })
      .populate({
        path: 'teacher_id',
        populate: {
          path: 'user_id',
          select: 'name email profile_picture'
        }
      })
      .populate('course_id', 'title course_code')
      .sort({ uploaded_at: -1 });
    return files;
  } catch (error) {
    console.error(`Error fetching drive files for course: ${course_id}`, error);
    throw new Error("Could not fetch drive files for this course.");
  }
};

// Get a specific drive file by ID
export const getDriveFileById = async (id) => {
  try {
    const file = await DriveFile.findById(id)
      .populate({
        path: 'teacher_id',
        populate: {
          path: 'user_id',
          select: 'name email profile_picture'
        }
      })
      .populate('course_id', 'title course_code');
    
    if (!file) {
      throw new Error('Drive file not found');
    }
    
    return file;
  } catch (error) {
    console.error(`Error fetching drive file with ID: ${id}`, error);
    throw new Error("Could not fetch drive file.");
  }
};

// Upload a file to course drive
export const uploadDriveFile = async (fileData) => {
  try {
    const newFile = await DriveFile.create(fileData);
    
    const populatedFile = await DriveFile.findById(newFile._id)
      .populate({
        path: 'teacher_id',
        populate: {
          path: 'user_id',
          select: 'name email profile_picture'
        }
      })
      .populate('course_id', 'title course_code');
    
    return populatedFile;
  } catch (error) {
    console.error("Error uploading drive file:", error);
    throw new Error("Could not upload file to drive.");
  }
};

// Delete a drive file
export const deleteDriveFile = async (id, teacher_id) => {
  try {
    const file = await DriveFile.findById(id);
    
    if (!file) {
      throw new Error('Drive file not found');
    }
    
    // Check if the teacher is authorized to delete this file
    if (file.teacher_id.toString() !== teacher_id.toString()) {
      throw new Error('Not authorized to delete this file');
    }
    
    await DriveFile.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting drive file with ID: ${id}`, error);
    throw new Error("Could not delete drive file.");
  }
};

// Update drive file description
export const updateDriveFileDescription = async (id, description, teacher_id) => {
  try {
    const file = await DriveFile.findById(id);
    
    if (!file) {
      throw new Error('Drive file not found');
    }
    
    // Check if the teacher is authorized to update this file
    if (file.teacher_id.toString() !== teacher_id.toString()) {
      throw new Error('Not authorized to update this file');
    }
    
    const updatedFile = await DriveFile.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    )
    .populate({
      path: 'teacher_id',
      populate: {
        path: 'user_id',
        select: 'name email profile_picture'
      }
    })
    .populate('course_id', 'title course_code');
    
    return updatedFile;
  } catch (error) {
    console.error(`Error updating drive file description with ID: ${id}`, error);
    throw new Error("Could not update drive file description.");
  }
};

// Rename a drive file
export const renameDriveFile = async (id, file_name, teacher_id) => {
  try {
    const file = await DriveFile.findById(id);
    
    if (!file) {
      throw new Error('Drive file not found');
    }
    
    // Check if the teacher is authorized to rename this file
    if (file.teacher_id.toString() !== teacher_id.toString()) {
      throw new Error('Not authorized to rename this file');
    }
    
    const updatedFile = await DriveFile.findByIdAndUpdate(
      id,
      { file_name },
      { new: true }
    )
    .populate({
      path: 'teacher_id',
      populate: {
        path: 'user_id',
        select: 'name email profile_picture'
      }
    })
    .populate('course_id', 'title course_code');
    
    return updatedFile;
  } catch (error) {
    console.error(`Error renaming drive file with ID: ${id}`, error);
    throw new Error("Could not rename drive file.");
  }
};

// Get files uploaded by a specific teacher
export const getDriveFilesByTeacher = async (teacher_id) => {
  try {
    const files = await DriveFile.find({ teacher_id })
      .populate({
        path: 'teacher_id',
        populate: {
          path: 'user_id',
          select: 'name email profile_picture'
        }
      })
      .populate('course_id', 'title course_code')
      .sort({ uploaded_at: -1 });
    return files;
  } catch (error) {
    console.error(`Error fetching drive files for teacher: ${teacher_id}`, error);
    throw new Error("Could not fetch drive files for this teacher.");
  }
};