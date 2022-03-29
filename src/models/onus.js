const mongoose = require('mongoose');
const { Schema } = mongoose;

//Make a Onus schema
/*
{ 
"Puerto" : "",
    "Olt_id" : 1,
    "LocalInfo" : {},
    "OltInfo" : {}
}
*/
const OnusSchema = new Schema({
    Puerto: {
        type: String,
        required: true
    },
    PON: {
        type: String,
        required: true
    },
    Olt_id: {
        type: Schema.ObjectId,
        required: true
    },
    LocalInfo: {
        type: Object,
        required: true
    },
    OltInfo: {
        type: Object,
        required: true
    }
});
//make a function to insert or update a Onus
OnusSchema.statics.upsertFn = function(query, doc, options, callback) {
    const self = this;
    return self.findOneAndUpdate(query, doc, options, callback);
};

//export the model
module.exports = mongoose.model('Onus', OnusSchema);