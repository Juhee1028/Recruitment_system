const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const JobPost = require('../models/JobPost');
const AssessmentQA = require('../models/AssessmentQA');
const { updateJob,getJobs,addJob,deleteJob } = require('../controllers/jobpostController');
const { getQuestions, addQuestion, updateQuestion, deleteQuestion} = require('../controllers/assessmentQAController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

describe('AddJob Function Test', () => {

  it('should create a new job successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New job", description: "Job description", company: 'ABC Inc', location: 'Sydney', salary: 100000, deadline: "2025-12-31" }
    };

    // Mock JobPost that would be created
    const createdJob = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    // Stub JobPost.create to return the createdJob
    const createStub = sinon.stub(JobPost, 'create').resolves(createdJob);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addJob(req, res);

    // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdJob)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Job.create to throw an error
    const createStub = sinon.stub(JobPost, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Job", description: "Job description", company: 'ABC Inc', location: 'Sydney', salary: 100000, deadline: "2025-12-31" }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addJob(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});

describe('Update Function Test', () => {

  it('should update Job successfully', async () => {
    // Mock task data
    const jobId = new mongoose.Types.ObjectId();
    const existingJob = {
      _id: jobId,
      title: "Old Job",
      description: "Old Description",
      completed: false,
      deadline: new Date(),
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub Task.findById to return mock task
    const findByIdStub = sinon.stub(JobPost, 'findById').resolves(existingJob);

    // Mock request & response
    const req = {
      params: { id: jobId },
      body: { title: "New Job", completed: true }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateJob(req, res);

    // Assertions
    expect(existingJob.title).to.equal("New Job");
    expect(existingJob.completed).to.equal(true);
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if task is not found', async () => {
    const findByIdStub = sinon.stub(JobPost, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateJob(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Job not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(JobPost, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateJob(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });



});



describe('GetJobs Function Test', () => {

  it('should return jobs for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock task data
    const jobs = [
      { _id: new mongoose.Types.ObjectId(), title: "Job 1", userId },
      { _id: new mongoose.Types.ObjectId(), title: "Job 2", userId }
    ];

    // Stub Task.find to return mock tasks
    const findStub = sinon.stub(JobPost, 'find').resolves(jobs);

    // Mock request & response
    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getJobs(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(jobs)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Task.find to throw an error
    const findStub = sinon.stub(JobPost, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getJobs(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});



describe('DeleteJob Function Test', () => {

  it('should delete a Job successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock task found in the database
    const job = { remove: sinon.stub().resolves() };

    // Stub Task.findById to return the mock task
    const findByIdStub = sinon.stub(JobPost, 'findById').resolves(job);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteJob(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(job.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'job deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if job is not found', async () => {
    // Stub Task.findById to return null
    const findByIdStub = sinon.stub(JobPost, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteJob(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Job not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Task.findById to throw an error
    const findByIdStub = sinon.stub(JobPost, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteJob(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

});


//AssessmentQA Tests
describe('AddQuestion Function Test', () => {

  it('should create a new question successfully', async () => {
    // Mock request data
    const req = {
      body: { jobId: "job123", questionText: "Q1", correctAnswer: 'A', timeLimit: 600 }
    };

    const createdQuestion = { _id: new mongoose.Types.ObjectId(), ...req.body };

    const createStub = sinon.stub(AssessmentQA, 'create').resolves(createdQuestion);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addQuestion(req, res);

    // Assertions
    expect(createStub.calledOnceWith(req.body)).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdQuestion)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Job.create to throw an error
    const createStub = sinon.stub(AssessmentQA, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      body: { jobId: "job123", questionText: "Q1", correctAnswer: 'A', timeLimit: 600 }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addQuestion(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});


describe('Update Question Function Test', () => {

  it('should update Question successfully', async () => {
    // Mock task data
    const questionId = new mongoose.Types.ObjectId();
    const existingQuestion = {
      _id: questionId,
      questionText: "Old Q",
      correctAnswer: "Old Answer",
      timeLimit: 600,
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub Task.findById to return mock task
    const findByIdStub = sinon.stub(AssessmentQA, 'findById').resolves(existingQuestion);

    // Mock request & response
    const req = {
      params: { id: questionId },
      body: { questionText: "New Q", correctAnswer: "New Answer", timeLimit: 300 }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateQuestion(req, res);

    // Assertions
    expect(existingQuestion.questionText).to.equal("New Q");
    expect(existingQuestion.correctAnswer).to.equal("New Answer");
    expect(existingQuestion.timeLimit).to.equal(300);
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if task is not found', async () => {
    const findByIdStub = sinon.stub(AssessmentQA, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateQuestion(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'question not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(AssessmentQA, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateQuestion(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });
});



describe('GetQuestions Function Test', () => {

  it('should return Questions for the given user', async () => {
    // Mock user ID
    const jobId = new mongoose.Types.ObjectId();

    // Mock task data
    const questions = [
      { _id: new mongoose.Types.ObjectId(), questionText: "Q1", jobId },
      { _id: new mongoose.Types.ObjectId(), questionText: "Q2", jobId }
    ];

    // Stub Task.find to return mock tasks
    const findStub = sinon.stub(AssessmentQA, 'find').resolves(questions);

    // Mock request & response
    const req = { params: { jobId: jobId.toString() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getQuestions(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ jobId })).to.be.true;
    expect(res.json.calledWith(questions)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Task.find to throw an error
    const findStub = sinon.stub(AssessmentQA, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { job: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getQuestions(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});

describe('DeleteQuestion Function Test', () => {

  it('should delete a question successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock task found in the database
    const question = { remove: sinon.stub().resolves() };

    // Stub Task.findById to return the mock task
    const findByIdStub = sinon.stub(AssessmentQA, 'findById').resolves(question);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteQuestion(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(question.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'question deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if question is not found', async () => {
    // Stub Task.findById to return null
    const findByIdStub = sinon.stub(AssessmentQA, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteQuestion(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Question not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Task.findById to throw an error
    const findByIdStub = sinon.stub(AssessmentQA, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteQuestion(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

});