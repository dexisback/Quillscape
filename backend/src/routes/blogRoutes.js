


import express from "express";
import axios from "axios";
import { verifyAuth } from "../middleware/auth.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";




const router= express.Router();


//test:
router.get("/", (req, res)=>{
    res.send("hellow, youre in the /blog endpoint")
})



router.get("/public", async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(50);
        
        
        const blogsWithAuthors = await Promise.all(
            blogs.map(async (blog) => {
                const author = await User.findOne({ firebaseUid: blog.author_uid });
                return {
                    ...blog.toObject(),
                    author_email: author ? author.email : 'Anonymous',
                    author_uid: undefined   //no external should have access to author_uid
                };
            })
        );
        
        res.status(200).json(blogsWithAuthors);
    } catch (err) {
        console.error("failed to fetch public blogs", err);
        res.status(500).send({ msg: "server error fetching public blogs" });
    }
});




router.get("/me", verifyAuth, async (req, res)=>{
try {
    const userBlogs= await Blog.find({author_uid : req.user.uid}); //finds all the blogs of the user
    res.status(201).json(userBlogs)         
} catch (error) {
    console.error("sorry no blogs of the user exist!")
}

})


//creating a blog (supports status: 'draft' or 'published')
router.post("/post", verifyAuth, async (req, res)=>{
    try {
    const { title, body, status } = req.body;
    const blogStatus = status === 'published' ? 'published' : 'draft';
    
    const newBlog= new Blog({
        title,
        body,
        author_uid : req.user.uid,
        status: blogStatus,
        publishedAt: blogStatus === 'published' ? new Date() : null
    })
    await newBlog.save();
    res.status(201).json({ msg: `Blog ${blogStatus === 'published' ? 'published' : 'saved as draft'}`, blog: newBlog });
} catch (error) {
        console.error("error creating blog:", error);
        res.status(500).send({ msg: "Failed to create blog" });
    }
})


//deleting a particular blog
router.delete("/delete/:id", verifyAuth, async(req, res)=>{
    try {
        const blog_id=req.params.id;
    const author_uid=req.user.uid;
    //findOneAndDelete prevents user B from deleting user A's blog even tho if they have user A's credentials
    const deletedBlogs= await Blog.findOneAndDelete({
        _id: blog_id,
        author_uid : author_uid
    })

    if(!deletedBlogs){
        return res.status(404).send({msg: "couldnt find your blog"})
    }
    res.status(200).send("blog succesfully yeeted")        
    } catch (error) {
        res.status(404).send({msg: "invalid auth creds"})
    }

})


//get blogs by id (for anyone with the link, or public blogs, etc):
router.get("/:id", async(req, res)=>{
    try {
        const blog= await Blog.findById(req.params.id);
    if(!blog){
        res.status(404).send({msg: "sorry blog not found"})
    }


    // res.status(200).json(blog);        
    //only return published blogs to the public
    if(blog.status !== "published"){return res.status(403).send({msg: "this blog is a draft, unauthorised access"})}
    res.status(200).json(blog);
    } catch (error) {
        console.error("invalid blog id");
    }
})



//put blogs by id (supports updating status to publish a draft)
router.put("/:id", verifyAuth, async(req, res)=>{
    try {
        const { title, body, status }= req.body;
        const blogId= req.params.id;
        
        const updateData = { title, body };
        
        // If status is being changed to published, set publishedAt
        if (status === 'published') {
            updateData.status = 'published';
            updateData.publishedAt = new Date();
        } else if (status === 'draft') {
            updateData.status = 'draft';
            updateData.publishedAt = null;
        }
        
        const updatedBlog = await Blog.findOneAndUpdate(
            {_id: blogId, author_uid: req.user.uid },
            updateData,
            { new: true }
        ) 

        if(!updatedBlog){return res.status(404).send({msg: "sorry the blog doesnt exist"})}
        res.status(200).json({msg: "blog updated successfully", blog: updatedBlog})
    } catch (error) {
        console.error("sorry blog not found w the given id");
        res.status(404).send({msg: "sorry blog not found w the given id"})        
    }
})



export default router;








