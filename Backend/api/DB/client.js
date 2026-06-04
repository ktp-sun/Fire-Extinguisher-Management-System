const mongoose = require('mongoose');

const COLLECTION_NAME = 'client';

const Schema = new mongoose.Schema({}, { strict: false });

const CompanyModel = mongoose.model(
    COLLECTION_NAME,
    Schema,
    COLLECTION_NAME
);

module.exports = CompanyModel;  // Changed from Model to ClientModel