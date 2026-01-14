import mongoose from "mongoose";
//a blog would have a title, body, and authoruid attached to it (and timestamps for created at, deleted at etc which mongodb does automatically for you)
const blogSchema=mongoose.Schema({
    title: {type: String, required:true},
    body: {type: String, required: true},
    author_uid: {type: String, required: true},
    status: {type: String, enum: ['draft', 'published'], default: 'draft'},
    publishedAt: {type: Date, default: null}
},
{
    timestamps: true
}
)

const Blog= mongoose.model("Blog", blogSchema );
export default Blog;


