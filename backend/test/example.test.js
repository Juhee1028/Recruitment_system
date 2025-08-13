const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const JobPost = require('../models/JobPost');
const { getJobs, addJob, updateJob, deleteJob } = require('../controllers/jobpostController');
const { expect } = chai;

chai.use(chaiHttp);

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