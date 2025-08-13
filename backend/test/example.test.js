const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const JobPost = require('../models/JobPost');
const AssessmentQA = require('../models/AssessmentQA');
const { getJobs, addJob, updateJob, deleteJob } = require('../controllers/jobpostController');
const { getQuestions, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/assessmentQAController');
const { expect } = chai;

chai.use(chaiHttp);

// Job Posting Functionality

describe('AddJob Functionality Test', () => {
    afterEach(() => sinon.restore());

    it('should create a new job successfully', async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: {
                title: "New Job",
                description: "Job description",
                company: "Company A",
                location: "Location A",
                salary: 50000,
                deadline: "2025-12-31",
                completed: false
            }
        };

        const createdJob = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

        const createStub = sinon.stub(JobPost, 'create').resolves(createdJob);

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await addJob(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(createdJob)).to.be.true;
    });

    it('should return 500 if an error occurs', async() => {
        sinon.stub(JobPost, 'create').throws(new Error('DB Error'));

        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { title: "New Job"}
        };

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await addJob(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
});

describe('UpdateJob Functionality Test', () => {
    afterEach(() => sinon.restore());

    it('should update job successfully', async () => {
        const jobId = new mongoose.Types.ObjectId();
        const existingJob = {
            _id: jobId,
            title: "Old Job",
            completed: false,
            save: sinon.stub().resolvesThis()
        };
        
        sinon.stub(JobPost, 'findById').resolves(existingJob);

        const req = {
            params: { id: jobId }, body: { title: "Updated Job", completed: true }
        };
        const res = { 
          status: sinon.stub().returnsThis(), 
          json: sinon.spy() 
        };

        await updateJob(req, res);

        expect(existingJob.title).to.equal("Updated Job");
        expect(existingJob.completed).to.equal(true);
        expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if job is not found', async () => {
        sinon.stub(JobPost, 'findById').resolves(null);

        const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await updateJob(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Job not found' })).to.be.true;
    });

    it('should return 500 on error', async () => {
        sinon.stub(JobPost, 'findById').throws(new Error('DB Error'));

        const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await updateJob(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
});

describe('GetJobs Functionality Test', () => {
  afterEach(() => sinon.restore());

  it('should return jobs for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();

    const jobs = [
      { _id: new mongoose.Types.ObjectId(), title: "Job 1", userId },
      { _id: new mongoose.Types.ObjectId(), title: "Job 2", userId }
    ];

    sinon.stub(JobPost, 'find').resolves(jobs);

    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getJobs(req, res);

    expect(res.json.calledWith(jobs)).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(JobPost, 'find').throws(new Error('DB Error'));

    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getJobs(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('DeleteJob Functionality Test', () => {
  afterEach(() => sinon.restore());
  
  it('should delete a job successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() }};
    const job = { remove: sinon.stub().resolves() };

    sinon.stub(JobPost, 'findById').resolves(job);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteJob(req, res);

    expect(job.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Job deleted' })).to.be.true;

  });

  it('should return 404 if job is not found', async () => {
    const findByIdStub = sinon.stub(JobPost, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteJob(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Job not found' })).to.be.true;

  });

  it('should return 500 if an error occurs', async() => {
    sinon.stub(JobPost, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteJob(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

  });

});

// Assessment Question and Answer Functionality Test

describe('AddQuestion Functionality Test', () => {
  afterEach(() => sinon.restore());

  it('should add a new question successfully', async() => {
    const req = {
      body: {
        jobId: new mongoose.Types.ObjectId(),
        questionText: "New Question",
        correctAnswer: "New Answer",
        timeLimit: 60
      }
    };

      const createdQuestion = { _id: new mongoose.Types.ObjectId(), ...req.body};
      sinon.stub(AssessmentQA, 'create').resolves(createdQuestion);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await addQuestion(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdQuestion)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(AssessmentQA, 'create').throws(new Error('DB Error'));

    const req = {
      body: {
        jobId: new mongoose.Types.ObjectId(),
        questionText: "New Question"
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addQuestion(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});

describe('UpdateQuestion Functionality Test', () => {
  afterEach(() => sinon.restore());

  it('should update question successfully', async () => {
    const questionId = new mongoose.Types.ObjectId();
    const existingQuestion = {
      _id: questionId,
      questionText: "Old Question",
      correctAnswer: "Old Answer",
      timeLimit: 30,
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(AssessmentQA, 'findById').resolves(existingQuestion);

    const req = {
      params: { id: questionId },
      body: { 
        questionText: "Updated Question", 
        correctAnswer: "Updated Answer", 
        timeLimit: 60
      }
    };

    const res = {
      status: sinon.stub().returnsThis(), json: sinon.spy()
    };

    await updateQuestion(req, res);

    expect(existingQuestion.questionText).to.equal("Udated Question");
    expect(existingQuestion.correctAnswer).to.equal("Updated Answer");
    expect(existingQuestion.timeLimit).to.equal(60);
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 404 if question is not found', async() => {
    sinon.stub(AssessmentQA, 'findById').resolves(null);

    const req = {
      params: { id: new mongoose.Types.ObjectId() },
      body: {}
    };

    const res = {
      status: sinon.stub().returnsThis(), json: sinon.spy()
    };

    await updateQuestion(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'question not found' })).to.be.true;
  });

  it('should return 500 on error', async() => {
    sinon.stub(AssessmentQA, 'findById').throws(new Error('DB Error'));

    const req = {
      params: { id: new mongoose.Types.ObjectId() },
      body: {}
    };

    const res = {
      status: sinon.stub().returnsThis(), json: sinon.spy()
    };

    await updateQuestion(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('GetQuestions Functionality Test', () => {
  afterEach(() => sinon.restore());

  it('should return questions for a job', async () => {
    const jobId = new mongoose.Types.ObjectId();
    const questions = [
      { _id: new mongoose.Types.ObjectId(), questionText: "Q1", jobId },
      { _id: new mongoose.Types.ObjectId(), questionText: "Q2", jobId }
    ];

    sinon.stub(AssessmentQA, 'find').resolves(questions);

    const req = { params: {jobId} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getQuestions(req, res);

    expect(res.json.calledWith(questions)).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(AssessmentQA, 'find').throws(new Error('DB Error'));

    const req = { params: { jobId: new mongoose.Types.ObjectId() }};
    const res = { 
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getQuestions(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('DeleteQuestion Functionality Test', () => {
  afterEach(() => sinon.restore());

  it('should delete a question successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() }};
    const question = { remove: sinon.stub().resolves()};

    sinon.stub(AssessmentQA, 'findById').resolves(question);

    const res = {
      status: sinon.stub().returnsThis(), json: sinon.spy() 
    };

    await deleteQuestion(req, res);

    expect(question.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'question deleted' })).to.be.true;
  });

  it('should return 404 if question is not found', async () => {
    sinon.stub(AssessmentQA, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy()};

    await deleteQuestion(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'question not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(AssessmentQA, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteQuestion(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});