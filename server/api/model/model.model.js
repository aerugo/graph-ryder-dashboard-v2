'use strict';

import mongoose from 'mongoose';

var ModelSchema = new mongoose.Schema({
  label: String,
  color: String,
  labeling: String,
  children: Array,
  parents: Array
});

export default mongoose.model('Model', ModelSchema);
