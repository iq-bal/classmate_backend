import { spawn } from 'child_process';
import path from 'path';
import Submission from '../../models/submissionModel.js';

class PlagiarismService {
  static async checkPlagiarism(submissionId) {
    try {
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        console.error('Submission not found for ID:', submissionId);
        throw new Error('Submission not found');
      }

      // Get previous submissions for the same assignment
      const previousSubmissions = await Submission.find({
        assignment_id: submission.assignment_id,
        _id: { $ne: submission._id }
      });

      // Prepare file paths
      const newSubmissionPath = path.join(process.cwd(), submission.file_url.replace(/^\/uploads\//, 'uploads/'));
      
      const previousSubmissionPaths = previousSubmissions.map(sub => 
        path.join(process.cwd(), sub.file_url.replace(/^\/uploads\//, 'uploads/'))
      );

      return new Promise((resolve, reject) => {
        // Run plagiarism check using Python script
        console.log('Starting Python plagiarism check process...');
        const scriptPath = path.join(process.cwd(), 'cosine_similarity/run_plagiarism_check.py');
        console.log('Python script path:', scriptPath);
        
        const pythonProcess = spawn('python3', [
          scriptPath,
          newSubmissionPath,
          ...previousSubmissionPaths
        ]);
        console.log('Python process started with arguments:', {
          newSubmissionPath,
          previousSubmissionCount: previousSubmissionPaths.length
        });

        let plagiarismScore = 0;
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
          const rawOutput = data.toString().trim();
          console.log('Raw Python output:', rawOutput);
          // Parse the last line of output which contains the score
          const lines = rawOutput.split('\n');
          const lastLine = lines[lines.length - 1];
          if (/^\d+(\.\d+)?$/.test(lastLine)) {
            plagiarismScore = parseFloat(lastLine);
            console.log(`Detected plagiarism score: ${plagiarismScore}%`);
          } else {
            console.log('Debug output:', rawOutput);
          }
        });

        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.error(`Python script error: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
          console.log(`Python process exited with code: ${code}`);
          if (code === 0) {
            try {
              // Validate and normalize plagiarism score
              console.log('Validating plagiarism score:', {
                rawScore: plagiarismScore,
                isNaN: isNaN(plagiarismScore)
              });
              const validScore = isNaN(plagiarismScore) ? 0 : Math.min(Math.max(plagiarismScore, 0), 100);
              console.log(`Final normalized plagiarism score to be saved: ${validScore}%`);
              
              // Update submission with plagiarism score
              console.log('Updating submission record with plagiarism score...');
              submission.plagiarism_score = validScore;
              await submission.save();
              console.log('Successfully updated submission with plagiarism score');
              resolve(validScore);
            } catch (error) {
              console.error('Error while saving plagiarism score:', error);
              reject(error);
            }
          } else {
            reject(new Error(`Python script failed with code ${code}\nError: ${errorOutput}`));
          }
        });

        pythonProcess.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      throw error;
    }
  }
}

export default PlagiarismService;