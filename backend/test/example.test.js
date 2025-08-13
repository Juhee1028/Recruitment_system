const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const JobPost = require('../models/JobPost');
const { getJobs, addJob, updateJob, deleteJob } = require('../controllers/jobpostController');
const { expect } = chai;

chai.use(chaiHttp);

describe('AddJob Functionality Test', () => {
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

        expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(createdJob)).to.be.true;

        createStub.restore();

    });

    it('should return 500 if an error occurs', async() => {
        const createStub = sinon.stub(JobPost, 'create').throws(new Error('DB Error'));

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

        createStub.restore();
    });

});